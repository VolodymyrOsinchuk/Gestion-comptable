import { Router } from "express";
import Journal from "../models/Journal.js";

const router = Router();

router.get("/:companyId", async (req, res) => {
  try {
    const journals = await Journal.findAll({
      where: { company_id: req.params.companyId, is_active: true },
      order: [["code", "ASC"]],
    });
    res.json({ journals });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
