import Document from "../models/Document.js";
import AccountingEntry from "../models/AccountingEntry.js";
import ThirdParty from "../models/ThirdParty.js";
import Journal from "../models/Journal.js";
import sequelize from "../config/db.js";
import { StatusCodes } from "http-status-codes";

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

    // If validating the document, mark it as accounted, set accounted_at
    // and generate basic accounting entries (client/sales/TVA) inside a transaction.
    if (status === "validated") {
      await sequelize.transaction(async (t) => {
        // Update document first (will run model validations)
        await document.update(
          { status, is_accounted: true, accounted_at: new Date() },
          { transaction: t }
        );

        // Only generate entries if not already present
        const entryNumber = document.reference || `DOC-${document.id}`;
        const entryDate = document.date;

        // Choose journal (VE for sales, AC for purchases) or any active journal for company
        const jType =
          document.type === "invoice_customer"
            ? "VE"
            : document.type === "invoice_supplier"
            ? "AC"
            : "OD";
        let journal = await Journal.findOne(
          {
            where: {
              company_id: document.company_id,
              type: jType,
              is_active: true,
            },
          },
          { transaction: t }
        );
        if (!journal) {
          journal = await Journal.findOne(
            { where: { company_id: document.company_id, is_active: true } },
            { transaction: t }
          );
        }

        // Fetch third party to get accounts
        let thirdParty = null;
        if (document.third_party_id) {
          thirdParty = await ThirdParty.findByPk(document.third_party_id, {
            transaction: t,
          });
        }

        const fiscalYear = new Date(document.date).getFullYear();

        // Basic account fallbacks
        const clientAccount =
          (thirdParty && thirdParty.customer_account) || "411000";
        const supplierAccount =
          (thirdParty && thirdParty.supplier_account) || "401000";
        const revenueAccount = "706000";
        const tvaAccount = "445700";

        // Create entries depending on document type
        if (document.type === "invoice_customer") {
          // Debit client (TTC)
          await AccountingEntry.create(
            {
              company_id: document.company_id,
              journal_id: journal ? journal.id : null,
              entry_number: entryNumber,
              entry_date: entryDate,
              account_number: clientAccount,
              third_party_id: document.third_party_id,
              label: `Facture ${entryNumber}`,
              piece_ref: document.reference,
              debit: document.amount_ttc,
              credit: 0,
              fiscal_year: fiscalYear,
            },
            { transaction: t }
          );

          // Credit revenue (HT)
          await AccountingEntry.create(
            {
              company_id: document.company_id,
              journal_id: journal ? journal.id : null,
              entry_number: entryNumber,
              entry_date: entryDate,
              account_number: revenueAccount,
              label: `Vente ${entryNumber}`,
              debit: 0,
              credit: document.amount_ht,
              fiscal_year: fiscalYear,
            },
            { transaction: t }
          );

          // Credit TVA
          if (Number(document.amount_tva) > 0) {
            await AccountingEntry.create(
              {
                company_id: document.company_id,
                journal_id: journal ? journal.id : null,
                entry_number: entryNumber,
                entry_date: entryDate,
                account_number: tvaAccount,
                label: `TVA ${entryNumber}`,
                debit: 0,
                credit: document.amount_tva,
                fiscal_year: fiscalYear,
              },
              { transaction: t }
            );
          }
        } else if (document.type === "credit_note") {
          // Avoir client: reverse of invoice_customer
          const amtTtc = Math.abs(Number(document.amount_ttc || 0));
          const amtHt = Math.abs(Number(document.amount_ht || 0));
          const amtTva = Math.abs(Number(document.amount_tva || 0));

          // Credit client (reduce receivable)
          await AccountingEntry.create(
            {
              company_id: document.company_id,
              journal_id: journal ? journal.id : null,
              entry_number: entryNumber,
              entry_date: entryDate,
              account_number: clientAccount,
              third_party_id: document.third_party_id,
              label: `Avoir ${entryNumber}`,
              piece_ref: document.reference,
              debit: 0,
              credit: amtTtc,
              fiscal_year: fiscalYear,
            },
            { transaction: t }
          );

          // Debit revenue (HT)
          await AccountingEntry.create(
            {
              company_id: document.company_id,
              journal_id: journal ? journal.id : null,
              entry_number: entryNumber,
              entry_date: entryDate,
              account_number: revenueAccount,
              label: `Avoir produit ${entryNumber}`,
              debit: amtHt,
              credit: 0,
              fiscal_year: fiscalYear,
            },
            { transaction: t }
          );

          // Debit TVA
          if (amtTva > 0) {
            await AccountingEntry.create(
              {
                company_id: document.company_id,
                journal_id: journal ? journal.id : null,
                entry_number: entryNumber,
                entry_date: entryDate,
                account_number: tvaAccount,
                label: `TVA Avoir ${entryNumber}`,
                debit: amtTva,
                credit: 0,
                fiscal_year: fiscalYear,
              },
              { transaction: t }
            );
          }
        } else if (document.type === "invoice_supplier") {
          // For supplier invoices: debit expense (HT) and TVA, credit supplier (TTC)
          await AccountingEntry.create(
            {
              company_id: document.company_id,
              journal_id: journal ? journal.id : null,
              entry_number: entryNumber,
              entry_date: entryDate,
              account_number: revenueAccount,
              label: `Achat ${entryNumber}`,
              debit: document.amount_ht,
              credit: 0,
              fiscal_year: fiscalYear,
            },
            { transaction: t }
          );

          if (Number(document.amount_tva) > 0) {
            await AccountingEntry.create(
              {
                company_id: document.company_id,
                journal_id: journal ? journal.id : null,
                entry_number: entryNumber,
                entry_date: entryDate,
                account_number: tvaAccount,
                label: `TVA ${entryNumber}`,
                debit: document.amount_tva,
                credit: 0,
                fiscal_year: fiscalYear,
              },
              { transaction: t }
            );
          }

          await AccountingEntry.create(
            {
              company_id: document.company_id,
              journal_id: journal ? journal.id : null,
              entry_number: entryNumber,
              entry_date: entryDate,
              account_number: supplierAccount,
              third_party_id: document.third_party_id,
              label: `Facture fournisseur ${entryNumber}`,
              debit: 0,
              credit: document.amount_ttc,
              fiscal_year: fiscalYear,
            },
            { transaction: t }
          );
        }
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
    // companyId may be provided in body or query
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

        // generate entries in transaction
        await sequelize.transaction(async (t) => {
          const entryDate = document.date;

          const jType =
            document.type === "invoice_customer"
              ? "VE"
              : document.type === "invoice_supplier"
              ? "AC"
              : "OD";
          let journal = await Journal.findOne({
            where: {
              company_id: document.company_id,
              type: jType,
              is_active: true,
            },
          });
          if (!journal) {
            journal = await Journal.findOne({
              where: { company_id: document.company_id, is_active: true },
            });
          }

          let thirdParty = null;
          if (document.third_party_id) {
            thirdParty = await ThirdParty.findByPk(document.third_party_id, {
              transaction: t,
            });
          }

          const fiscalYear = new Date(document.date).getFullYear();
          const clientAccount =
            (thirdParty && thirdParty.customer_account) || "411000";
          const supplierAccount =
            (thirdParty && thirdParty.supplier_account) || "401000";
          const revenueAccount = "706000";
          const tvaAccount = "445700";

          if (document.type === "invoice_customer") {
            await AccountingEntry.create(
              {
                company_id: document.company_id,
                journal_id: journal ? journal.id : null,
                entry_number: entryNumber,
                entry_date: entryDate,
                account_number: clientAccount,
                third_party_id: document.third_party_id,
                label: `Facture ${entryNumber}`,
                piece_ref: document.reference,
                debit: document.amount_ttc,
                credit: 0,
                fiscal_year: fiscalYear,
              },
              { transaction: t }
            );

            await AccountingEntry.create(
              {
                company_id: document.company_id,
                journal_id: journal ? journal.id : null,
                entry_number: entryNumber,
                entry_date: entryDate,
                account_number: revenueAccount,
                label: `Vente ${entryNumber}`,
                debit: 0,
                credit: document.amount_ht,
                fiscal_year: fiscalYear,
              },
              { transaction: t }
            );

            if (Number(document.amount_tva) > 0) {
              await AccountingEntry.create(
                {
                  company_id: document.company_id,
                  journal_id: journal ? journal.id : null,
                  entry_number: entryNumber,
                  entry_date: entryDate,
                  account_number: tvaAccount,
                  label: `TVA ${entryNumber}`,
                  debit: 0,
                  credit: document.amount_tva,
                  fiscal_year: fiscalYear,
                },
                { transaction: t }
              );
            }
          } else if (document.type === "credit_note") {
            // Customer credit note: reverse of invoice_customer
            const amtTtc = Math.abs(Number(document.amount_ttc || 0));
            const amtHt = Math.abs(Number(document.amount_ht || 0));
            const amtTva = Math.abs(Number(document.amount_tva || 0));

            // Credit client (reduce receivable)
            await AccountingEntry.create(
              {
                company_id: document.company_id,
                journal_id: journal ? journal.id : null,
                entry_number: entryNumber,
                entry_date: entryDate,
                account_number: clientAccount,
                third_party_id: document.third_party_id,
                label: `Avoir ${entryNumber}`,
                piece_ref: document.reference,
                debit: 0,
                credit: amtTtc,
                fiscal_year: fiscalYear,
              },
              { transaction: t }
            );

            // Debit revenue (HT)
            await AccountingEntry.create(
              {
                company_id: document.company_id,
                journal_id: journal ? journal.id : null,
                entry_number: entryNumber,
                entry_date: entryDate,
                account_number: revenueAccount,
                label: `Avoir produit ${entryNumber}`,
                debit: amtHt,
                credit: 0,
                fiscal_year: fiscalYear,
              },
              { transaction: t }
            );

            // Debit TVA
            if (amtTva > 0) {
              await AccountingEntry.create(
                {
                  company_id: document.company_id,
                  journal_id: journal ? journal.id : null,
                  entry_number: entryNumber,
                  entry_date: entryDate,
                  account_number: tvaAccount,
                  label: `TVA Avoir ${entryNumber}`,
                  debit: amtTva,
                  credit: 0,
                  fiscal_year: fiscalYear,
                },
                { transaction: t }
              );
            }
          } else if (document.type === "invoice_supplier") {
            await AccountingEntry.create(
              {
                company_id: document.company_id,
                journal_id: journal ? journal.id : null,
                entry_number: entryNumber,
                entry_date: entryDate,
                account_number: revenueAccount,
                label: `Achat ${entryNumber}`,
                debit: document.amount_ht,
                credit: 0,
                fiscal_year: fiscalYear,
              },
              { transaction: t }
            );

            if (Number(document.amount_tva) > 0) {
              await AccountingEntry.create(
                {
                  company_id: document.company_id,
                  journal_id: journal ? journal.id : null,
                  entry_number: entryNumber,
                  entry_date: entryDate,
                  account_number: tvaAccount,
                  label: `TVA ${entryNumber}`,
                  debit: document.amount_tva,
                  credit: 0,
                  fiscal_year: fiscalYear,
                },
                { transaction: t }
              );
            }

            await AccountingEntry.create(
              {
                company_id: document.company_id,
                journal_id: journal ? journal.id : null,
                entry_number: entryNumber,
                entry_date: entryDate,
                account_number: supplierAccount,
                third_party_id: document.third_party_id,
                label: `Facture fournisseur ${entryNumber}`,
                debit: 0,
                credit: document.amount_ttc,
                fiscal_year: fiscalYear,
              },
              { transaction: t }
            );
          } else if (document.type === "credit_note") {
            // Retro: credit note not expected here for supplier branch, keep for completeness
            const amtTtc = Math.abs(Number(document.amount_ttc || 0));
            const amtHt = Math.abs(Number(document.amount_ht || 0));
            const amtTva = Math.abs(Number(document.amount_tva || 0));

            await AccountingEntry.create(
              {
                company_id: document.company_id,
                journal_id: journal ? journal.id : null,
                entry_number: entryNumber,
                entry_date: entryDate,
                account_number: supplierAccount,
                third_party_id: document.third_party_id,
                label: `Avoir fournisseur ${entryNumber}`,
                debit: 0,
                credit: amtTtc,
                fiscal_year: fiscalYear,
              },
              { transaction: t }
            );

            await AccountingEntry.create(
              {
                company_id: document.company_id,
                journal_id: journal ? journal.id : null,
                entry_number: entryNumber,
                entry_date: entryDate,
                account_number: revenueAccount,
                label: `Avoir achat ${entryNumber}`,
                debit: amtHt,
                credit: 0,
                fiscal_year: fiscalYear,
              },
              { transaction: t }
            );

            if (amtTva > 0) {
              await AccountingEntry.create(
                {
                  company_id: document.company_id,
                  journal_id: journal ? journal.id : null,
                  entry_number: entryNumber,
                  entry_date: entryDate,
                  account_number: tvaAccount,
                  label: `TVA Avoir ${entryNumber}`,
                  debit: amtTva,
                  credit: 0,
                  fiscal_year: fiscalYear,
                },
                { transaction: t }
              );
            }
          } else {
            // For other types, skip by default
          }
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
