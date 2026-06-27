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
    company_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "companies",
        key: "id",
      },
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
    indexes: [
      { fields: ["company_id"] },
      { fields: ["period"] },
      { fields: ["status"] },
    ],
    getterMethods: {
      employees() { return this.employee_count; },
      grossTotal() { return this.total_gross; },
      netTotal() { return this.total_net; },
    },
  }
);

export default Payroll;
