#!/usr/bin/env node
import sequelize from "../config/db.js";
import { Document, AccountingEntry, Company } from "../models/index.js";

async function main() {
  try {
    await sequelize.authenticate();
    console.log("DB connected");

    const companyId = 1;

    const docs = await Document.findAll({
      where: { company_id: companyId, is_accounted: true },
    });
    console.log(
      `Found ${docs.length} accounted documents for company ${companyId}`
    );

    for (const doc of docs) {
      const entryNumber = doc.reference || `DOC-${doc.id}`;
      const entries = await AccountingEntry.findAll({
        where: { company_id: companyId, entry_number: entryNumber },
      });
      const totalDebit = entries.reduce(
        (s, e) => s + parseFloat(e.debit || 0),
        0
      );
      const totalCredit = entries.reduce(
        (s, e) => s + parseFloat(e.credit || 0),
        0
      );
      const balanced = Math.abs(totalDebit - totalCredit) < 0.02;
      console.log(
        `Document ${doc.reference} (${doc.type}) -> lines: ${
          entries.length
        } | Debit=${totalDebit.toFixed(2)} Credit=${totalCredit.toFixed(
          2
        )} Balanced=${balanced}`
      );
      if (!balanced) {
        console.warn(`  ! UNBALANCED: ${entryNumber}`);
      }
    }

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

main();
