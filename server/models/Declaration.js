import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Declaration = sequelize.define(
  "Declaration",
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
    },
    type: {
      type: DataTypes.ENUM(
        "is",
        "tva",
        "cfet",
        "cvae",
        "deb",
        "des",
        "urssaf",
        "social"
      ),
      allowNull: false,
    },
    period_start: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    period_end: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    deadline: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("draft", "prepared", "submitted", "validated"),
      defaultValue: "draft",
    },
    submission_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    data: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    file_path: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    tableName: "declarations",
    indexes: [
      { fields: ["company_id"] },
      { fields: ["type"] },
      { fields: ["deadline"] },
      { fields: ["status"] },
    ],
  }
);

export default Declaration;
