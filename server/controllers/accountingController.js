import { Op } from "sequelize";
import { StatusCodes } from "http-status-codes";
import AccountingEntry from "../models/AccountingEntry.js";
import ChartOfAccounts from "../models/ChartOfAccounts.js";
import Journal from "../models/Journal.js";
import sequelize from "../config/db.js";

const round2 = (n) => Math.round(n * 100) / 100;

export const createEntry = async (req, res) => {
  try {
    const { companyId } = req.params;
    const { entry_date, journal_id, label, lines } = req.body;

    if (!entry_date || !journal_id || !label || !lines || lines.length < 2) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({
          error:
            "Données incomplètes. Requiert: entry_date, journal_id, label, lines (min 2 lignes)",
        });
    }

    const totalDebit = round2(
      lines.reduce((s, l) => s + Number(l.debit || 0), 0),
    );
    const totalCredit = round2(
      lines.reduce((s, l) => s + Number(l.credit || 0), 0),
    );
    if (Math.abs(totalDebit - totalCredit) > 0.01) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({
          error: `Écriture non équilibrée: débit=${totalDebit} crédit=${totalCredit}`,
        });
    }

    const journal = await Journal.findByPk(journal_id);
    if (!journal || Number(journal.company_id) !== Number(companyId)) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ error: "Journal invalide" });
    }

    const year = entry_date.slice(0, 4);
    const prefix = journal.code || "OD";
    const count = await AccountingEntry.count({
      where: { company_id: companyId, fiscal_year: year },
    });
    const entryNumber = `${prefix}-${year}-${String(count + 1).padStart(4, "0")}`;

    const entryRows = lines.map((line, idx) => ({
      company_id: Number(companyId),
      journal_id: Number(journal_id),
      entry_number: entryNumber,
      entry_date,
      account_number: line.account_number,
      label: line.label || label,
      debit: Number(line.debit || 0),
      credit: Number(line.credit || 0),
      lettrage: line.lettrage || null,
      is_lettred: Boolean(line.is_lettred),
      fiscal_year: Number(year),
      is_validated: true,
      validated_at: new Date(),
    }));

    const created = await AccountingEntry.bulkCreate(entryRows, {
      individualHooks: true,
    });

    // Increment usage_count for each account used
    const accountNumbers = [...new Set(lines.map((l) => l.account_number))];
    await ChartOfAccounts.increment("usage_count", {
      by: 1,
      where: { company_id: companyId, account_number: accountNumbers },
    });

    res.status(StatusCodes.CREATED).json({
      entry_number: entryNumber,
      lines_count: created.length,
      total_debit: totalDebit,
      total_credit: totalCredit,
    });
  } catch (error) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: error.message });
  }
};

export const getEntries = async (req, res) => {
  try {
    const { companyId } = req.params;
    const { year, account_number, start_date, end_date, page, pageSize } =
      req.query;
    const fiscalYear = year || new Date().getFullYear();

    const where = { company_id: companyId, fiscal_year: fiscalYear };
    if (account_number) {
      where.account_number = { [Op.like]: `${account_number}%` };
    }
    if (start_date) {
      where.entry_date = { ...(where.entry_date || {}), [Op.gte]: start_date };
    }
    if (end_date) {
      where.entry_date = { ...(where.entry_date || {}), [Op.lte]: end_date };
    }

    const limit = Math.min(Number(pageSize) || 100, 1000);
    const offset = ((Number(page) || 1) - 1) * limit;

    const { rows: entries, count: total } =
      await AccountingEntry.findAndCountAll({
        where,
        order: [
          ["entry_date", "ASC"],
          ["id", "ASC"],
        ],
        limit,
        offset,
      });

    res
      .status(StatusCodes.OK)
      .json({ entries, total, page: Number(page) || 1, limit });
  } catch (error) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ msg: "Erreur récupération écritures", error: error.message });
  }
};

export const updateEntry = async (req, res) => {
  try {
    const { entryId } = req.params;
    const { lettrage, is_lettred } = req.body;

    const entry = await AccountingEntry.findByPk(entryId);
    if (!entry) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ msg: "Écriture introuvable" });
    }

    const updates = {};
    if (lettrage !== undefined) updates.lettrage = lettrage || null;
    if (is_lettred !== undefined) updates.is_lettred = Boolean(is_lettred);

    await entry.update(updates);
    res.status(StatusCodes.OK).json({ entry });
  } catch (error) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ msg: "Erreur mise à jour écriture", error: error.message });
  }
};

export const getBalance = async (req, res) => {
  try {
    const { companyId } = req.params;
    const { year, classe } = req.query;
    const fiscalYear = year || new Date().getFullYear();

    const where = { company_id: companyId, fiscal_year: fiscalYear };
    const entries = await AccountingEntry.findAll({ where });

    const balances = {};
    for (const entry of entries) {
      const acct = entry.account_number;
      if (!balances[acct])
        balances[acct] = {
          account_number: acct,
          debit: 0,
          credit: 0,
          label: "",
        };
      balances[acct].debit += Number(entry.debit || 0);
      balances[acct].credit += Number(entry.credit || 0);
    }

    const chartAccounts = await ChartOfAccounts.findAll({
      where: { company_id: companyId },
      attributes: [
        "account_number",
        "account_label",
        "account_class",
        "account_type",
      ],
    });
    const labelMap = {};
    const classMap = {};
    const typeMap = {};
    for (const ca of chartAccounts) {
      labelMap[ca.account_number] = ca.account_label;
      classMap[ca.account_number] = ca.account_class;
      typeMap[ca.account_number] = ca.account_type;
    }

    let result = Object.values(balances).map((b) => {
      const net = round2(b.debit - b.credit);
      return {
        account_number: b.account_number,
        label: labelMap[b.account_number] || "",
        account_class: classMap[b.account_number] || null,
        account_type: typeMap[b.account_number] || null,
        total_debit: round2(b.debit),
        total_credit: round2(b.credit),
        balance: net,
        balance_abs: Math.abs(net),
        side: net >= 0 ? "debit" : "credit",
      };
    });

    result = result.filter((r) => Math.abs(r.balance) > 0.005);

    if (classe) {
      result = result.filter((r) => String(r.account_class) === String(classe));
    }

    const totalDebit = round2(result.reduce((s, r) => s + r.total_debit, 0));
    const totalCredit = round2(result.reduce((s, r) => s + r.total_credit, 0));

    res.status(StatusCodes.OK).json({
      accounts: result.sort((a, b) =>
        a.account_number.localeCompare(b.account_number),
      ),
      totalDebit,
      totalCredit,
      fiscalYear,
      count: result.length,
    });
  } catch (error) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ msg: "Erreur balance", error: error.message });
  }
};

export const getGrandLivre = async (req, res) => {
  try {
    const { companyId } = req.params;
    const { year, account_number, start_date, end_date, page, pageSize } =
      req.query;
    const fiscalYear = year || new Date().getFullYear();

    const where = { company_id: companyId, fiscal_year: fiscalYear };
    if (account_number)
      where.account_number = { [Op.like]: `${account_number}%` };
    if (start_date)
      where.entry_date = { ...(where.entry_date || {}), [Op.gte]: start_date };
    if (end_date)
      where.entry_date = { ...(where.entry_date || {}), [Op.lte]: end_date };

    const limit = Math.min(Number(pageSize) || 500, 1000);
    const offset = ((Number(page) || 1) - 1) * limit;

    const { rows: entries, count: total } =
      await AccountingEntry.findAndCountAll({
        where,
        order: [
          ["entry_date", "ASC"],
          ["id", "ASC"],
        ],
        limit,
        offset,
      });

    res
      .status(StatusCodes.OK)
      .json({ entries, total, page: Number(page) || 1, limit });
  } catch (error) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ msg: "Erreur grand-livre", error: error.message });
  }
};

export const getIncomeStatement = async (req, res) => {
  try {
    const { companyId } = req.params;
    const year = req.query.year || new Date().getFullYear();

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

    const charges = [];
    const produits = [];
    let totalCharges = 0;
    let totalProduits = 0;

    for (const [acct, bal] of Object.entries(balances)) {
      const first = acct.charAt(0);
      const net = round2(bal.debit - bal.credit);
      if (Math.abs(net) < 0.01) continue;
      if (first === "6") {
        charges.push({ account_number: acct, amount: net });
        totalCharges += net;
      } else if (first === "7") {
        produits.push({ account_number: acct, amount: Math.abs(net) });
        totalProduits += Math.abs(net);
      }
    }

    const resultat = round2(totalProduits - totalCharges);

    res.status(StatusCodes.OK).json({
      charges,
      produits,
      totalCharges: round2(totalCharges),
      totalProduits: round2(totalProduits),
      resultat,
      fiscalYear: year,
    });
  } catch (error) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ msg: "Erreur compte de résultat", error: error.message });
  }
};
