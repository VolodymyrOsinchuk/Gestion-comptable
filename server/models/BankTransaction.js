import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const BankTransaction = sequelize.define(
  "BankTransaction",
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
      comment: "Entreprise propriétaire de cette transaction",
    },
    bank_account_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "bank_accounts",
        key: "id",
      },
      comment: "Compte bancaire concerné",
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      comment: "Date de l'opération bancaire",
    },
    value_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      comment: "Date de valeur (prise en compte par la banque)",
    },
    label: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: "Libellé de l'opération (tel que sur le relevé)",
    },
    reference: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "Référence bancaire (n° chèque, n° virement, etc.)",
    },
    debit: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: true,
      defaultValue: 0,
      comment: "Montant débité (sortie d'argent)",
    },
    credit: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: true,
      defaultValue: 0,
      comment: "Montant crédité (entrée d'argent)",
    },
    balance: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      comment: "Solde après opération",
    },
    status: {
      type: DataTypes.ENUM(
        "imported", // Importé du relevé
        "pending", // En attente de traitement
        "matched", // Associé à une écriture comptable
        "reconciled", // Rapproché et validé
        "ignored" // À ignorer (erreur, doublon)
      ),
      defaultValue: "pending",
      comment: "Statut du traitement de la transaction",
    },
    matched_document_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "documents",
        key: "id",
      },
      comment: "Document commercial associé (facture, avoir, etc.)",
    },
    matched_entry_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "accounting_entries",
        key: "id",
      },
      comment: "Écriture comptable correspondante (si rapprochée)",
    },
    category: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "Catégorie automatique détectée (ex: Salaires, Loyer, TVA)",
    },
    third_party_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "third_parties",
        key: "id",
      },
      comment: "Tiers identifié automatiquement ou manuellement",
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "Notes sur la transaction",
    },
  },
  {
    tableName: "bank_transactions",
    timestamps: true,
    indexes: [
      { fields: ["company_id"] },
      { fields: ["bank_account_id"] },
      { fields: ["date"] },
      { fields: ["status"] },
    ],
  }
);

export default BankTransaction;
