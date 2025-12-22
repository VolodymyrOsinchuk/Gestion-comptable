import Document from "./Document.js";
import BankTransaction from "./BankTransaction.js";
import BankAccount from "./BankAccount.js";
import Declaration from "./Declaration.js";
import AccountingEntry from "./AccountingEntry.js";
import Payroll from "./Payroll.js";
import Company from "./Company.js";
import TVAReport from "./TVAReport.js";
import TVAItem from "./TVAItem.js";
import ChartOfAccounts from "./ChartOfAccounts.js";
import ThirdParty from "./ThirdParty.js";
import Journal from "./Journal.js";

// Associations
BankAccount.hasMany(BankTransaction, {
  foreignKey: "account_id",
  as: "transactions",
});

BankTransaction.belongsTo(BankAccount, {
  foreignKey: "account_id",
  as: "account",
});

BankTransaction.belongsTo(Document, {
  foreignKey: "matched_document_id",
  as: "matchedDocument",
});

Document.hasOne(BankTransaction, {
  foreignKey: "matched_document_id",
  as: "bankTransaction",
});

TVAReport.hasMany(TVAItem, { foreignKey: "tva_report_id", as: "items" });
TVAItem.belongsTo(TVAReport, { foreignKey: "tva_report_id", as: "report" });

export {
  Document,
  BankTransaction,
  BankAccount,
  Declaration,
  AccountingEntry,
  Payroll,
  Company,
  TVAReport,
  TVAItem,
  ChartOfAccounts,
  ThirdParty,
  Journal,
};
