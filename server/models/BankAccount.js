import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const BankAccount = sequelize.define(
  "BankAccount",
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
      comment: "Entreprise propriétaire de ce compte bancaire",
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: "Nom du compte bancaire (ex: Compte courant BNP, Livret A)",
    },
    iban: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: "IBAN du compte bancaire",
    },
    bic: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "Code BIC/SWIFT de la banque",
    },
    bank_name: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: "Nom de la banque (ex: BNP Paribas, Crédit Agricole)",
    },
    account_number: {
      type: DataTypes.STRING(20),
      allowNull: false,
      comment: "Compte comptable associé (commence par 512 pour banque)",
    },
    journal_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "journals",
        key: "id",
      },
      comment: "Journal banque associé pour les écritures",
    },
    current_balance: {
      type: DataTypes.DECIMAL(12, 2),
      defaultValue: 0,
      comment: "Solde bancaire réel (selon le relevé)",
    },
    accounting_balance: {
      type: DataTypes.DECIMAL(12, 2),
      defaultValue: 0,
      comment: "Solde comptable (selon les écritures comptables)",
    },
    last_reconciliation_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      comment: "Date du dernier rapprochement bancaire effectué",
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      comment: "Compte bancaire actif",
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "Notes sur le compte bancaire",
    },
  },
  {
    tableName: "bank_accounts",
    timestamps: true,
    indexes: [
      { fields: ["company_id"] },
      { fields: ["account_number"] },
      { fields: ["is_active"] },
    ],
  }
);

export default BankAccount;
