import { StatusCodes } from "http-status-codes";
import { Op } from "sequelize";
import ChartOfAccounts from "../models/ChartOfAccounts.js";
import { BASE_PCG_ACCOUNTS } from "../data/pcgAccounts.js";

const CLASS_LABELS = {
  1: "Capitaux",
  2: "Immobilisations",
  3: "Stocks",
  4: "Tiers",
  5: "Financiers",
  6: "Charges",
  7: "Produits",
  8: "Spéciaux",
};

export const listAccounts = async (req, res) => {
  try {
    const { companyId } = req.params;
    const { class: classe, search, type, active, autocomplete, page, pageSize } = req.query;

    const where = { company_id: companyId };
    if (classe) where.account_class = Number(classe);
    if (type) where.account_type = type;
    if (active !== undefined) where.is_active = active === "true";
    if (search) {
      where[Op.or] = [
        { account_number: { [Op.iLike]: `%${search}%` } },
        { account_label: { [Op.iLike]: `%${search}%` } },
      ];
    }

    if (autocomplete === "true") {
      const accounts = await ChartOfAccounts.findAll({
        where,
        order: [
          ["usage_count", "DESC"],
          ["account_number", "ASC"],
        ],
      });
      return res.status(StatusCodes.OK).json({ accounts, total: accounts.length });
    }

    const limit = Math.min(Number(pageSize) || 200, 500);
    const offset = ((Number(page) || 1) - 1) * limit;

    const { rows: accounts, count: total } = await ChartOfAccounts.findAndCountAll({
      where,
      order: [["account_number", "ASC"]],
      limit,
      offset,
    });

    res.status(StatusCodes.OK).json({ accounts, total, page: Number(page) || 1, limit });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      msg: "Erreur de récupération du plan comptable",
      error: error.message,
    });
  }
};

export const getAccount = async (req, res) => {
  try {
    const { companyId, id } = req.params;
    const account = await ChartOfAccounts.findOne({
      where: { id, company_id: companyId },
    });
    if (!account) {
      return res.status(StatusCodes.NOT_FOUND).json({ msg: "Compte non trouvé" });
    }
    res.status(StatusCodes.OK).json({ account });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      msg: "Erreur de récupération du compte",
      error: error.message,
    });
  }
};

export const createAccount = async (req, res) => {
  try {
    const { companyId } = req.params;
    const data = { ...req.body, company_id: companyId };

    const parent = data.parent_account;
    if (parent) {
      const exists = await ChartOfAccounts.findOne({
        where: { company_id: companyId, account_number: parent },
      });
      if (!exists) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          msg: `Le compte parent ${parent} n'existe pas dans le plan comptable`,
        });
      }
    }

    const existing = await ChartOfAccounts.findOne({
      where: { company_id: companyId, account_number: data.account_number },
    });
    if (existing) {
      return res.status(StatusCodes.CONFLICT).json({
        msg: `Le compte ${data.account_number} existe déjà`,
      });
    }

    const account = await ChartOfAccounts.create(data);
    res.status(StatusCodes.CREATED).json({ msg: "Compte créé", account });
  } catch (error) {
    res.status(StatusCodes.BAD_REQUEST).json({
      msg: "Erreur de création du compte",
      error: error.message,
    });
  }
};

export const updateAccount = async (req, res) => {
  try {
    const { companyId, id } = req.params;
    const account = await ChartOfAccounts.findOne({
      where: { id, company_id: companyId },
    });
    if (!account) {
      return res.status(StatusCodes.NOT_FOUND).json({ msg: "Compte non trouvé" });
    }
    await account.update(req.body);
    res.status(StatusCodes.OK).json({ msg: "Compte mis à jour", account });
  } catch (error) {
    res.status(StatusCodes.BAD_REQUEST).json({
      msg: "Erreur de mise à jour",
      error: error.message,
    });
  }
};

export const toggleAccount = async (req, res) => {
  try {
    const { companyId, id } = req.params;
    const account = await ChartOfAccounts.findOne({
      where: { id, company_id: companyId },
    });
    if (!account) {
      return res.status(StatusCodes.NOT_FOUND).json({ msg: "Compte non trouvé" });
    }
    await account.update({ is_active: !account.is_active });
    res.status(StatusCodes.OK).json({ msg: `Compte ${account.is_active ? "activé" : "désactivé"}`, account });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      msg: "Erreur lors de la modification",
      error: error.message,
    });
  }
};

export const deleteAccount = async (req, res) => {
  try {
    const { companyId, id } = req.params;
    const account = await ChartOfAccounts.findOne({
      where: { id, company_id: companyId },
    });
    if (!account) {
      return res.status(StatusCodes.NOT_FOUND).json({ msg: "Compte non trouvé" });
    }

    const childCount = await ChartOfAccounts.count({
      where: { company_id: companyId, parent_account: account.account_number },
    });
    if (childCount > 0) {
      return res.status(StatusCodes.CONFLICT).json({
        msg: `Impossible de supprimer : ${childCount} sous-compte(s) dépendent de ${account.account_number}`,
      });
    }

    await account.destroy();
    res.status(StatusCodes.OK).json({ msg: "Compte supprimé" });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      msg: "Erreur de suppression",
      error: error.message,
    });
  }
};

export const seedAccounts = async (req, res) => {
  try {
    const { companyId } = req.params;

    const existingCount = await ChartOfAccounts.count({
      where: { company_id: companyId },
    });
    if (existingCount > 0) {
      return res.status(StatusCodes.CONFLICT).json({
        msg: `Le plan comptable contient déjà ${existingCount} comptes. Utilisez POST /:companyId/seed/force pour réinitialiser.`,
      });
    }

    const accounts = BASE_PCG_ACCOUNTS.map((a) => ({
      ...a,
      company_id: Number(companyId),
    }));
    await ChartOfAccounts.bulkCreate(accounts);
    res.status(StatusCodes.CREATED).json({ msg: `${accounts.length} comptes créés`, count: accounts.length });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      msg: "Erreur d'import du plan comptable",
      error: error.message,
    });
  }
};

export const forceSeedAccounts = async (req, res) => {
  try {
    const { companyId } = req.params;

    await ChartOfAccounts.destroy({ where: { company_id: companyId } });

    const accounts = BASE_PCG_ACCOUNTS.map((a) => ({
      ...a,
      company_id: Number(companyId),
    }));
    await ChartOfAccounts.bulkCreate(accounts);
    res.status(StatusCodes.OK).json({ msg: `Plan comptable réinitialisé : ${accounts.length} comptes`, count: accounts.length });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      msg: "Erreur de réinitialisation",
      error: error.message,
    });
  }
};

export const getClasses = async (req, res) => {
  try {
    const { companyId } = req.params;
    const classes = await ChartOfAccounts.findAll({
      where: { company_id: companyId },
      attributes: ["account_class"],
      group: ["account_class"],
      order: [["account_class", "ASC"]],
    });
    const result = classes.map((c) => ({
      class: c.account_class,
      label: CLASS_LABELS[c.account_class] || `Classe ${c.account_class}`,
    }));
    res.status(StatusCodes.OK).json({ classes: result });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ msg: error.message });
  }
};
