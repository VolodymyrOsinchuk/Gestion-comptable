import { StatusCodes } from "http-status-codes";
import BankTransaction from "../models/BankTransaction.js";
import BankAccount from "../models/BankAccount.js";

export const getTransactions = async (req, res) => {
  try {
    const { companyId } = req.params;
    const { bank_account_id, status, start_date, end_date } = req.query;

    const where = { company_id: companyId };
    if (bank_account_id) where.bank_account_id = bank_account_id;
    if (status) where.status = status;
    if (start_date || end_date) {
      where.date = {};
      if (start_date) where.date.gte = start_date;
      if (end_date) where.date.lte = end_date;
    }

    const transactions = await BankTransaction.findAll({
      where,
      order: [["date", "DESC"]],
    });

    res.status(StatusCodes.OK).json({ transactions });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ msg: "Erreur récupération transactions", error: error.message });
  }
};

export const getBankAccounts = async (req, res) => {
  try {
    const { companyId } = req.params;

    const accounts = await BankAccount.findAll({
      where: { company_id: companyId, is_active: true },
      order: [["name", "ASC"]],
    });

    res.status(StatusCodes.OK).json({ accounts });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ msg: "Erreur récupération comptes bancaires", error: error.message });
  }
};
