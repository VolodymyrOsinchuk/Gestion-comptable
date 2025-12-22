import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const TVAItem = sequelize.define(
  "TVAItem",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    rate: {
      type: DataTypes.DECIMAL(4, 2), // e.g., 20.00
      allowNull: false,
    },
    base_ht: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
    },
    tva_collected: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
    },
    tva_deductible: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
    },
    net: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
    },
  },
  {
    tableName: "tva_items",
    indexes: [{ fields: ["rate"] }],
  }
);

export default TVAItem;
