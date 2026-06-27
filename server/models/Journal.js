import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Journal = sequelize.define(
  "Journal",
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
      comment: "Entreprise propriétaire de ce journal",
    },
    code: {
      type: DataTypes.STRING(10),
      allowNull: false,
      comment: "Code du journal (ex: VE, AC, BQ1, CA, OD)",
    },
    label: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: "Libellé du journal (ex: Ventes, Achats, Banque BNP, Caisse)",
    },
    type: {
      type: DataTypes.ENUM(
        "AC", // Achat - Factures fournisseurs
        "VE", // Vente - Factures clients
        "BQ", // Banque - Mouvements bancaires
        "CA", // Caisse - Espèces
        "OD", // Opérations Diverses - Écritures manuelles
        "AN", // À-Nouveaux - Reprise des soldes N-1
        "CL" // Clôture - Résultat d'exercice
      ),
      allowNull: false,
      comment: "Type de journal selon les normes comptables",
    },
    default_account: {
      type: DataTypes.STRING(20),
      allowNull: true,
      comment:
        "Compte de contrepartie par défaut (ex: 512001 pour journal banque)",
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      comment: "Journal actif et utilisable",
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "Notes sur l'utilisation du journal",
    },
  },
  {
    tableName: "journals",
    timestamps: true,
    indexes: [
      { fields: ["company_id", "code"], unique: true },
      { fields: ["type"] },
      { fields: ["is_active"] },
    ],
  }
);

export default Journal;
