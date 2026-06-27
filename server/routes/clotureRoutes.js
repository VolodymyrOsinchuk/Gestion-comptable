import { Router } from "express";
const router = Router();
import { closeFiscalYear, getStatus, getBilan } from "../controllers/clotureController.js";

router.get("/status/:companyId/:year", getStatus);
router.get("/bilan/:companyId/:year", getBilan);
router.post("/execute", closeFiscalYear);

export default router;
