import { Router } from "express";
const router = Router();
import {
  listAccounts,
  getAccount,
  createAccount,
  updateAccount,
  toggleAccount,
  deleteAccount,
  seedAccounts,
  forceSeedAccounts,
  getClasses,
} from "../controllers/chartOfAccountsController.js";
import { validate, chartAccountSchema } from "../middleware/validate.js";

router.get("/:companyId/classes", getClasses);
router.post("/:companyId/seed", seedAccounts);
router.post("/:companyId/seed/force", forceSeedAccounts);
router.get("/:companyId", listAccounts);
router.get("/:companyId/:id", getAccount);
router.post("/:companyId", validate(chartAccountSchema), createAccount);
router.put("/:companyId/:id", validate(chartAccountSchema), updateAccount);
router.patch("/:companyId/:id/toggle", toggleAccount);
router.delete("/:companyId/:id", deleteAccount);

export default router;
