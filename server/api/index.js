import express from "express";
import cors from "cors";
import morgan from "morgan";

import sequelize from "../config/db.js";
import seedDatabase from "../seedData.js";

// Ensure models are loaded and associations initialized
import "../models/index.js";

// import documentRoutes from "./routes/documentRoutes";
// import bankRoutes from "./routes/bankRoutes";
// import declarationRoutes from "./routes/declarationRoutes";
// import payrollRoutes from "./routes/payrollRoutes";
// import accountingRoutes from "./routes/accountingRoutes";
// import analysisRoutes from "./routes/analysisRoutes";
// import tvaRoutes from "./routes/tvaRoutes";
import companyRoutes from "../routes/companyRoutes.js";
import tvaRoutes from "../routes/tvaRoutes.js";
import documentRoutes from "../routes/documentRoutes.js";
import clotureRoutes from "../routes/clotureRoutes.js";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.get("/", (req, res) => {
  res.json({ message: "API PERN fonctionnelle!" });
});

app.get("/api/v1", (req, res) => {
  res.json({ message: "API V1 PERN fonctionnelle!" });
});

// Routes
app.use("/api/v1/companies", companyRoutes);
app.use("/api/v1/tva", tvaRoutes);
app.use("/api/v1/documents", documentRoutes);
app.use("/api/v1/closing", clotureRoutes);
// app.use("/api/documents", documentRoutes);
// app.use("/api/bank", bankRoutes);
// app.use("/api/declarations", declarationRoutes);
// app.use("/api/payroll", payrollRoutes);
// app.use("/api/accounting", accountingRoutes);
// app.use("/api/analysis", analysisRoutes);
// app.use("/api/tva", tvaRoutes);

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
  if (process.env.SEED === "true") {
    // Run seed only when explicitly requested to avoid duplicate inserts on nodemon restarts
    seedDatabase();
  }
}

export default app;
