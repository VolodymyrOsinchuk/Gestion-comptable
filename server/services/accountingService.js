import AccountingEntry from "../models/AccountingEntry.js";
import ThirdParty from "../models/ThirdParty.js";
import Journal from "../models/Journal.js";

export async function generateAccountingEntries(document, options = {}) {
  const { transaction: t } = options;
  const entryNumber = document.reference || `DOC-${document.id}`;
  const entryDate = document.date;

  const jType =
    document.type === "invoice_customer" ? "VE" :
    document.type === "invoice_supplier" ? "AC" : "OD";

  let journal = await Journal.findOne({
    where: { company_id: document.company_id, type: jType, is_active: true },
    transaction: t,
  });
  if (!journal) {
    journal = await Journal.findOne({
      where: { company_id: document.company_id, is_active: true },
      transaction: t,
    });
  }

  let thirdParty = null;
  if (document.third_party_id) {
    thirdParty = await ThirdParty.findByPk(document.third_party_id, { transaction: t });
  }

  const fiscalYear = new Date(document.date).getFullYear();
  const clientAccount = (thirdParty && thirdParty.customer_account) || "411000";
  const supplierAccount = (thirdParty && thirdParty.supplier_account) || "401000";
  const revenueAccount = "706000";
  const achatAccount = "607000";
  const tvaCollectee = "445710";
  const tvaDeductible = "445660";

  const entryDataList = [];

  function addEntry(data) {
    entryDataList.push({
      ...data,
      company_id: document.company_id,
      journal_id: journal?.id || null,
    });
  }

  if (document.type === "invoice_customer") {
    addEntry({
      entry_number: entryNumber, entry_date: entryDate,
      account_number: clientAccount, third_party_id: document.third_party_id,
      label: `Facture ${entryNumber}`, piece_ref: document.reference,
      debit: document.amount_ttc, credit: 0, fiscal_year: fiscalYear,
    });
    addEntry({
      entry_number: entryNumber, entry_date: entryDate,
      account_number: revenueAccount, label: `Vente ${entryNumber}`,
      debit: 0, credit: document.amount_ht, fiscal_year: fiscalYear,
    });
    if (Number(document.amount_tva) > 0) {
      addEntry({
        entry_number: entryNumber, entry_date: entryDate,
        account_number: tvaCollectee, label: `TVA collectée ${entryNumber}`,
        debit: 0, credit: document.amount_tva, fiscal_year: fiscalYear,
      });
    }
  } else if (document.type === "invoice_supplier") {
    addEntry({
      entry_number: entryNumber, entry_date: entryDate,
      account_number: achatAccount, label: `Achat ${entryNumber}`,
      debit: document.amount_ht, credit: 0, fiscal_year: fiscalYear,
    });
    if (Number(document.amount_tva) > 0) {
      addEntry({
        entry_number: entryNumber, entry_date: entryDate,
        account_number: tvaDeductible, label: `TVA déductible ${entryNumber}`,
        debit: document.amount_tva, credit: 0, fiscal_year: fiscalYear,
      });
    }
    addEntry({
      entry_number: entryNumber, entry_date: entryDate,
      account_number: supplierAccount, third_party_id: document.third_party_id,
      label: `Facture fournisseur ${entryNumber}`,
      debit: 0, credit: document.amount_ttc, fiscal_year: fiscalYear,
    });
  } else if (document.type === "credit_note") {
    const amtTtc = Math.abs(Number(document.amount_ttc || 0));
    const amtHt = Math.abs(Number(document.amount_ht || 0));
    const amtTva = Math.abs(Number(document.amount_tva || 0));
    addEntry({
      entry_number: entryNumber, entry_date: entryDate,
      account_number: clientAccount, third_party_id: document.third_party_id,
      label: `Avoir ${entryNumber}`, piece_ref: document.reference,
      debit: 0, credit: amtTtc, fiscal_year: fiscalYear,
    });
    addEntry({
      entry_number: entryNumber, entry_date: entryDate,
      account_number: revenueAccount, label: `Avoir produit ${entryNumber}`,
      debit: amtHt, credit: 0, fiscal_year: fiscalYear,
    });
    if (amtTva > 0) {
      addEntry({
        entry_number: entryNumber, entry_date: entryDate,
        account_number: tvaCollectee, label: `TVA Avoir ${entryNumber}`,
        debit: amtTva, credit: 0, fiscal_year: fiscalYear,
      });
    }
  }

  const totalDebit = entryDataList.reduce((s, d) => s + Number(d.debit || 0), 0);
  const totalCredit = entryDataList.reduce((s, d) => s + Number(d.credit || 0), 0);
  if (Math.abs(totalDebit - totalCredit) > 0.02) {
    throw new Error(
      `Écriture non équilibrée: Débit=${totalDebit.toFixed(2)} ≠ Crédit=${totalCredit.toFixed(2)}`
    );
  }

  const entries = await Promise.all(entryDataList.map(data =>
    AccountingEntry.create(data, { transaction: t })
  ));

  return entries;
}
