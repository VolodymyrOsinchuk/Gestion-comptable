#!/usr/bin/env node
import sequelize from "../config/db.js";
import { AccountingEntry } from "../models/index.js";

async function main() {
  try {
    await sequelize.authenticate();
    const ref = process.argv[2] || "AV2025-001";
    const entries = await AccountingEntry.findAll({
      where: { entry_number: ref },
    });
    console.log(`Found ${entries.length} entries for ${ref}`);
    for (const e of entries) {
      console.log(
        `${e.id} | ${e.account_number} | D:${e.debit} C:${e.credit} | tp:${e.third_party_id}`
      );
    }
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

main();
