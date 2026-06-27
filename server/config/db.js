import { Sequelize } from "sequelize";
import dotenv from "dotenv";
import path from "path";
import pg from "pg";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envFile =
  process.env.NODE_ENV === "production"
    ? ".env.production"
    : ".env.development";

dotenv.config({
  path: path.join(__dirname, "..", envFile),
});

const dbUrl = new URL(process.env.DATABASE_URL);
dbUrl.searchParams.set("uselibpqcompat", "true");
dbUrl.searchParams.set("sslmode", "require");

const sequelize = new Sequelize(dbUrl.toString(), {
  dialect: "postgres",
  protocol: "postgres",
  dialectModule: pg,
  logging: false,
});

export default sequelize;
