// ============================================
// FILE: controllers/documentsController.js
// ============================================
import { Document, Company } from "../models/index.js";

// @desc    Get documents by company
// @route   GET /api/companies/:companyId/documents
export const getDocumentsByCompany = async (req, res) => {
  try {
    const { companyId } = req.params;

    const documents = await Document.findAll({
      where: { company_id: companyId },
      order: [["date", "DESC"]],
    });

    res.json({
      success: true,
      data: documents,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching documents",
      error: error.message,
    });
  }
};

// @desc    Get single document
// @route   GET /api/documents/:id
export const getDocument = async (req, res) => {
  try {
    const document = await Document.findByPk(req.params.id);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Document not found",
      });
    }

    res.json({
      success: true,
      data: document,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching document",
      error: error.message,
    });
  }
};
