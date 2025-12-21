import express from "express";
import cors from "cors";
import morgan from "morgan";

import sequelize from "../config/db.js";
import taskRoutes from "../routes/tasks.js";
import Task from "../models/Task.js";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// Routes
app.get("/", (req, res) => {
  res.json({ message: "API PERN fonctionnelle!" });
});

app.use("/api/tasks", taskRoutes);

const startDB = async () => {
  try {
    await sequelize.authenticate();
    console.log("Connexion à la base de données réussie.");
  } catch (error) {
    console.error("Erreur de connexion à la base de données :", error);
  }
};

// Pour le développement local
const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
  });
  startDB();
}

export default app;
