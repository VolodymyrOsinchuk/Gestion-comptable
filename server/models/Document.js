import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Document = sequelize.define(
  "Document",
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
      comment: "Entreprise propriétaire de ce document",
    },
    reference: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      comment: "Date du document",
    },
    due_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      comment: "Date d'échéance de paiement",
    },
    type: {
      type: DataTypes.ENUM(
        "invoice_customer", // Facture de vente (émise)
        "invoice_supplier", // Facture d'achat (reçue)
        "credit_note", // Avoir (annulation partielle/totale)
        "receipt", // Reçu
        "quote", // Devis
        "order", // Bon de commande
        "delivery", // Bon de livraison
        "other" // Autre
      ),
      allowNull: false,
      comment: "Type de document commercial",
    },
    third_party_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "third_parties",
        key: "id",
      },
      comment: "Client ou fournisseur concerné",
    },
    supplier: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    amount_ht: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    amount_tva: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    amount_ttc: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
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
      allowNull: true,
      comment: "Mode de paiement prévu ou utilisé",
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM(
        "draft", // Brouillon
        "pending", // En attente
        "validated", // Validé
        "partially_paid", // Partiellement payé
        "paid", // Payé
        "cancelled", // Annulé
        "overdue" // En retard
      ),
      defaultValue: "pending",
      comment: "Statut du document",
    },
    is_accounted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: "Document passé en comptabilité (écritures générées)",
    },
    accounted_at: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: "Date de passage en comptabilité",
    },
    file_path: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "Chemin vers le fichier PDF du document",
    },
    ocr_data: {
      type: DataTypes.JSONB,
      allowNull: true,
      comment: "Données extraites par OCR (reconnaissance automatique)",
    },
    file_path: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "Chemin vers le fichier PDF du document (alternatif)",
    },
  },
  {
    tableName: "documents",
    indexes: [
      { fields: ["company_id", "reference"], unique: true },
      { fields: ["status"] },
      { fields: ["type"] },
    ],
  }
);

export default Document;
