import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import taskRoutes from "../routes/tasks.js";

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get("/", (req, res) => {
  res.json({ message: "API PERN fonctionnelle!" });
});

app.use("/api/tasks", taskRoutes);

// Pour le développement local
const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
  });
}

export default app;
