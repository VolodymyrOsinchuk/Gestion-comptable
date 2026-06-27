import { Router } from "express";
import {
  createEntry,
  getBalance,
  getEntries,
  getGrandLivre,
  getIncomeStatement,
  updateEntry,
} from "../controllers/accountingController.js";

const router = Router();

router.get("/:companyId/balance", getBalance);
router.get("/:companyId/entries", getEntries);
router.get("/:companyId/grand-livre", getGrandLivre);
router.get("/:companyId/resultat", getIncomeStatement);
router.post("/:companyId/entries", createEntry);
router.patch("/:companyId/entries/:entryId", updateEntry);

export default router;
