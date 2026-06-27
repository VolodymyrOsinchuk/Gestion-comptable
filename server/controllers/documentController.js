import Document from "../models/Document.js";
import AccountingEntry from "../models/AccountingEntry.js";
import ThirdParty from "../models/ThirdParty.js";
import sequelize from "../config/db.js";
import { StatusCodes } from "http-status-codes";
import { generateAccountingEntries } from "../services/accountingService.js";
import fs from "fs";
import pdfParse from "pdf-parse";
import { createWorker } from "tesseract.js";

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
      order: [["entry_date", "DESC"]],
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
          { transaction: t },
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
            await AccountingEntry.create(
              {
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
              },
              { transaction: t },
            );
          }
        }
        await document.update(
          { status, is_accounted: false },
          { transaction: t },
        );
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

// POST /documents/scan
export const scanDocument = async (req, res) => {
  try {
    if (!req.file)
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ msg: "No file uploaded" });

    const filePath = req.file.path;
    const mimetype = req.file.mimetype || "";
    let text = "";
    let used = null;

    // Try PDF text extraction first
    try {
      const dataBuffer = fs.readFileSync(filePath);
      const pdfRes = await pdfParse(dataBuffer);
      if (pdfRes && pdfRes.text && pdfRes.text.trim().length > 20) {
        text = pdfRes.text;
        used = "pdf-parse";
      }
    } catch (err) {
      // continue to OCR fallback
      console.warn("pdf-parse failed:", err.message || err);
    }

    // If no meaningful text, fallback to OCR via tesseract
    let ocrConfidence = null;
    if (!text || text.trim().length < 20) {
      used = "tesseract";
      const worker = createWorker({
        logger: () => {},
      });
      try {
        await worker.load();
        await worker.loadLanguage("fra");
        await worker.initialize("fra");
        const { data: ocrData } = await worker.recognize(filePath);
        text = ocrData.text || "";
        ocrConfidence = ocrData?.confidence || null;
        await worker.terminate();
      } catch (err) {
        console.warn("Tesseract OCR failed:", err.message || err);
        try {
          await worker.terminate();
        } catch (e) {}
      }
    }

    // Very small heuristic parser: extract invoice number, dates, amounts, supplier
    const result = {
      fournisseur: "",
      numeroFacture: "",
      dateFacture: "",
      dateEcheance: "",
      montantHT: null,
      montantTVA: null,
      montantTTC: null,
      devise: "EUR",
    };

    const t = text || "";
    // Invoice number
    const numMatch = t.match(
      /(No|N°|Numéro|Facture|Invoice)\s*[:#\-\s]*([A-Z0-9\-\/\.]+)/i,
    );
    if (numMatch) result.numeroFacture = numMatch[2].trim();

    // Dates (YYYY-MM-DD or DD/MM/YYYY or DD-MM-YYYY)
    const dateMatchIso = t.match(/(\d{4}-\d{2}-\d{2})/);
    const dateMatchFr = t.match(/(\d{2}[\/\-]\d{2}[\/\-]\d{4})/);
    if (dateMatchIso) result.dateFacture = dateMatchIso[1];
    else if (dateMatchFr) {
      const [d, m, y] = dateMatchFr[1].split(/[\/\-]/);
      result.dateFacture = `${y}-${m}-${d}`;
    }

    // Amounts: look for patterns with € or numbers with decimals
    const amountMatches = Array.from(
      t.matchAll(/([0-9]+[\s\.,]?[0-9]{0,3}[\.,][0-9]{2})\s*(€|EUR)?/g),
    );
    if (amountMatches && amountMatches.length > 0) {
      // Convert matches to numbers and pick plausible TTC/HT
      const nums = amountMatches.map((m) =>
        parseFloat(m[1].replace(/\s/g, "").replace(/,/, ".")),
      );
      // Heuristic: largest is TTC
      const max = Math.max(...nums);
      result.montantTTC = Number(max.toFixed(2));
      // Try to find smaller numbers for HT/TVA
      const others = nums.filter((n) => n !== max).sort((a, b) => b - a);
      if (others.length >= 1) result.montantHT = Number(others[0].toFixed(2));
      if (others.length >= 2) result.montantTVA = Number(others[1].toFixed(2));
    }

    // Supplier: try first lines
    const lines = t
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean)
      .slice(0, 10);
    if (lines.length > 0) result.fournisseur = lines[0];

    // Cleanup uploaded file
    try {
      fs.unlinkSync(filePath);
    } catch (e) {}

    return res
      .status(StatusCodes.OK)
      .json({ data: result, confidence: ocrConfidence, engine: used });
  } catch (error) {
    console.error("scanDocument error:", error);
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ msg: "Erreur extraction", error: error.message });
  }
};
