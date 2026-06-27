// ==========================================
// 2. CHART_OF_ACCOUNTS.JS - Plan Comptable
// Définit les comptes comptables disponibles pour chaque entreprise
// Basé sur le Plan Comptable Général français (classes 1 à 9)
// Permet la personnalisation par entreprise
// ==========================================
import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const ChartOfAccounts = sequelize.define(
  "ChartOfAccounts",
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
      comment: "Entreprise propriétaire de ce compte",
    },
    account_number: {
      type: DataTypes.STRING(20),
      allowNull: false,
      comment: "Numéro de compte (ex: 411000, 512001, 706000)",
    },
    account_label: {
      type: DataTypes.STRING,
      allowNull: false,
      comment:
        "Libellé du compte (ex: Clients, Banque BNP, Prestations de services)",
    },
    account_type: {
      type: DataTypes.ENUM(
        "asset", // Actif (classe 1-2-3)
        "liability", // Passif (classe 1-2-4-5)
        "equity", // Capitaux propres (classe 1)
        "revenue", // Produits (classe 7)
        "expense", // Charges (classe 6)
        "special" // Comptes spéciaux (classe 8-9)
      ),
      allowNull: false,
      comment: "Type de compte selon la classification comptable",
    },
    account_class: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 9,
      },
      comment:
        "Classe du compte PCG (1=Capitaux, 2=Immobilisations, 3=Stocks, 4=Tiers, 5=Financiers, 6=Charges, 7=Produits, 8=Spéciaux)",
    },
    parent_account: {
      type: DataTypes.STRING(20),
      allowNull: true,
      comment: "Compte parent pour la hiérarchie (ex: 411 pour 411000)",
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      comment: "Compte actif et utilisable",
    },
    can_reconcile: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment:
        "Le lettrage est-il possible sur ce compte ? (ex: 411 Clients, 401 Fournisseurs)",
    },
    requires_third_party: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment:
        "Ce compte nécessite-t-il obligatoirement un tiers ? (clients/fournisseurs)",
    },
    tva_applicable: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: "La TVA s'applique-t-elle sur ce compte ?",
    },
    default_tva_rate: {
      type: DataTypes.DECIMAL(4, 2),
      allowNull: true,
      comment: "Taux de TVA par défaut (ex: 20.00, 10.00, 5.50)",
    },
    can_post: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      comment: "Ce compte peut-il recevoir des écritures comptables ?",
    },
    usage_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: "Nombre d'utilisations de ce compte dans les écritures",
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "Notes internes sur l'utilisation du compte",
    },
  },
  {
    tableName: "chart_of_accounts",
    timestamps: true,
    indexes: [
      { fields: ["company_id", "account_number"], unique: true },
      { fields: ["account_type"] },
      { fields: ["account_class"] },
      { fields: ["is_active"] },
    ],
  }
);

export default ChartOfAccounts;
