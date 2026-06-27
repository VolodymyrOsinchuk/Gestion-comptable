import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Company = sequelize.define(
  "Company",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: "Nom commercial de l'entreprise",
    },
    siret: {
      type: DataTypes.STRING(14),
      allowNull: false,
      comment: "Numéro SIRET à 14 chiffres",
    },
    siren: {
      type: DataTypes.STRING(9),
      allowNull: true,
      comment: "Numéro SIREN à 9 chiffres (extrait du SIRET)",
    },
    tva_number: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "Numéro de TVA intracommunautaire",
    },
    naf_code: {
      type: DataTypes.STRING(5),
      allowNull: true,
      comment: "Code NAF/APE de l'activité",
    },
    legal_form: {
      type: DataTypes.ENUM(
        "SARL",
        "EURL",
        "SAS",
        "SASU",
        "SA",
        "SNC",
        "EI",
        "Auto",
        "Association"
      ),
      allowNull: true,
      comment: "Forme juridique de l'entreprise",
    },
    address: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: "Adresse du siège social",
    },
    postal_code: {
      type: DataTypes.STRING(5),
      allowNull: true,
      comment: "Code postal",
    },
    city: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "Ville",
    },
    country: {
      type: DataTypes.STRING,
      defaultValue: "France",
      comment: "Pays",
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: "Email de contact principal",
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: "Téléphone principal",
    },
    website: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "Site web de l'entreprise",
    },
    capital: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      comment: "Capital social en euros",
    },
    fiscal_year_start: {
      type: DataTypes.STRING(5),
      defaultValue: "01-01",
      comment: "Début d'exercice comptable - Format: MM-DD",
    },
    fiscal_year_end: {
      type: DataTypes.STRING(5),
      defaultValue: "12-31",
      comment: "Fin d'exercice comptable - Format: MM-DD",
    },
    tva_regime: {
      type: DataTypes.ENUM("normal", "simplifie", "reel", "franchise"),
      defaultValue: "normal",
      comment: "Régime de TVA applicable",
    },
    tva_frequency: {
      type: DataTypes.ENUM("monthly", "quarterly", "yearly"),
      allowNull: true,
      comment: "Fréquence de déclaration (auto-détectée si non renseignée)",
    },
    accounting_plan: {
      type: DataTypes.ENUM("PCG", "Custom"),
      defaultValue: "PCG",
      comment: "Plan Comptable Général (PCG) ou personnalisé",
    },
    status: {
      type: DataTypes.ENUM("active", "inactive", "suspended", "archived"),
      defaultValue: "active",
      comment: "Statut de l'entreprise dans l'application",
    },
    logo_url: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "URL du logo de l'entreprise",
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "Notes internes sur l'entreprise",
    },
  },
  {
    tableName: "companies",
    timestamps: true,
    indexes: [
      { fields: ["siret"], unique: true },
      { fields: ["status"] },
      { fields: ["name"] },
    ],
  }
);

export default Company;
