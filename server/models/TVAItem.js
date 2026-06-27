import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const TvaDeclarationLine = sequelize.define(
  "TvaDeclarationLine",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    tva_report_id: {
      type: DataTypes.INTEGER, allowNull: false,
      references: { model: "tva_reports", key: "id" },
    },
    vat_type: {
      type: DataTypes.ENUM(
        "collectee", "deductible_abs", "deductible_immob",
        "importation", "intracommunautaire", "autoliquidation", "regularisation"
      ),
      allowNull: false,
    },
    account_number: { type: DataTypes.STRING(20), allowNull: false },
    counter_account: { type: DataTypes.STRING(20), allowNull: true },
    base_amount: { type: DataTypes.DECIMAL(14, 2), defaultValue: 0 },
    tax_rate: { type: DataTypes.DECIMAL(4, 2), defaultValue: 0 },
    tax_amount: { type: DataTypes.DECIMAL(14, 2), defaultValue: 0 },
    ttc_amount: { type: DataTypes.DECIMAL(14, 2), defaultValue: 0 },
    entry_number: { type: DataTypes.STRING(20), allowNull: true },
    entry_date: { type: DataTypes.DATEONLY, allowNull: true },
    fiscal_year: { type: DataTypes.INTEGER, allowNull: true },
    label: { type: DataTypes.STRING, allowNull: true },
  },
  {
    tableName: "tva_items",
    timestamps: true,
    indexes: [
      { fields: ["tva_report_id"] },
      { fields: ["vat_type"] },
      { fields: ["entry_number"] },
      { fields: ["account_number"] },
    ],
  }
);

export default TvaDeclarationLine;
