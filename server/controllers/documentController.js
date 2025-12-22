import Document from "../models/Document.js";
import AccountingEntry from "../models/AccountingEntry.js";
import ThirdParty from "../models/ThirdParty.js";
import { StatusCodes } from "http-status-codes";

// GET all documents for a company
export const getAllDocuments = async (req, res) => {
  try {
    const { companyId } = req.params;

    const documents = await Document.findAll({
      where: { company_id: companyId },
      include: [
        {
          model: ThirdParty,
          as: "thirdParty",
          attributes: ["id", "name", "type"],
        },
      ],
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

    await document.update({ status });

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
