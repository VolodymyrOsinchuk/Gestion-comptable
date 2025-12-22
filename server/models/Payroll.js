import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Payroll = sequelize.define(
  "Payroll",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    period: {
      type: DataTypes.STRING(7),
      allowNull: false,
    },
    employee_count: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    total_gross: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    total_charges: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    total_net: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("draft", "calculated", "validated", "paid"),
      defaultValue: "draft",
    },
    payment_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    data: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
  },
  {
    tableName: "payrolls",
    indexes: [{ fields: ["period"] }, { fields: ["status"] }],
  }
);

export default Payroll;
