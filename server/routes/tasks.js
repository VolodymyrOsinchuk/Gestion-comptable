import express from "express";
import Task from "../models/Task.js";

const router = express.Router();

// ✅ GET toutes les tâches
router.get("/", async (req, res) => {
  try {
    const tasks = await Task.findAll({ order: [["id", "ASC"]] });
    res.json(tasks);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// ✅ POST nouvelle tâche
router.post("/", async (req, res) => {
  try {
    const { title, description } = req.body;

    const task = await Task.create({ title, description });

    res.json(task);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// ✅ DELETE tâche
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await Task.destroy({ where: { id } });

    if (!deleted) {
      return res.status(404).json({ error: "Tâche introuvable" });
    }

    res.json({ message: "Tâche supprimée" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

export default router;
