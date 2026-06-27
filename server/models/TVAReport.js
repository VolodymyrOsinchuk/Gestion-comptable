import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const TvaDeclaration = sequelize.define(
  "TvaDeclaration",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    company_id: {
      type: DataTypes.INTEGER, allowNull: false,
      references: { model: "companies", key: "id" },
    },
    period_start: { type: DataTypes.DATEONLY, allowNull: false },
    period_end: { type: DataTypes.DATEONLY, allowNull: false },
    period_label: {
      type: DataTypes.STRING(20), allowNull: false,
      comment: "Label période: 2026-06, 2026-Q2, 2026",
    },
    frequency: {
      type: DataTypes.ENUM("monthly", "quarterly", "yearly"),
      allowNull: false, defaultValue: "monthly",
    },
    status: {
      type: DataTypes.ENUM("draft", "computed", "declared", "locked"),
      allowNull: false, defaultValue: "draft",
      comment: "draft=calcul en cours, computed=calculé, declared=déclaré, locked=verrouillé",
    },
    total_collectee: { type: DataTypes.DECIMAL(14, 2), defaultValue: 0 },
    total_deductible_abs: { type: DataTypes.DECIMAL(14, 2), defaultValue: 0 },
    total_deductible_immob: { type: DataTypes.DECIMAL(14, 2), defaultValue: 0 },
    total_deductible_import: { type: DataTypes.DECIMAL(14, 2), defaultValue: 0 },
    total_intracommunautaire: { type: DataTypes.DECIMAL(14, 2), defaultValue: 0 },
    total_autoliquidation: { type: DataTypes.DECIMAL(14, 2), defaultValue: 0 },
    net_due: { type: DataTypes.DECIMAL(14, 2), defaultValue: 0 },
    credit_tva: { type: DataTypes.DECIMAL(14, 2), defaultValue: 0 },
    locked_at: { type: DataTypes.DATE, allowNull: true },
    notes: { type: DataTypes.TEXT, allowNull: true },
  },
  {
    tableName: "tva_reports",
    timestamps: true,
    indexes: [
      { fields: ["company_id"] },
      { fields: ["company_id", "period_label"], unique: true },
      { fields: ["period_start", "period_end"] },
      { fields: ["status"] },
    ],
  }
);

export default TvaDeclaration;
