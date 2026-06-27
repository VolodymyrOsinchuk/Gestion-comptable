import { Router } from "express";
import { createEntry, getBalance, getGrandLivre, getIncomeStatement } from "../controllers/accountingController.js";

const router = Router();

router.get("/:companyId/balance", getBalance);
router.get("/:companyId/grand-livre", getGrandLivre);
router.get("/:companyId/resultat", getIncomeStatement);
router.post("/:companyId/entries", createEntry);

export default router;
