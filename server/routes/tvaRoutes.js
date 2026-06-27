import { Router } from "express";
import {
  getStatus,
  listDeclarations,
  getDeclaration,
  createDeclaration,
  previewDeclaration,
  lockDeclarationHandler,
  unlockDeclarationHandler,
  recomputeAll,
  getVatEntries,
} from "../controllers/tvaController.js";

const router = Router();

// Company-scoped routes
router.get("/companies/:companyId/status", getStatus);
router.get("/companies/:companyId/declarations", listDeclarations);
router.post("/companies/:companyId/declarations/generate", createDeclaration);
router.post("/companies/:companyId/declarations/compute-preview", previewDeclaration);
router.post("/companies/:companyId/declarations/recompute", recomputeAll);
router.get("/companies/:companyId/entries/vat", getVatEntries);

// Declaration-scoped routes
router.get("/declarations/:id", getDeclaration);
router.patch("/declarations/:id/lock", lockDeclarationHandler);
router.patch("/declarations/:id/unlock", unlockDeclarationHandler);

export default router;
