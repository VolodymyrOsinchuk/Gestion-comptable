import { Op, fn, col, literal } from "sequelize";
import sequelize from "../config/db.js";
import AccountingEntry from "../models/AccountingEntry.js";
import ChartOfAccounts from "../models/ChartOfAccounts.js";
import Company from "../models/Company.js";
import TvaDeclaration from "../models/TVAReport.js";
import TvaDeclarationLine from "../models/TVAItem.js";

const round2 = (n) => Math.round(Number(n) * 100) / 100;

// PCG VAT account ranges
const VAT_ACCOUNT_PATTERNS = {
  collectee: [/^44571/, /^44572/],
  deductible_abs: [/^44566/, /^44567/],
  deductible_immob: [/^4452/, /^44562/],
  importation: [/^4456[89]/],
  intracommunautaire: [/^4458[36]/, /^4452[01]/],
  autoliquidation: [/^4458[05]/, /^4452[23]/],
  regularisation: [/^4458[1-49]/, /^4457[3-9]/],
};

const VAT_TYPE_LABELS = {
  collectee: "TVA collectée",
  deductible_abs: "TVA déductible (ABS)",
  deductible_immob: "TVA déductible immobilisations",
  importation: "TVA sur importations",
  intracommunautaire: "TVA intracommunautaire",
  autoliquidation: "TVA autoliquidation",
  regularisation: "Régularisations",
};

function detectVatType(accountNumber) {
  for (const [type, patterns] of Object.entries(VAT_ACCOUNT_PATTERNS)) {
    for (const pattern of patterns) {
      if (pattern.test(accountNumber)) return type;
    }
  }
  return null;
}

function detectFrequency(company) {
  if (company.tva_frequency) return company.tva_frequency;
  const regimeMap = { normal: "monthly", simplifie: "quarterly", reel: "monthly", franchise: "yearly" };
  return regimeMap[company.tva_regime] || "monthly";
}

function getPeriodRange(year, period, frequency) {
  if (frequency === "yearly") {
    return {
      start: `${year}-01-01`,
      end: `${year}-12-31`,
      label: String(year),
    };
  }
  if (frequency === "quarterly") {
    const qMap = { 1: [1, 3], 2: [4, 6], 3: [7, 9], 4: [10, 12] };
    const [sm, em] = qMap[Number(period)] || qMap[1];
    return {
      start: `${year}-${String(sm).padStart(2, "0")}-01`,
      end: `${year}-${String(em).padStart(2, "0")}-28`,
      label: `${year}-Q${period}`,
    };
  }
  const m = String(Number(period)).padStart(2, "0");
  return {
    start: `${year}-${m}-01`,
    end: `${year}-${m}-28`,
    label: `${year}-${m}`,
  };
}

function getCurrentPeriod(company) {
  const freq = detectFrequency(company);
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;

  if (freq === "yearly") return { start: `${year}-01-01`, end: `${year}-12-31`, label: String(year), frequency: freq };
  if (freq === "quarterly") {
    const q = Math.ceil(month / 3);
    const range = getPeriodRange(year, q, "quarterly");
    return { ...range, frequency: freq };
  }
  const range = getPeriodRange(year, month, "monthly");
  return { ...range, frequency: freq };
}

// Main computation: scan validated entries and compute VAT
export async function computeVatForPeriod(companyId, periodStart, periodEnd) {
  const entries = await AccountingEntry.findAll({
    where: {
      company_id: companyId,
      is_validated: true,
      entry_date: { [Op.between]: [periodStart, periodEnd] },
    },
    order: [["entry_date", "ASC"], ["id", "ASC"]],
  });

  const chartAccounts = await ChartOfAccounts.findAll({
    where: { company_id: companyId },
    attributes: ["account_number", "default_tva_rate", "tva_applicable", "account_label"],
  });
  const chartMap = {};
  for (const ca of chartAccounts) {
    chartMap[ca.account_number] = ca;
  }

  const vatEntries = []; // [{ entry, vatType, baseAmount, taxRate }]
  const processedEntryNumbers = new Set();

  // Pass 1: Identify VAT entries and find their counter-entries
  for (const entry of entries) {
    const vatType = detectVatType(entry.account_number);
    if (!vatType) continue;
    if (processedEntryNumbers.has(entry.entry_number)) continue;

    // Find all entries with same entry_number to get the counter-entry (base HT)
    const group = entries.filter((e) => e.entry_number === entry.entry_number);
    const vatEntry = group.find((e) => detectVatType(e.account_number));
    if (!vatEntry) continue;

    // The counter-entry is the non-VAT account in the same entry_number group
    // For collectee: counter is a revenue account (class 7) - credit side
    // For deductible: counter is an expense account (class 6) - debit side
    const counterEntries = group.filter((e) => !detectVatType(e.account_number));
    const vatAmount = Number(vatEntry.debit || 0) + Number(vatEntry.credit || 0);

    let baseAmount = 0;
    let counterAccount = null;

    if (vatType === "collectee") {
      // VAT collectée is on credit side → counter is debit (revenue)
      const counter = counterEntries.find((e) => Number(e.debit) > 0 && e.account_number.charAt(0) === "7");
      if (counter) {
        baseAmount = Number(counter.debit || 0);
        counterAccount = counter.account_number;
      } else {
        // Fallback: use total of non-VAT debits
        baseAmount = counterEntries.reduce((s, e) => s + Number(e.debit || 0), 0) -
                     counterEntries.reduce((s, e) => s + Number(e.credit || 0), 0);
        if (baseAmount < 0) baseAmount = Math.abs(baseAmount);
        counterAccount = counterEntries[0]?.account_number || null;
      }
    } else {
      // VAT deductible is on debit side → counter is credit (expense/asset)
      const counter = counterEntries.find((e) => Number(e.credit) > 0 && e.account_number.charAt(0) !== "4");
      if (counter) {
        baseAmount = Number(counter.credit || 0);
        counterAccount = counter.account_number;
      } else {
        const creditTotal = counterEntries.reduce((s, e) => s + Number(e.credit || 0), 0);
        const debitTotal = counterEntries.reduce((s, e) => s + Number(e.debit || 0), 0);
        baseAmount = creditTotal - debitTotal;
        if (baseAmount < 0) baseAmount = Math.abs(baseAmount);
        counterAccount = counterEntries[0]?.account_number || null;
      }
    }

    // Determine tax rate: from chartAccount or compute from ratio
    let taxRate = Number(chartMap[vatEntry.account_number]?.default_tva_rate || 0);
    if (!taxRate && baseAmount > 0) {
      taxRate = round2((vatAmount / baseAmount) * 100);
    }

    processedEntryNumbers.add(entry.entry_number);
    vatEntries.push({
      entry: vatEntry,
      vatType,
      baseAmount: round2(baseAmount),
      taxAmount: round2(vatAmount),
      ttcAmount: round2(baseAmount + vatAmount),
      taxRate: round2(taxRate),
      counterAccount,
      label: vatEntry.label,
    });
  }

  // Group by vatType + taxRate for summary
  const summary = {};
  for (const ve of vatEntries) {
    const key = `${ve.vatType}_${ve.taxRate}`;
    if (!summary[key]) {
      summary[key] = {
        vatType: ve.vatType,
        taxRate: ve.taxRate,
        baseAmount: 0,
        taxAmount: 0,
        ttcAmount: 0,
        count: 0,
        lines: [],
      };
    }
    summary[key].baseAmount += ve.baseAmount;
    summary[key].taxAmount += ve.taxAmount;
    summary[key].ttcAmount += ve.ttcAmount;
    summary[key].count++;
    summary[key].lines.push(ve);
  }

  // Compute totals by vatType
  const totals = {
    collectee: 0,
    deductible_abs: 0,
    deductible_immob: 0,
    importation: 0,
    intracommunautaire: 0,
    autoliquidation: 0,
    regularisation: 0,
  };
  for (const ve of vatEntries) {
    if (totals[ve.vatType] !== undefined) {
      totals[ve.vatType] += ve.taxAmount;
    }
  }

  const totalCollectee = round2(totals.collectee);
  const totalDeductibleAll = round2(
    totals.deductible_abs + totals.deductible_immob +
    totals.importation + totals.intracommunautaire + totals.autoliquidation +
    totals.regularisation
  );
  const netDue = round2(totalCollectee - totalDeductibleAll);
  const creditTva = netDue < 0 ? round2(Math.abs(netDue)) : 0;

  return {
    vatEntries: vatEntries.map((v) => ({
      vatType: v.vatType,
      accountNumber: v.entry.account_number,
      counterAccount: v.counterAccount,
      baseAmount: v.baseAmount,
      taxRate: v.taxRate,
      taxAmount: v.taxAmount,
      ttcAmount: v.ttcAmount,
      entryNumber: v.entry.entry_number,
      entryDate: v.entry.entry_date,
      fiscalYear: v.entry.fiscal_year,
      label: v.label,
    })),
    summary: Object.values(summary).map((s) => ({
      vatType: s.vatType,
      vatTypeLabel: VAT_TYPE_LABELS[s.vatType] || s.vatType,
      taxRate: s.taxRate,
      baseAmount: round2(s.baseAmount),
      taxAmount: round2(s.taxAmount),
      ttcAmount: round2(s.ttcAmount),
      count: s.count,
    })),
    totals: {
      collectee: totalCollectee,
      deductible_abs: round2(totals.deductible_abs),
      deductible_immob: round2(totals.deductible_immob),
      deductible_all: totalDeductibleAll,
      net_due: netDue,
      credit_tva: creditTva,
    },
  };
}

// Generate (or regenerate) a declaration for a period
export async function generateDeclaration(companyId, periodStart, periodEnd, options = {}) {
  const { transaction: t } = options;

  const company = await Company.findByPk(companyId, { transaction: t });
  if (!company) throw new Error("Company not found");

  const freq = detectFrequency(company);
  const range = getPeriodRange(
    new Date(periodStart).getFullYear(),
    freq === "yearly" ? 1 : freq === "quarterly" ? Math.ceil((new Date(periodStart).getMonth() + 1) / 3) : new Date(periodStart).getMonth() + 1,
    freq
  );

  // Check existing un-locked declaration for this period
  const existing = await TvaDeclaration.findOne({
    where: {
      company_id: companyId,
      period_start: periodStart,
      period_end: periodEnd,
      status: { [Op.notIn]: ["locked"] },
    },
    transaction: t,
  });

  if (existing && existing.status === "locked") {
    throw new Error("Cette période est verrouillée. Déverrouillez-la d'abord.");
  }

  // Compute VAT from validated entries
  const computed = await computeVatForPeriod(companyId, periodStart, periodEnd);

  let declaration;
  if (existing) {
    declaration = existing;
    await TvaDeclarationLine.destroy({
      where: { tva_report_id: existing.id },
      transaction: t,
    });
  }

  declaration = await TvaDeclaration.create({
    company_id: companyId,
    period_start: periodStart,
    period_end: periodEnd,
    period_label: range.label,
    frequency: freq,
    status: "computed",
    total_collectee: computed.totals.collectee,
    total_deductible_abs: computed.totals.deductible_abs,
    total_deductible_immob: computed.totals.deductible_immob,
    net_due: computed.totals.net_due,
    credit_tva: computed.totals.credit_tva,
  }, { transaction: t });

  // Create lines
  const linesData = computed.vatEntries.map((ve) => ({
    tva_report_id: declaration.id,
    vat_type: ve.vatType,
    account_number: ve.accountNumber,
    counter_account: ve.counterAccount,
    base_amount: ve.baseAmount || 0,
    tax_rate: ve.taxRate || 0,
    tax_amount: ve.taxAmount || 0,
    ttc_amount: ve.ttcAmount || 0,
    entry_number: ve.entryNumber,
    entry_date: ve.entryDate,
    fiscal_year: ve.fiscalYear,
    label: ve.label,
  }));

  if (linesData.length > 0) {
    await TvaDeclarationLine.bulkCreate(linesData, { transaction: t });
  }

  const lines = await TvaDeclarationLine.findAll({
    where: { tva_report_id: declaration.id },
    transaction: t,
  });

  return {
    declaration,
    lines,
    summary: computed.summary,
    totals: computed.totals,
  };
}

// Lock a declaration period (prevents modifications)
export async function lockDeclaration(declarationId) {
  const declaration = await TvaDeclaration.findByPk(declarationId);
  if (!declaration) throw new Error("Déclaration introuvable");
  if (declaration.status === "locked") throw new Error("Déjà verrouillée");

  declaration.status = "locked";
  declaration.locked_at = new Date();
  await declaration.save();

  return declaration;
}

// Unlock a declaration (special procedure)
export async function unlockDeclaration(declarationId) {
  const declaration = await TvaDeclaration.findByPk(declarationId);
  if (!declaration) throw new Error("Déclaration introuvable");

  declaration.status = "computed";
  declaration.locked_at = null;
  await declaration.save();

  return declaration;
}

// Get VAT status for a company
export async function getVatStatus(companyId) {
  const company = await Company.findByPk(companyId);
  if (!company) throw new Error("Company not found");

  const freq = detectFrequency(company);
  const currentPeriod = getCurrentPeriod(company);

  const currentDeclaration = await TvaDeclaration.findOne({
    where: {
      company_id: companyId,
      period_start: currentPeriod.start,
      period_end: currentPeriod.end,
    },
  });

  const recent = await TvaDeclaration.findAll({
    where: { company_id: companyId },
    order: [["period_start", "DESC"]],
    limit: 12,
  });

  return {
    company: { id: company.id, name: company.name, tva_regime: company.tva_regime, tva_frequency: freq },
    currentPeriod,
    currentDeclaration,
    recentDeclarations: recent,
    pendingPeriod: !currentDeclaration || currentDeclaration.status === "draft",
  };
}

// Recompute all open (non-locked) declarations for a company when entries change
export async function recomputeOpenDeclarations(companyId) {
  const open = await TvaDeclaration.findAll({
    where: {
      company_id: companyId,
      status: { [Op.notIn]: ["locked"] },
    },
  });

  const results = [];
  for (const decl of open) {
    try {
      const result = await generateDeclaration(companyId, decl.period_start, decl.period_end);
      results.push({ id: decl.id, period: decl.period_label, status: "recomputed" });
    } catch (err) {
      results.push({ id: decl.id, period: decl.period_label, status: "error", error: err.message });
    }
  }
  return results;
}

export { getPeriodRange, detectFrequency, VAT_TYPE_LABELS };
