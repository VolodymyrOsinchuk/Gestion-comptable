import Document from "./Document.js";
import BankTransaction from "./BankTransaction.js";
import BankAccount from "./BankAccount.js";
import Declaration from "./Declaration.js";
import AccountingEntry from "./AccountingEntry.js";
import Payroll from "./Payroll.js";
import Company from "./Company.js";
import TvaDeclaration from "./TVAReport.js";
import TvaDeclarationLine from "./TVAItem.js";
import ChartOfAccounts from "./ChartOfAccounts.js";
import ThirdParty from "./ThirdParty.js";
import Journal from "./Journal.js";
import FiscalYear from "./FiscalYear.js";

// Company associations
Company.hasMany(Journal, { foreignKey: "company_id", as: "journals" });
Company.hasMany(Document, { foreignKey: "company_id", as: "documents" });
Company.hasMany(AccountingEntry, { foreignKey: "company_id", as: "accountingEntries" });
Company.hasMany(BankAccount, { foreignKey: "company_id", as: "bankAccounts" });
Company.hasMany(BankTransaction, { foreignKey: "company_id", as: "bankTransactions" });
Company.hasMany(ChartOfAccounts, { foreignKey: "company_id", as: "chartOfAccounts" });
Company.hasMany(ThirdParty, { foreignKey: "company_id", as: "thirdParties" });
Company.hasMany(Declaration, { foreignKey: "company_id", as: "declarations" });
Company.hasMany(Payroll, { foreignKey: "company_id", as: "payrolls" });
Company.hasMany(TvaDeclaration, { foreignKey: "company_id", as: "tvaDeclarations" });
Company.hasMany(FiscalYear, { foreignKey: "company_id", as: "fiscalYears" });

Journal.belongsTo(Company, { foreignKey: "company_id", as: "company" });
Document.belongsTo(Company, { foreignKey: "company_id", as: "company" });
AccountingEntry.belongsTo(Company, { foreignKey: "company_id", as: "company" });
BankAccount.belongsTo(Company, { foreignKey: "company_id", as: "company" });
BankTransaction.belongsTo(Company, { foreignKey: "company_id", as: "company" });
ChartOfAccounts.belongsTo(Company, { foreignKey: "company_id", as: "company" });
ThirdParty.belongsTo(Company, { foreignKey: "company_id", as: "company" });
Declaration.belongsTo(Company, { foreignKey: "company_id", as: "company" });
Payroll.belongsTo(Company, { foreignKey: "company_id", as: "company" });
TvaDeclaration.belongsTo(Company, { foreignKey: "company_id", as: "company" });
FiscalYear.belongsTo(Company, { foreignKey: "company_id", as: "company" });

// BankAccount <-> BankTransaction
BankAccount.hasMany(BankTransaction, { foreignKey: "bank_account_id", as: "transactions" });
BankTransaction.belongsTo(BankAccount, { foreignKey: "bank_account_id", as: "account" });

// BankTransaction <-> Document
BankTransaction.belongsTo(Document, { foreignKey: "matched_document_id", as: "matchedDocument" });
Document.hasOne(BankTransaction, { foreignKey: "matched_document_id", as: "bankTransaction" });

// Document <-> ThirdParty
Document.belongsTo(ThirdParty, { foreignKey: "third_party_id", as: "thirdParty" });
ThirdParty.hasMany(Document, { foreignKey: "third_party_id", as: "documents" });

// AccountingEntry <-> ThirdParty
AccountingEntry.belongsTo(ThirdParty, { foreignKey: "third_party_id", as: "thirdParty" });
ThirdParty.hasMany(AccountingEntry, { foreignKey: "third_party_id", as: "accountingEntries" });

// TVA declaration <-> TVA lines
TvaDeclaration.hasMany(TvaDeclarationLine, { foreignKey: "tva_report_id", as: "lines" });
TvaDeclarationLine.belongsTo(TvaDeclaration, { foreignKey: "tva_report_id", as: "declaration" });

export {
  Document,
  BankTransaction,
  BankAccount,
  Declaration,
  AccountingEntry,
  Payroll,
  Company,
  TvaDeclaration as TVAReport,
  TvaDeclarationLine as TVAItem,
  ChartOfAccounts,
  ThirdParty,
  Journal,
  FiscalYear,
};
