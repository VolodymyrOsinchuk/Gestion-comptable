// ==========================================
// 3. THIRD_PARTY.JS - Tiers (Clients/Fournisseurs)
// Gère les partenaires commerciaux de l'entreprise
// Un tiers peut être client, fournisseur, ou les deux
// Centralise toutes les informations commerciales et comptables
// ==========================================
import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const ThirdParty = sequelize.define(
  "ThirdParty",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    company_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "companies",
        key: "id",
      },
      comment: "Entreprise propriétaire de ce tiers",
    },
    code: {
      type: DataTypes.STRING(20),
      allowNull: false,
      comment: "Code unique du tiers dans l'entreprise (ex: CLI001, FRS042)",
    },
    type: {
      type: DataTypes.ENUM("customer", "supplier", "both", "other"),
      allowNull: false,
      comment: "Type de relation commerciale",
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: "Nom commercial ou raison sociale",
    },
    legal_name: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "Raison sociale officielle si différente",
    },
    siret: {
      type: DataTypes.STRING(14),
      allowNull: true,
      comment: "Numéro SIRET du tiers",
    },
    tva_number: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "Numéro de TVA intracommunautaire",
    },
    address: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "Adresse complète",
    },
    postal_code: {
      type: DataTypes.STRING(10),
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
      allowNull: true,
      validate: {
        isEmail: true,
      },
      comment: "Email de contact principal",
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "Téléphone principal",
    },
    customer_account: {
      type: DataTypes.STRING(20),
      allowNull: true,
      comment: "Compte comptable client (commence par 411)",
    },
    supplier_account: {
      type: DataTypes.STRING(20),
      allowNull: true,
      comment: "Compte comptable fournisseur (commence par 401)",
    },
    payment_terms: {
      type: DataTypes.INTEGER,
      defaultValue: 30,
      comment: "Délai de paiement en jours (30, 45, 60...)",
    },
    payment_method: {
      type: DataTypes.ENUM(
        "virement",
        "prelevement",
        "cheque",
        "especes",
        "cb",
        "autre"
      ),
      defaultValue: "virement",
      comment: "Mode de paiement préféré",
    },
    credit_limit: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      comment: "Encours maximum autorisé en euros",
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      comment: "Tiers actif dans le système",
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "Notes commerciales ou comptables",
    },
  },
  {
    tableName: "third_parties",
    timestamps: true,
    indexes: [
      { fields: ["company_id", "code"], unique: true },
      { fields: ["type"] },
      { fields: ["is_active"] },
      { fields: ["name"] },
    ],
  }
);

export default ThirdParty;
