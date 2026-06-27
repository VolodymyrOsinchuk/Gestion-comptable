import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const FiscalYear = sequelize.define("FiscalYear", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  company_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: "companies", key: "id" },
  },
  year: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: "Année de l'exercice",
  },
  status: {
    type: DataTypes.ENUM("open", "closed"),
    defaultValue: "open",
    comment: "Statut de l'exercice (ouvert / clôturé)",
  },
  closed_at: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: "Date de clôture",
  },
  closed_by: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: "Utilisateur ayant clôturé",
  },
  result: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0,
    comment: "Résultat de l'exercice (bénéfice + / perte -)",
  },
  closing_entry_number: {
    type: DataTypes.STRING(20),
    allowNull: true,
    comment: "Numéro d'écriture de clôture",
  },
  opening_entry_number: {
    type: DataTypes.STRING(20),
    allowNull: true,
    comment: "Numéro d'écriture d'ouverture (À-Nouveaux)",
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: "fiscal_years",
  timestamps: true,
  indexes: [
    { fields: ["company_id", "year"], unique: true },
    { fields: ["status"] },
  ],
});

export default FiscalYear;
