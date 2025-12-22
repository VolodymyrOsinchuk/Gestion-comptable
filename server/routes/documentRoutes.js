import { Router } from "express";
import {
  getAllDocuments,
  getDocument,
  createDocument,
  updateDocument,
  deleteDocument,
  updateDocumentStatus,
} from "../controllers/documentController.js";

const router = Router();

// Routes pour les documents d'une entreprise
router
  .route("/companies/:companyId/documents")
  .get(getAllDocuments)
  .post(createDocument);

// Routes pour un document spécifique
router
  .route("/documents/:id")
  .get(getDocument)
  .patch(updateDocument)
  .delete(deleteDocument);

// Route spéciale pour mettre à jour le statut
router.patch("/documents/:id/status", updateDocumentStatus);

export default router;
