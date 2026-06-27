import { StatusCodes } from "http-status-codes";
import TvaDeclaration from "../models/TVAReport.js";
import TvaDeclarationLine from "../models/TVAItem.js";
import sequelize from "../config/db.js";
import {
  computeVatForPeriod,
  generateDeclaration,
  lockDeclaration,
  unlockDeclaration,
  getVatStatus,
  recomputeOpenDeclarations,
  detectFrequency,
  getPeriodRange,
  VAT_TYPE_LABELS,
} from "../services/tvaService.js";

// GET /api/v1/tva/companies/:companyId/status
export const getStatus = async (req, res) => {
  try {
    const { companyId } = req.params;
    const status = await getVatStatus(companyId);
    res.status(StatusCodes.OK).json(status);
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      msg: "Erreur statut TVA", error: error.message,
    });
  }
};

// GET /api/v1/tva/companies/:companyId/declarations
export const listDeclarations = async (req, res) => {
  try {
    const { companyId } = req.params;
    const declarations = await TvaDeclaration.findAll({
      where: { company_id: companyId },
      include: [{ model: TvaDeclarationLine, as: "lines" }],
      order: [["period_start", "DESC"]],
    });
    res.status(StatusCodes.OK).json({ declarations });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      msg: "Erreur liste déclarations", error: error.message,
    });
  }
};

// GET /api/v1/tva/declarations/:id
export const getDeclaration = async (req, res) => {
  try {
    const { id } = req.params;
    const declaration = await TvaDeclaration.findByPk(id, {
      include: [{ model: TvaDeclarationLine, as: "lines" }],
    });
    if (!declaration) {
      return res.status(StatusCodes.NOT_FOUND).json({ msg: "Déclaration introuvable" });
    }
    res.status(StatusCodes.OK).json({ declaration });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      msg: "Erreur récupération déclaration", error: error.message,
    });
  }
};

// POST /api/v1/tva/companies/:companyId/declarations/generate
// body: { period_start, period_end } or computed from current period
export const createDeclaration = async (req, res) => {
  const { companyId } = req.params;
  let { period_start, period_end } = req.body;

  try {
    if (!period_start || !period_end) {
      const company = await (await import("../models/Company.js")).default.findByPk(companyId);
      if (!company) return res.status(404).json({ msg: "Entreprise introuvable" });
      const freq = detectFrequency(company);
      const now = new Date();
      const range = getPeriodRange(
        now.getFullYear(),
        freq === "yearly" ? 1 : freq === "quarterly" ? Math.ceil((now.getMonth() + 1) / 3) : now.getMonth() + 1,
        freq
      );
      period_start = range.start;
      period_end = range.end;
    }

    const result = await sequelize.transaction(async (t) => {
      return await generateDeclaration(companyId, period_start, period_end, { transaction: t });
    });

    res.status(StatusCodes.CREATED).json({
      msg: "Déclaration générée automatiquement",
      declaration: result.declaration,
      lines: result.lines,
      summary: result.summary,
      totals: result.totals,
    });
  } catch (error) {
    res.status(StatusCodes.BAD_REQUEST).json({
      msg: error.message || "Erreur génération déclaration",
      error: error.message,
    });
  }
};

// POST /api/v1/tva/companies/:companyId/declarations/compute-preview
// Preview without saving
export const previewDeclaration = async (req, res) => {
  try {
    const { companyId } = req.params;
    const { period_start, period_end } = req.body;

    if (!period_start || !period_end) {
      return res.status(StatusCodes.BAD_REQUEST).json({ msg: "period_start et period_end requis" });
    }

    const computed = await computeVatForPeriod(companyId, period_start, period_end);
    res.status(StatusCodes.OK).json({
      msg: "Aperçu calculé avec succès",
      ...computed,
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      msg: "Erreur calcul", error: error.message,
    });
  }
};

// PATCH /api/v1/tva/declarations/:id/lock
export const lockDeclarationHandler = async (req, res) => {
  try {
    const declaration = await lockDeclaration(req.params.id);
    res.status(StatusCodes.OK).json({
      msg: "Période verrouillée. Aucune modification possible sans déverrouillage.",
      declaration,
    });
  } catch (error) {
    res.status(StatusCodes.BAD_REQUEST).json({
      msg: error.message || "Erreur verrouillage",
      error: error.message,
    });
  }
};

// PATCH /api/v1/tva/declarations/:id/unlock
export const unlockDeclarationHandler = async (req, res) => {
  try {
    const declaration = await unlockDeclaration(req.params.id);
    res.status(StatusCodes.OK).json({
      msg: "Période déverrouillée. Les écritures peuvent être modifiées.",
      declaration,
    });
  } catch (error) {
    res.status(StatusCodes.BAD_REQUEST).json({
      msg: error.message || "Erreur déverrouillage",
      error: error.message,
    });
  }
};

// POST /api/v1/tva/companies/:companyId/declarations/recompute
export const recomputeAll = async (req, res) => {
  try {
    const { companyId } = req.params;
    const results = await recomputeOpenDeclarations(companyId);
    res.status(StatusCodes.OK).json({
      msg: `${results.filter(r => r.status === "recomputed").length} déclaration(s) recalculée(s)`,
      results,
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      msg: "Erreur recalcul", error: error.message,
    });
  }
};

// GET /api/v1/tva/companies/:companyId/entries/vat
// Get all VAT entries for a period (for audit/verification)
export const getVatEntries = async (req, res) => {
  try {
    const { companyId } = req.params;
    const { period_start, period_end } = req.query;

    if (!period_start || !period_end) {
      return res.status(StatusCodes.BAD_REQUEST).json({ msg: "period_start et period_end requis" });
    }

    const computed = await computeVatForPeriod(companyId, period_start, period_end);
    res.status(StatusCodes.OK).json(computed);
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      msg: "Erreur récupération écritures TVA", error: error.message,
    });
  }
};
