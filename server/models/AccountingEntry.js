import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const AccountingEntry = sequelize.define(
  "AccountingEntry",
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
      comment: "Entreprise propriétaire de cette écriture",
    },
    journal_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "journals",
        key: "id",
      },
      comment: "Journal dans lequel l'écriture est enregistrée",
    },
    entry_number: {
      type: DataTypes.STRING(20),
      allowNull: false,
      comment: "Numéro de pièce comptable (plusieurs lignes = même numéro)",
    },
    entry_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      comment: "Date de l'opération comptable",
    },
    account_number: {
      type: DataTypes.STRING(20),
      allowNull: false,
      comment: "Numéro du compte mouvementé (référence au plan comptable)",
    },
    third_party_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "third_parties",
        key: "id",
      },
      comment: "Tiers concerné si applicable (client/fournisseur)",
    },
    label: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: "Libellé de l'écriture (description de l'opération)",
    },
    piece_ref: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "Référence du document source (n° facture, n° chèque, etc.)",
    },
    debit: {
      type: DataTypes.DECIMAL(12, 2),
      defaultValue: 0,
      comment: "Montant au débit en euros",
    },
    credit: {
      type: DataTypes.DECIMAL(12, 2),
      defaultValue: 0,
      comment: "Montant au crédit en euros",
    },
    lettrage: {
      type: DataTypes.STRING(10),
      allowNull: true,
      comment: "Code de lettrage pour le rapprochement (ex: A, B, AA, AB...)",
    },
    is_lettred: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: "L'écriture est-elle lettrée (rapprochée) ?",
    },
    due_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      comment: "Date d'échéance pour les créances et dettes",
    },
    fiscal_year: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "Exercice comptable (année)",
    },
    is_validated: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: "L'écriture est-elle validée et non modifiable ?",
    },
    validated_at: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: "Date et heure de validation",
    },
    validated_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: "ID de l'utilisateur qui a validé",
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "Notes complémentaires sur l'écriture",
    },
  },
  {
    tableName: "accounting_entries",
    timestamps: true,
    hooks: {
      beforeUpdate: (entry, options) => {
        if (entry.previous && entry.previous("is_validated") === true) {
          throw new Error("Impossible de modifier une écriture validée. Utilisez une contrepassation.");
        }
      },
      beforeDestroy: (entry, options) => {
        const wasValidated = entry.previous ? entry.previous("is_validated") : entry.is_validated;
        if (wasValidated === true) {
          throw new Error("Impossible de supprimer une écriture validée. Utilisez une contrepassation.");
        }
      },
    },
    indexes: [
      { fields: ["company_id"] },
      { fields: ["journal_id"] },
      { fields: ["entry_date"] },
      { fields: ["account_number"] },
      { fields: ["fiscal_year"] },
      { fields: ["lettrage"] },
      { fields: ["is_validated"] },
      { fields: ["entry_number"] },
    ],
  }
);
export default AccountingEntry;
