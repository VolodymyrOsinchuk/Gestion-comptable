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
import { getAllDocuments } from "../controllers/documentController.js";
import { listPayrolls } from "../controllers/payrollController.js";
import { validate, companySchema } from "../middleware/validate.js";

router.get("/", getAllCompanies);
router.get("/stats", getCompanyStats);
router.post("/validate-siret", validateSIRET);
router.get("/:id", getCompany);
router.post("/", validate(companySchema), createCompany);
router.put("/:id", validate(companySchema), updateCompany);
router.delete("/:id", deleteCompany);
router.get("/:companyId/documents", getAllDocuments);
router.get("/:companyId/payrolls", listPayrolls);

export default router;
