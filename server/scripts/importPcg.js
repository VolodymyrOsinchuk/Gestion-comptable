import sequelize from "../config/db.js";
import Company from "../models/Company.js";
import ChartOfAccounts from "../models/ChartOfAccounts.js";
import { BASE_PCG_ACCOUNTS } from "../data/pcgAccounts.js";

async function importPcg() {
  try {
    await sequelize.authenticate();
    console.log("✅ Connecté à la base de données");

    const companies = await Company.findAll({ where: { status: "active" } });
    if (companies.length === 0) {
      console.log("❌ Aucune entreprise active trouvée. Créez d'abord une entreprise.");
      process.exit(1);
    }
    console.log(`📊 ${companies.length} entreprise(s) trouvée(s)`);

    for (const company of companies) {
      const existing = await ChartOfAccounts.count({
        where: { company_id: company.id },
      });

      if (existing > 0) {
        console.log(
          `  ⏭️  ${company.name} : ${existing} comptes existants déjà (ignore)`
        );
        continue;
      }

      const accounts = BASE_PCG_ACCOUNTS.map((a) => ({
        company_id: company.id,
        account_number: a.account_number,
        account_label: a.account_label,
        account_type: a.account_type,
        account_class: a.account_class,
        can_reconcile: a.can_reconcile || false,
        requires_third_party: a.requires_third_party || false,
        tva_applicable: a.tva_applicable || false,
        default_tva_rate: a.default_tva_rate || null,
        is_active: true,
      }));

      await ChartOfAccounts.bulkCreate(accounts, {
        validate: true,
        ignoreDuplicates: false,
      });

      console.log(`  ✓ ${accounts.length} comptes PCG importés pour ${company.name}`);
    }

    console.log("\n✅ Import PCG terminé avec succès");
    process.exit(0);
  } catch (error) {
    console.error("❌ Erreur lors de l'import PCG:", error);
    process.exit(1);
  }
}

importPcg();
