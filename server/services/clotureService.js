import sequelize from "../config/db.js";
import AccountingEntry from "../models/AccountingEntry.js";
import FiscalYear from "../models/FiscalYear.js";
import Journal from "../models/Journal.js";
import ChartOfAccounts from "../models/ChartOfAccounts.js";

export async function executeClosure(companyId, year, userId = null) {
  const existing = await FiscalYear.findOne({
    where: { company_id: companyId, year },
  });

  if (existing && existing.status === "closed") {
    throw new Error(`L'exercice ${year} est déjà clôturé.`);
  }

  const unvalidated = await AccountingEntry.findAll({
    where: {
      company_id: companyId,
      fiscal_year: year,
      is_validated: false,
    },
  });
  if (unvalidated.length > 0) {
    throw new Error(
      `Impossible de clôturer : ${unvalidated.length} écriture(s) non validée(s) dans l'exercice ${year}.`
    );
  }

  const entries = await AccountingEntry.findAll({
    where: { company_id: companyId, fiscal_year: year },
  });
  const totalDebit = entries.reduce((s, e) => s + Number(e.debit || 0), 0);
  const totalCredit = entries.reduce((s, e) => s + Number(e.credit || 0), 0);
  if (Math.abs(totalDebit - totalCredit) > 0.02) {
    throw new Error(
      `Grand livre non équilibré : Débit=${totalDebit.toFixed(2)} ≠ Crédit=${totalCredit.toFixed(2)}.`
    );
  }

  return sequelize.transaction(async (t) => {
    const [fy] = await FiscalYear.findOrCreate({
      where: { company_id: companyId, year },
      defaults: { company_id: companyId, year, status: "open" },
      transaction: t,
    });
    if (fy.status === "closed") {
      throw new Error(`L'exercice ${year} est déjà clôturé.`);
    }

    const accountingEntries = await AccountingEntry.findAll({
      where: { company_id: companyId, fiscal_year: year },
      transaction: t,
    });

    const balances = {};
    for (const entry of accountingEntries) {
      const acct = entry.account_number;
      if (!balances[acct]) balances[acct] = { debit: 0, credit: 0 };
      balances[acct].debit += Number(entry.debit || 0);
      balances[acct].credit += Number(entry.credit || 0);
    }

    const compteClasse = (num) => {
      const first = num.charAt(0);
      if (first >= "1" && first <= "5") return "bilan";
      if (first === "6") return "charge";
      if (first === "7") return "produit";
      return "autre";
    };

    let totalCharge = 0;
    let totalProduit = 0;
    const bilanAccounts = [];

    for (const [acct, bal] of Object.entries(balances)) {
      const cls = compteClasse(acct);
      const net = bal.debit - bal.credit;
      if (cls === "charge") {
        totalCharge += net;
      } else if (cls === "produit") {
        totalProduit += -net;
      } else if (cls === "bilan") {
        if (Math.abs(net) > 0.01) {
          bilanAccounts.push({ account_number: acct, balance: net });
        }
      }
    }

    const result = totalProduit - totalCharge;

    let journalCL = await Journal.findOne({
      where: { company_id: companyId, type: "CL", is_active: true },
      transaction: t,
    });
    if (!journalCL) {
      journalCL = await Journal.create({
        company_id: companyId,
        code: `CL${year}`,
        label: `Clôture ${year}`,
        type: "CL",
        is_active: true,
      }, { transaction: t });
    }

    const closingNumber = `CLO-${year}`;
    const closingDate = `${year}-12-31`;
    const closingEntries = [];

    for (const [acct, bal] of Object.entries(balances)) {
      const cls = compteClasse(acct);
      const net = bal.debit - bal.credit;
      if (cls === "produit") {
        const creditBal = -net;
        if (creditBal > 0.01) {
          closingEntries.push({
            company_id: companyId,
            journal_id: journalCL.id,
            entry_number: closingNumber,
            entry_date: closingDate,
            account_number: acct,
            label: `Clôture ${acct}`,
            debit: creditBal,
            credit: 0,
            fiscal_year: year,
            is_validated: true,
            validated_at: new Date(),
          });
        }
      } else if (cls === "charge") {
        const debitBal = net;
        if (debitBal > 0.01) {
          closingEntries.push({
            company_id: companyId,
            journal_id: journalCL.id,
            entry_number: closingNumber,
            entry_date: closingDate,
            account_number: acct,
            label: `Clôture ${acct}`,
            debit: 0,
            credit: debitBal,
            fiscal_year: year,
            is_validated: true,
            validated_at: new Date(),
          });
        }
      }
    }

    if (Math.abs(result) > 0.01) {
      if (result > 0) {
        closingEntries.push({
          company_id: companyId,
          journal_id: journalCL.id,
          entry_number: closingNumber,
          entry_date: closingDate,
          account_number: "120000",
          label: "Résultat bénéficiaire",
          debit: 0,
          credit: result,
          fiscal_year: year,
          is_validated: true,
          validated_at: new Date(),
        });
      } else {
        closingEntries.push({
          company_id: companyId,
          journal_id: journalCL.id,
          entry_number: closingNumber,
          entry_date: closingDate,
          account_number: "129000",
          label: "Résultat déficitaire",
          debit: Math.abs(result),
          credit: 0,
          fiscal_year: year,
          is_validated: true,
          validated_at: new Date(),
        });
      }
    }

    const clTotalDebit = closingEntries.reduce((s, e) => s + Number(e.debit || 0), 0);
    const clTotalCredit = closingEntries.reduce((s, e) => s + Number(e.credit || 0), 0);
    if (Math.abs(clTotalDebit - clTotalCredit) > 0.02) {
      throw new Error(
        `Écriture de clôture non équilibrée: Débit=${clTotalDebit.toFixed(2)} ≠ Crédit=${clTotalCredit.toFixed(2)}`
      );
    }

    for (const e of closingEntries) {
      await AccountingEntry.create(e, { transaction: t });
    }

    let journalAN = await Journal.findOne({
      where: { company_id: companyId, type: "AN", is_active: true },
      transaction: t,
    });
    if (!journalAN) {
      journalAN = await Journal.create({
        company_id: companyId,
        code: `AN${year + 1}`,
        label: `À-Nouveaux ${year + 1}`,
        type: "AN",
        is_active: true,
      }, { transaction: t });
    }

    const openingNumber = `AN-${year + 1}`;
    const openingDate = `${year + 1}-01-01`;
    const nextYear = year + 1;
    const openingEntries = [];

    let totalBilanDebit = 0;
    let totalBilanCredit = 0;

    for (const acct of bilanAccounts) {
      if (acct.account_number === "120000" || acct.account_number === "129000") continue;
      if (acct.balance > 0.01) {
        openingEntries.push({
          company_id: companyId,
          journal_id: journalAN.id,
          entry_number: openingNumber,
          entry_date: openingDate,
          account_number: acct.account_number,
          label: `Reprise ${acct.account_number}`,
          debit: Math.abs(acct.balance),
          credit: 0,
          fiscal_year: nextYear,
          is_validated: true,
          validated_at: new Date(),
        });
        totalBilanDebit += Math.abs(acct.balance);
      } else if (acct.balance < -0.01) {
        openingEntries.push({
          company_id: companyId,
          journal_id: journalAN.id,
          entry_number: openingNumber,
          entry_date: openingDate,
          account_number: acct.account_number,
          label: `Reprise ${acct.account_number}`,
          debit: 0,
          credit: Math.abs(acct.balance),
          fiscal_year: nextYear,
          is_validated: true,
          validated_at: new Date(),
        });
        totalBilanCredit += Math.abs(acct.balance);
      }
    }

    if (Math.abs(result) > 0.01) {
      if (result > 0) {
        openingEntries.push({
          company_id: companyId,
          journal_id: journalAN.id,
          entry_number: openingNumber,
          entry_date: openingDate,
          account_number: "110000",
          label: "Report à nouveau (créditeur)",
          debit: 0,
          credit: result,
          fiscal_year: nextYear,
          is_validated: true,
          validated_at: new Date(),
        });
      } else {
        openingEntries.push({
          company_id: companyId,
          journal_id: journalAN.id,
          entry_number: openingNumber,
          entry_date: openingDate,
          account_number: "119000",
          label: "Report à nouveau (débiteur)",
          debit: Math.abs(result),
          credit: 0,
          fiscal_year: nextYear,
          is_validated: true,
          validated_at: new Date(),
        });
      }
    }

    const anTotalDebit = openingEntries.reduce((s, e) => s + Number(e.debit || 0), 0);
    const anTotalCredit = openingEntries.reduce((s, e) => s + Number(e.credit || 0), 0);
    if (Math.abs(anTotalDebit - anTotalCredit) > 0.02) {
      throw new Error(
        `Écriture d'ouverture non équilibrée: Débit=${anTotalDebit.toFixed(2)} ≠ Crédit=${anTotalCredit.toFixed(2)}`
      );
    }

    for (const e of openingEntries) {
      await AccountingEntry.create(e, { transaction: t });
    }

    fy.status = "closed";
    fy.closed_at = new Date();
    fy.closed_by = userId;
    fy.result = result;
    fy.closing_entry_number = closingNumber;
    fy.opening_entry_number = openingNumber;
    await fy.save({ transaction: t });

    return {
      fiscalYear: fy,
      result,
      closingEntryNumber: closingNumber,
      openingEntryNumber: openingNumber,
      closingEntriesCount: closingEntries.length,
      openingEntriesCount: openingEntries.length,
    };
  });
}

export async function getClosureStatus(companyId, year) {
  const fy = await FiscalYear.findOne({
    where: { company_id: companyId, year },
  });
  if (!fy) {
    return { closed: false };
  }
  return {
    closed: fy.status === "closed",
    result: fy.result,
    closedAt: fy.closed_at,
    closingEntryNumber: fy.closing_entry_number,
    openingEntryNumber: fy.opening_entry_number,
  };
}

export async function getBalanceSheet(companyId, year) {
  const entries = await AccountingEntry.findAll({
    where: { company_id: companyId, fiscal_year: year },
  });

  const balances = {};
  for (const entry of entries) {
    const acct = entry.account_number;
    if (!balances[acct]) balances[acct] = { debit: 0, credit: 0 };
    balances[acct].debit += Number(entry.debit || 0);
    balances[acct].credit += Number(entry.credit || 0);
  }

  const actif = [];
  const passif = [];
  let totalActif = 0;
  let totalPassif = 0;

  for (const [acct, bal] of Object.entries(balances)) {
    const net = bal.debit - bal.credit;
    if (Math.abs(net) < 0.01) continue;
    const first = acct.charAt(0);
    if (first === "1" && (acct.startsWith("12") || acct.startsWith("129"))) {
      if (net > 0) {
        passif.push({ account: acct, label: "Résultat (perte)", amount: Math.abs(net) });
        totalPassif += Math.abs(net);
      } else {
        passif.push({ account: acct, label: "Résultat (bénéfice)", amount: Math.abs(net) });
        totalPassif += Math.abs(net);
      }
    } else if (first === "1") {
      passif.push({ account: acct, label: `Capitaux propres (${acct})`, amount: Math.abs(net) });
      totalPassif += Math.abs(net);
    } else if (first === "2") {
      actif.push({ account: acct, label: `Immobilisations (${acct})`, amount: Math.abs(net) });
      totalActif += Math.abs(net);
    } else if (first === "3") {
      actif.push({ account: acct, label: `Stocks (${acct})`, amount: Math.abs(net) });
      totalActif += Math.abs(net);
    } else if (first === "4" && (acct.startsWith("40") || acct.startsWith("42") || acct.startsWith("43") || acct.startsWith("44") || acct.startsWith("45") || acct.startsWith("46") || acct.startsWith("47") || acct.startsWith("48"))) {
      if (net > 0) {
        actif.push({ account: acct, label: `Tiers débiteurs (${acct})`, amount: Math.abs(net) });
        totalActif += Math.abs(net);
      } else {
        passif.push({ account: acct, label: `Tiers créditeurs (${acct})`, amount: Math.abs(net) });
        totalPassif += Math.abs(net);
      }
    } else if (first === "4" && (acct.startsWith("41"))) {
      if (net > 0) {
        actif.push({ account: acct, label: `Clients (${acct})`, amount: Math.abs(net) });
        totalActif += Math.abs(net);
      } else {
        passif.push({ account: acct, label: `Clients créditeurs (${acct})`, amount: Math.abs(net) });
        totalPassif += Math.abs(net);
      }
    } else if (first === "5" && acct.startsWith("51")) {
      if (net > 0) {
        actif.push({ account: acct, label: `Banque (${acct})`, amount: Math.abs(net) });
        totalActif += Math.abs(net);
      } else {
        passif.push({ account: acct, label: `Banque créditrice (${acct})`, amount: Math.abs(net) });
        totalPassif += Math.abs(net);
      }
    } else if (first === "5" && acct.startsWith("53")) {
      if (net > 0) {
        actif.push({ account: acct, label: `Caisse (${acct})`, amount: Math.abs(net) });
        totalActif += Math.abs(net);
      } else {
        passif.push({ account: acct, label: `Caisse créditrice (${acct})`, amount: Math.abs(net) });
        totalPassif += Math.abs(net);
      }
    } else if (first === "5") {
      if (net > 0) {
        actif.push({ account: acct, label: `Financier (${acct})`, amount: Math.abs(net) });
        totalActif += Math.abs(net);
      } else {
        passif.push({ account: acct, label: `Financier créditeur (${acct})`, amount: Math.abs(net) });
        totalPassif += Math.abs(net);
      }
    }
  }

  const resultEntries = Object.entries(balances).filter(([acct]) => {
    const first = acct.charAt(0);
    return first === "6" || first === "7";
  });

  let totalCharges = 0;
  let totalProduits = 0;
  const charges = [];
  const produits = [];

  for (const [acct, bal] of resultEntries) {
    const net = bal.debit - bal.credit;
    if (Math.abs(net) < 0.01) continue;
    if (acct.charAt(0) === "6") {
      charges.push({ account: acct, amount: net });
      totalCharges += net;
    } else {
      produits.push({ account: acct, amount: Math.abs(net) });
      totalProduits += Math.abs(net);
    }
  }

  return {
    actif,
    passif,
    totalActif: Math.round(totalActif * 100) / 100,
    totalPassif: Math.round(totalPassif * 100) / 100,
    charges,
    produits,
    totalCharges: Math.round(totalCharges * 100) / 100,
    totalProduits: Math.round(totalProduits * 100) / 100,
    resultat: Math.round((totalProduits - totalCharges) * 100) / 100,
  };
}
