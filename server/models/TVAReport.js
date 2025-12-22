import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const TVAReport = sequelize.define(
  "TVAReport",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    period: {
      type: DataTypes.STRING, // format YYYY-MM
      allowNull: false,
    },
    regime: {
      type: DataTypes.ENUM("normal", "simplifie", "reel"),
      allowNull: false,
      defaultValue: "normal",
    },
    total_collected: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
    },
    total_deductible: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
    },
    net: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
    },
    due_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM("draft", "calculated", "declared"),
      allowNull: false,
      defaultValue: "draft",
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: "tva_reports",
    indexes: [{ fields: ["period"] }, { fields: ["status"] }],
  }
);

export default TVAReport;
