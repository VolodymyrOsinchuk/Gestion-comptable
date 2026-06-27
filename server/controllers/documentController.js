import Document from "../models/Document.js";
import AccountingEntry from "../models/AccountingEntry.js";
import ThirdParty from "../models/ThirdParty.js";
import sequelize from "../config/db.js";
import { StatusCodes } from "http-status-codes";
import { generateAccountingEntries } from "../services/accountingService.js";

// GET all documents for a company
export const getAllDocuments = async (req, res) => {
  try {
    const { companyId } = req.params;

    // Fetch documents without association includes to avoid runtime association errors
    const documents = await Document.findAll({
      where: { company_id: companyId },
      order: [["date", "DESC"]],
    });

    const accountingEntries = await AccountingEntry.findAll({
      where: { company_id: companyId },
      order: [["date", "DESC"]],
      limit: 50,
    });

    res.status(StatusCodes.OK).json({
      documents,
      accountingEntries,
      count: documents.length,
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      msg: "Erreur lors de la récupération des documents",
      error: error.message,
    });
  }
};

// GET single document
export const getDocument = async (req, res) => {
  try {
    const { id } = req.params;

    const document = await Document.findByPk(id, {
      include: [
        {
          model: ThirdParty,
          as: "thirdParty",
        },
      ],
    });

    if (!document) {
      return res.status(StatusCodes.NOT_FOUND).json({
        msg: "Document non trouvé",
      });
    }

    res.status(StatusCodes.OK).json({ document });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      msg: "Erreur lors de la récupération du document",
      error: error.message,
    });
  }
};

// CREATE document
export const createDocument = async (req, res) => {
  try {
    const { companyId } = req.params;
    const documentData = {
      ...req.body,
      company_id: companyId,
    };

    const document = await Document.create(documentData);

    res.status(StatusCodes.CREATED).json({
      msg: "Document créé avec succès",
      document,
    });
  } catch (error) {
    res.status(StatusCodes.BAD_REQUEST).json({
      msg: "Erreur lors de la création du document",
      error: error.message,
    });
  }
};

// UPDATE document
export const updateDocument = async (req, res) => {
  try {
    const { id } = req.params;

    const document = await Document.findByPk(id);

    if (!document) {
      return res.status(StatusCodes.NOT_FOUND).json({
        msg: "Document non trouvé",
      });
    }

    await document.update(req.body);

    res.status(StatusCodes.OK).json({
      msg: "Document mis à jour avec succès",
      document,
    });
  } catch (error) {
    res.status(StatusCodes.BAD_REQUEST).json({
      msg: "Erreur lors de la mise à jour du document",
      error: error.message,
    });
  }
};

// DELETE document
export const deleteDocument = async (req, res) => {
  try {
    const { id } = req.params;

    const document = await Document.findByPk(id);

    if (!document) {
      return res.status(StatusCodes.NOT_FOUND).json({
        msg: "Document non trouvé",
      });
    }

    await document.destroy();

    res.status(StatusCodes.OK).json({
      msg: "Document supprimé avec succès",
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      msg: "Erreur lors de la suppression du document",
      error: error.message,
    });
  }
};

// UPDATE document status
export const updateDocumentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const document = await Document.findByPk(id);

    if (!document) {
      return res.status(StatusCodes.NOT_FOUND).json({
        msg: "Document non trouvé",
      });
    }

    if (status === "validated") {
      await sequelize.transaction(async (t) => {
        await document.update(
          { status, is_accounted: true, accounted_at: new Date() },
          { transaction: t }
        );
        await generateAccountingEntries(document, { transaction: t });
      });
    } else if (status === "cancelled" && document.status === "validated") {
      await sequelize.transaction(async (t) => {
        const entryNumber = document.reference || `DOC-${document.id}`;
        const existingEntries = await AccountingEntry.findAll({
          where: { company_id: document.company_id, entry_number: entryNumber },
          transaction: t,
        });
        if (existingEntries.length > 0) {
          const cancelNumber = `ANNUL-${entryNumber}`;
          const fiscalYear = new Date().getFullYear();
          for (const entry of existingEntries) {
            await AccountingEntry.create({
              company_id: entry.company_id,
              journal_id: entry.journal_id,
              entry_number: cancelNumber,
              entry_date: new Date().toISOString().split("T")[0],
              account_number: entry.account_number,
              third_party_id: entry.third_party_id,
              label: `Annulation: ${entry.label}`,
              debit: entry.credit,
              credit: entry.debit,
              fiscal_year: fiscalYear,
            }, { transaction: t });
          }
        }
        await document.update({ status, is_accounted: false }, { transaction: t });
      });
    } else {
      await document.update({ status });
    }

    res.status(StatusCodes.OK).json({
      msg: "Statut mis à jour avec succès",
      document,
    });
  } catch (error) {
    res.status(StatusCodes.BAD_REQUEST).json({
      msg: "Erreur lors de la mise à jour du statut",
      error: error.message,
    });
  }
};

// Retro-generate accounting entries for documents already marked as accounted
export const generateEntriesForAccountedDocuments = async (req, res) => {
  try {
    const companyId = req.body.companyId || req.query.companyId || null;

    const where = { is_accounted: true };
    if (companyId) where.company_id = companyId;

    const documents = await Document.findAll({
      where,
      order: [["date", "ASC"]],
    });
    const results = [];
    let processed = 0;
    let skipped = 0;

    for (const document of documents) {
      const entryNumber = document.reference || `DOC-${document.id}`;
      try {
        const existing = await AccountingEntry.findAll({
          where: { company_id: document.company_id, entry_number: entryNumber },
        });
        if (existing && existing.length > 0) {
          results.push({
            id: document.id,
            reference: document.reference,
            status: "skipped",
            reason: "entries_exist",
          });
          skipped++;
          continue;
        }

        await sequelize.transaction(async (t) => {
          await generateAccountingEntries(document, { transaction: t });
        });

        results.push({
          id: document.id,
          reference: document.reference,
          status: "created",
        });
        processed++;
      } catch (err) {
        results.push({
          id: document.id,
          reference: document.reference,
          status: "error",
          error: err.message,
        });
      }
    }

    return res.status(StatusCodes.OK).json({
      msg: "Génération terminée",
      processed,
      skipped,
      total: documents.length,
      details: results,
    });
  } catch (error) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ msg: "Erreur génération", error: error.message });
  }
};
