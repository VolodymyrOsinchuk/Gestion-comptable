import express from "express";
import {
  createReport,
  listReports,
  getReport,
  calculateReport,
  generateCA3,
} from "../controllers/tvaController.js";

const router = express.Router();

// GET /api/tva
router.get("/", listReports);

// GET /api/tva/:id
router.get("/:id", getReport);

// POST /api/tva
router.post("/", createReport);

// POST /api/tva/:id/calculate
router.post("/:id/calculate", calculateReport);

// POST /api/tva/:id/generate-ca3
router.post("/:id/generate-ca3", generateCA3);

export default router;
