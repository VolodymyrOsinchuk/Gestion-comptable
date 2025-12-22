// ============================================
// FILE: routes/companyRoutes.js
// ============================================
import { Router } from "express";
const router = Router();
import {
  getAllCompanies,
  getCompany,
  createCompany,
  updateCompany,
  deleteCompany,
  getCompanyStats,
  validateSIRET,
} from "../controllers/companyController.js";
import { getDocumentsByCompany } from "../controllers/documentsController.js";

router.get("/stats", getCompanyStats);
router.post("/validate-siret", validateSIRET);
router.get("/", getAllCompanies);
router.get("/:companyId/documents", getDocumentsByCompany);
router.get("/:id", getCompany);
router.post("/", createCompany);
router.put("/:id", updateCompany);
router.delete("/:id", deleteCompany);

export default router;
