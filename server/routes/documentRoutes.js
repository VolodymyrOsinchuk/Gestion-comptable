import { Router } from "express";
import multer from "multer";
import {
  getAllDocuments,
  getDocument,
  createDocument,
  updateDocument,
  deleteDocument,
  updateDocumentStatus,
  generateEntriesForAccountedDocuments,
  scanDocument,
} from "../controllers/documentController.js";
import { validate, documentSchema } from "../middleware/validate.js";

const router = Router();
const upload = multer({ dest: "uploads/" });

router.get("/company/:companyId", getAllDocuments);
router.post("/company/:companyId", validate(documentSchema), createDocument);

// Upload & scan endpoint (multipart)
router.post("/scan", upload.single("file"), scanDocument);

router
  .route("/:id")
  .get(getDocument)
  .patch(updateDocument)
  .delete(deleteDocument);

router.patch("/:id/status", updateDocumentStatus);
router.post("/generate-entries", generateEntriesForAccountedDocuments);

export default router;
