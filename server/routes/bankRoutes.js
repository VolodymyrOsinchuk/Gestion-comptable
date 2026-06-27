import { Router } from "express";
import { getTransactions, getBankAccounts } from "../controllers/bankController.js";

const router = Router();

router.get("/companies/:companyId/transactions", getTransactions);
router.get("/companies/:companyId/accounts", getBankAccounts);

export default router;
