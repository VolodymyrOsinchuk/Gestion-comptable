// ==========================================
// SEED DATA - Données de test pour l'application comptable
// Remplit la base de données avec des exemples réalistes
// ==========================================
import {
  Company,
  ChartOfAccounts,
  ThirdParty,
  Journal,
  AccountingEntry,
  BankAccount,
  BankTransaction,
  Document,
  TVAReport,
  TVAItem,
  Declaration,
  Payroll,
} from "./models/index.js";

import sequelize from "./config/db.js";
import { BASE_PCG_ACCOUNTS } from "./data/pcgAccounts.js";

// ==========================================
// FONCTION PRINCIPALE DE SEED
// ==========================================
async function seedDatabase() {
  try {
    console.log("🌱 Démarrage du seed de la base de données...");

    // Ensure DB connection
    await sequelize.authenticate();
    if (process.env.NODE_ENV === "production") {
      console.error("❌ Seed refusé en production (sync force désactivé)");
      return;
    }
    // 1. Créer les entreprises
    console.log("📊 Création des entreprises...");
    const companies = await seedCompanies();

    // 2. Créer le plan comptable pour chaque entreprise
    console.log("📚 Création du plan comptable PCG 2025...");
    await seedChartOfAccounts(companies);

    // 3. Créer les journaux
    console.log("📖 Création des journaux comptables...");
    const journals = await seedJournals(companies);

    // 4. Créer les tiers (clients/fournisseurs)
    console.log("👥 Création des tiers...");
    const thirdParties = await seedThirdParties(companies);

    // 5. Créer les comptes bancaires
    console.log("🏦 Création des comptes bancaires...");
    const bankAccounts = await seedBankAccounts(companies, journals);

    // 6. Créer les documents
    console.log("📄 Création des documents...");
    const documents = await seedDocuments(companies, thirdParties);

    // 7. Créer les écritures comptables
    console.log("✍️ Création des écritures comptables...");
    await seedAccountingEntries(companies, journals, thirdParties);

    // 8. Créer les transactions bancaires
    console.log("💳 Création des transactions bancaires...");
    await seedBankTransactions(companies, bankAccounts, thirdParties);

    // 9. Créer les rapports TVA
    console.log("📊 Création des rapports TVA...");
    await seedTVAReports(companies);

    // 10. Créer les déclarations
    console.log("📋 Création des déclarations...");
    await seedDeclarations(companies);

    // 11. Créer les paies
    console.log("💰 Création des paies...");
    await seedPayrolls(companies);

    console.log("✅ Seed terminé avec succès !");
  } catch (error) {
    console.error("❌ Erreur lors du seed:", error);
    throw error;
  }
}

// ==========================================
// 1. SEED COMPANIES
// ==========================================
async function seedCompanies() {
  const companies = [
    {
      name: "TechInnovate SAS",
      siret: "12345678901234",
      siren: "123456789",
      tva_number: "FR12123456789",
      naf_code: "6201Z",
      legal_form: "SAS",
      address: "15 Rue de la Tech",
      postal_code: "75001",
      city: "Paris",
      country: "France",
      email: "contact@techinnovate.fr",
      phone: "0140123456",
      website: "https://www.techinnovate.fr",
      capital: 50000.0,
      fiscal_year_start: "01-01",
      fiscal_year_end: "12-31",
      tva_regime: "normal",
      tva_frequency: "monthly",
      accounting_plan: "PCG",
      status: "active",
    },
    {
      name: "Boulangerie Martin SARL",
      siret: "98765432109876",
      siren: "987654321",
      tva_number: "FR98987654321",
      naf_code: "1071C",
      legal_form: "SARL",
      address: "8 Place du Marché",
      postal_code: "69002",
      city: "Lyon",
      country: "France",
      email: "martin@boulangerie-martin.fr",
      phone: "0478456789",
      website: "https://www.boulangerie-martin.fr",
      capital: 15000.0,
      fiscal_year_start: "01-01",
      fiscal_year_end: "12-31",
      tva_regime: "simplifie",
      tva_frequency: "quarterly",
      accounting_plan: "PCG",
      status: "active",
    },
    {
      name: "Consulting Pro EURL",
      siret: "11122233344455",
      siren: "111222333",
      tva_number: "FR11111222333",
      naf_code: "7022Z",
      legal_form: "EURL",
      address: "42 Avenue des Consultants",
      postal_code: "33000",
      city: "Bordeaux",
      country: "France",
      email: "info@consultingpro.fr",
      phone: "0556789012",
      capital: 10000.0,
      fiscal_year_start: "01-01",
      fiscal_year_end: "12-31",
      tva_regime: "normal",
      tva_frequency: "monthly",
      accounting_plan: "PCG",
      status: "active",
    },
  ];

  const createdCompanies = [];
  for (const company of companies) {
    const created = await Company.create(company);
    createdCompanies.push(created);
    console.log(`  ✓ ${company.name} créée`);
  }

  return createdCompanies;
}

// ==========================================
// 2. SEED CHART OF ACCOUNTS - Plan Comptable Général 2025
// ==========================================
async function seedChartOfAccounts(companies) {
  const baseAccounts = BASE_PCG_ACCOUNTS;

  for (const company of companies) {
    const accounts = baseAccounts.map((a) => ({
      company_id: company.id,
      ...a,
    }));
    await ChartOfAccounts.bulkCreate(accounts);
    console.log(
      `  ✓ ${accounts.length} comptes PCG créés pour ${company.name}`
    );
  }
}


// ==========================================
// 3. SEED JOURNALS
// ==========================================
async function seedJournals(companies) {
  const allJournals = [];

  for (const company of companies) {
    const journals = [
      {
        company_id: company.id,
        code: "VE",
        label: "Ventes",
        type: "VE",
        default_account: "411000",
        is_active: true,
      },
      {
        company_id: company.id,
        code: "AC",
        label: "Achats",
        type: "AC",
        default_account: "401000",
        is_active: true,
      },
      {
        company_id: company.id,
        code: "BQ1",
        label: "Banque BNP",
        type: "BQ",
        default_account: "512000",
        is_active: true,
      },
      {
        company_id: company.id,
        code: "CA",
        label: "Caisse",
        type: "CA",
        default_account: "530000",
        is_active: true,
      },
      {
        company_id: company.id,
        code: "OD",
        label: "Opérations diverses",
        type: "OD",
        default_account: null,
        is_active: true,
      },
      {
        company_id: company.id,
        code: "AN",
        label: "À-nouveaux",
        type: "AN",
        default_account: null,
        is_active: true,
      },
    ];

    for (const journal of journals) {
      const created = await Journal.create(journal);
      allJournals.push(created);
    }
    console.log(`  ✓ ${journals.length} journaux créés pour ${company.name}`);
  }

  return allJournals;
}

// ==========================================
// 4. SEED THIRD PARTIES
// ==========================================
async function seedThirdParties(companies) {
  const allThirdParties = [];

  for (const company of companies) {
    const thirdParties = [
      // Clients
      {
        company_id: company.id,
        code: "CLI001",
        type: "customer",
        name: "SARL Dupont Distribution",
        legal_name: "SARL Dupont Distribution",
        siret: "55566677788899",
        tva_number: "FR55555666777",
        address: "25 Rue du Commerce",
        postal_code: "75008",
        city: "Paris",
        country: "France",
        email: "contact@dupont-distribution.fr",
        phone: "0145678901",
        customer_account: "411001",
        payment_terms: 30,
        payment_method: "virement",
        is_active: true,
      },
      {
        company_id: company.id,
        code: "CLI002",
        type: "customer",
        name: "Entreprise Martin SA",
        legal_name: "Entreprise Martin SA",
        siret: "66677788899000",
        tva_number: "FR66666777888",
        address: "12 Avenue des Affaires",
        postal_code: "69003",
        city: "Lyon",
        country: "France",
        email: "compta@martin-sa.fr",
        phone: "0478901234",
        customer_account: "411002",
        payment_terms: 45,
        payment_method: "prelevement",
        credit_limit: 50000.0,
        is_active: true,
      },
      {
        company_id: company.id,
        code: "CLI003",
        type: "customer",
        name: "SAS Innovation Tech",
        siret: "77788899000111",
        tva_number: "FR77777888999",
        address: "50 Boulevard Technologique",
        postal_code: "31000",
        city: "Toulouse",
        country: "France",
        email: "billing@innovation-tech.fr",
        phone: "0561234567",
        customer_account: "411003",
        payment_terms: 30,
        payment_method: "virement",
        is_active: true,
      },
      // Fournisseurs
      {
        company_id: company.id,
        code: "FRS001",
        type: "supplier",
        name: "Fournitures Bureau Pro",
        siret: "88899000111222",
        tva_number: "FR88888999000",
        address: "10 Rue des Fournitures",
        postal_code: "92100",
        city: "Boulogne-Billancourt",
        country: "France",
        email: "ventes@bureau-pro.fr",
        phone: "0146123456",
        supplier_account: "401001",
        payment_terms: 30,
        payment_method: "virement",
        is_active: true,
      },
      {
        company_id: company.id,
        code: "FRS002",
        type: "supplier",
        name: "EDF - Électricité de France",
        siret: "55208131700020",
        tva_number: "FR03552081317",
        address: "22-30 Avenue de Wagram",
        postal_code: "75008",
        city: "Paris",
        country: "France",
        email: "professionnels@edf.fr",
        phone: "0810333378",
        supplier_account: "401002",
        payment_terms: 30,
        payment_method: "prelevement",
        is_active: true,
      },
      {
        company_id: company.id,
        code: "FRS003",
        type: "supplier",
        name: "Cabinet Expertise Comptable",
        siret: "99900011122233",
        tva_number: "FR99999000111",
        address: "5 Place de l'Expertise",
        postal_code: "75009",
        city: "Paris",
        country: "France",
        email: "contact@expertise-compta.fr",
        phone: "0142345678",
        supplier_account: "401003",
        payment_terms: 30,
        payment_method: "cheque",
        is_active: true,
      },
      // Tiers mixte (client et fournisseur)
      {
        company_id: company.id,
        code: "MIX001",
        type: "both",
        name: "Partenaire Global SARL",
        siret: "11122233344556",
        tva_number: "FR11111222334",
        address: "30 Rue du Partenariat",
        postal_code: "13001",
        city: "Marseille",
        country: "France",
        email: "contact@partenaire-global.fr",
        phone: "0491234567",
        customer_account: "411004",
        supplier_account: "401004",
        payment_terms: 30,
        payment_method: "virement",
        is_active: true,
      },
    ];

    for (const thirdParty of thirdParties) {
      const created = await ThirdParty.create(thirdParty);
      allThirdParties.push(created);
    }
    console.log(`  ✓ ${thirdParties.length} tiers créés pour ${company.name}`);
  }

  return allThirdParties;
}

// ==========================================
// 5. SEED BANK ACCOUNTS
// ==========================================
async function seedBankAccounts(companies, journals) {
  const allBankAccounts = [];

  for (const company of companies) {
    const bankJournal = journals.find(
      (j) => j.company_id === company.id && j.code === "BQ1"
    );

    const bankAccounts = [
      {
        company_id: company.id,
        name: "Compte Courant BNP Paribas",
        iban: "FR7630004000010001234567890",
        bic: "BNPAFRPPXXX",
        bank_name: "BNP Paribas",
        account_number: "512001",
        journal_id: bankJournal?.id,
        current_balance: 45000.0,
        accounting_balance: 45000.0,
        last_reconciliation_date: "2025-01-15",
        is_active: true,
      },
      {
        company_id: company.id,
        name: "Compte Épargne Crédit Agricole",
        iban: "FR7612345678901234567890123",
        bic: "AGRIFRPPXXX",
        bank_name: "Crédit Agricole",
        account_number: "512002",
        journal_id: null,
        current_balance: 15000.0,
        accounting_balance: 15000.0,
        last_reconciliation_date: "2025-01-10",
        is_active: true,
      },
    ];

    for (const bankAccount of bankAccounts) {
      const created = await BankAccount.create(bankAccount);
      allBankAccounts.push(created);
    }
    console.log(
      `  ✓ ${bankAccounts.length} comptes bancaires créés pour ${company.name}`
    );
  }

  return allBankAccounts;
}

// ==========================================
// 6. SEED DOCUMENTS
// ==========================================
async function seedDocuments(companies, thirdParties) {
  const allDocuments = [];

  for (const company of companies) {
    const companyThirdParties = thirdParties.filter(
      (tp) => tp.company_id === company.id
    );

    const clients = companyThirdParties.filter(
      (tp) => tp.type === "customer" || tp.type === "both"
    );
    const fournisseurs = companyThirdParties.filter(
      (tp) => tp.type === "supplier" || tp.type === "both"
    );

    const documents = [
      // Factures clients
      {
        company_id: company.id,
        reference: "FA2025-001",
        date: "2025-01-10",
        due_date: "2025-02-10",
        type: "invoice_customer",
        third_party_id: clients[0]?.id,
        amount_ht: 5000.0,
        amount_tva: 1000.0,
        amount_ttc: 6000.0,
        payment_method: "virement",
        status: "paid",
        is_accounted: true,
        accounted_at: new Date("2025-01-10"),
      },
      {
        company_id: company.id,
        reference: "FA2025-002",
        date: "2025-01-15",
        due_date: "2025-02-14",
        type: "invoice_customer",
        third_party_id: clients[1]?.id,
        amount_ht: 8500.0,
        amount_tva: 1700.0,
        amount_ttc: 10200.0,
        payment_method: "prelevement",
        status: "validated",
        is_accounted: true,
        accounted_at: new Date("2025-01-15"),
      },
      {
        company_id: company.id,
        reference: "FA2025-003",
        date: "2025-01-20",
        due_date: "2025-02-19",
        type: "invoice_customer",
        third_party_id: clients[2]?.id,
        amount_ht: 3200.0,
        amount_tva: 640.0,
        amount_ttc: 3840.0,
        payment_method: "virement",
        status: "pending",
        is_accounted: true,
        accounted_at: new Date("2025-01-20"),
      },
      // Factures fournisseurs
      {
        company_id: company.id,
        reference: "FOUR2025-001",
        date: "2025-01-08",
        due_date: "2025-02-08",
        type: "invoice_supplier",
        third_party_id: fournisseurs[0]?.id,
        amount_ht: 450.0,
        amount_tva: 90.0,
        amount_ttc: 540.0,
        payment_method: "virement",
        status: "paid",
        is_accounted: true,
        accounted_at: new Date("2025-01-08"),
      },
      {
        company_id: company.id,
        reference: "EDF-JAN2025",
        date: "2025-01-05",
        due_date: "2025-01-25",
        type: "invoice_supplier",
        third_party_id: fournisseurs[1]?.id,
        amount_ht: 280.0,
        amount_tva: 56.0,
        amount_ttc: 336.0,
        payment_method: "prelevement",
        status: "paid",
        is_accounted: true,
        accounted_at: new Date("2025-01-05"),
      },
      {
        company_id: company.id,
        reference: "COMPTA2025-001",
        date: "2025-01-12",
        due_date: "2025-02-12",
        type: "invoice_supplier",
        third_party_id: fournisseurs[2]?.id,
        amount_ht: 1200.0,
        amount_tva: 240.0,
        amount_ttc: 1440.0,
        payment_method: "cheque",
        status: "validated",
        is_accounted: true,
        accounted_at: new Date("2025-01-12"),
      },
      // Avoir
      {
        company_id: company.id,
        reference: "AV2025-001",
        date: "2025-01-18",
        due_date: null,
        type: "credit_note",
        third_party_id: clients[0]?.id,
        amount_ht: -500.0,
        amount_tva: -100.0,
        amount_ttc: -600.0,
        payment_method: "virement",
        status: "validated",
        is_accounted: true,
        accounted_at: new Date("2025-01-18"),
      },
      // Devis
      {
        company_id: company.id,
        reference: "DEV2025-001",
        date: "2025-01-22",
        due_date: null,
        type: "quote",
        third_party_id: clients[2]?.id,
        amount_ht: 12000.0,
        amount_tva: 2400.0,
        amount_ttc: 14400.0,
        payment_method: "virement",
        status: "draft",
        is_accounted: false,
      },
    ];

    for (const document of documents) {
      const created = await Document.create(document);
      allDocuments.push(created);
    }
    console.log(`  ✓ ${documents.length} documents créés pour ${company.name}`);
  }

  return allDocuments;
}

// ==========================================
// 7. SEED ACCOUNTING ENTRIES
// ==========================================
async function seedAccountingEntries(companies, journals, thirdParties) {
  for (const company of companies) {
    const companyJournals = journals.filter((j) => j.company_id === company.id);
    const ventesJournal = companyJournals.find((j) => j.code === "VE");
    const achatsJournal = companyJournals.find((j) => j.code === "AC");
    const banqueJournal = companyJournals.find((j) => j.code === "BQ1");
    const odJournal = companyJournals.find((j) => j.code === "OD");

    const companyThirdParties = thirdParties.filter(
      (tp) => tp.company_id === company.id
    );

    // Écriture de vente FA2025-001
    const entriesVente1 = [
      {
        company_id: company.id,
        journal_id: ventesJournal.id,
        entry_number: "VE-2025-001",
        entry_date: "2025-01-10",
        account_number: "411001",
        third_party_id: companyThirdParties[0]?.id,
        label: "Facture FA2025-001",
        piece_ref: "FA2025-001",
        debit: 6000.0,
        credit: 0.0,
        fiscal_year: 2025,
        is_validated: true,
        validated_at: new Date("2025-01-10"),
      },
      {
        company_id: company.id,
        journal_id: ventesJournal.id,
        entry_number: "VE-2025-001",
        entry_date: "2025-01-10",
        account_number: "706000",
        label: "Facture FA2025-001 - Prestations",
        piece_ref: "FA2025-001",
        debit: 0.0,
        credit: 5000.0,
        fiscal_year: 2025,
        is_validated: true,
        validated_at: new Date("2025-01-10"),
      },
      {
        company_id: company.id,
        journal_id: ventesJournal.id,
        entry_number: "VE-2025-001",
        entry_date: "2025-01-10",
        account_number: "445710",
        label: "Facture FA2025-001 - TVA collectée 20%",
        piece_ref: "FA2025-001",
        debit: 0.0,
        credit: 1000.0,
        fiscal_year: 2025,
        is_validated: true,
        validated_at: new Date("2025-01-10"),
      },
    ];

    // Écriture de vente FA2025-002
    const entriesVente2 = [
      {
        company_id: company.id,
        journal_id: ventesJournal.id,
        entry_number: "VE-2025-002",
        entry_date: "2025-01-15",
        account_number: "411002",
        third_party_id: companyThirdParties[1]?.id,
        label: "Facture FA2025-002",
        piece_ref: "FA2025-002",
        debit: 10200.0,
        credit: 0.0,
        fiscal_year: 2025,
        is_validated: true,
        validated_at: new Date("2025-01-15"),
      },
      {
        company_id: company.id,
        journal_id: ventesJournal.id,
        entry_number: "VE-2025-002",
        entry_date: "2025-01-15",
        account_number: "706000",
        label: "Facture FA2025-002 - Prestations",
        piece_ref: "FA2025-002",
        debit: 0.0,
        credit: 8500.0,
        fiscal_year: 2025,
        is_validated: true,
        validated_at: new Date("2025-01-15"),
      },
      {
        company_id: company.id,
        journal_id: ventesJournal.id,
        entry_number: "VE-2025-002",
        entry_date: "2025-01-15",
        account_number: "445710",
        label: "Facture FA2025-002 - TVA collectée 20%",
        piece_ref: "FA2025-002",
        debit: 0.0,
        credit: 1700.0,
        fiscal_year: 2025,
        is_validated: true,
        validated_at: new Date("2025-01-15"),
      },
    ];

    // Écriture d'achat FOUR2025-001
    const entriesAchat1 = [
      {
        company_id: company.id,
        journal_id: achatsJournal.id,
        entry_number: "AC-2025-001",
        entry_date: "2025-01-08",
        account_number: "606400",
        label: "Facture FOUR2025-001 - Fournitures administratives",
        piece_ref: "FOUR2025-001",
        debit: 450.0,
        credit: 0.0,
        fiscal_year: 2025,
        is_validated: true,
        validated_at: new Date("2025-01-08"),
      },
      {
        company_id: company.id,
        journal_id: achatsJournal.id,
        entry_number: "AC-2025-001",
        entry_date: "2025-01-08",
        account_number: "445660",
        label: "Facture FOUR2025-001 - TVA déductible 20%",
        piece_ref: "FOUR2025-001",
        debit: 90.0,
        credit: 0.0,
        fiscal_year: 2025,
        is_validated: true,
        validated_at: new Date("2025-01-08"),
      },
      {
        company_id: company.id,
        journal_id: achatsJournal.id,
        entry_number: "AC-2025-001",
        entry_date: "2025-01-08",
        account_number: "401001",
        third_party_id: companyThirdParties[3]?.id,
        label: "Facture FOUR2025-001",
        piece_ref: "FOUR2025-001",
        debit: 0.0,
        credit: 540.0,
        fiscal_year: 2025,
        is_validated: true,
        validated_at: new Date("2025-01-08"),
      },
    ];

    // Règlement client
    const entriesReglement1 = [
      {
        company_id: company.id,
        journal_id: banqueJournal.id,
        entry_number: "BQ-2025-001",
        entry_date: "2025-01-12",
        account_number: "512001",
        label: "Virement client FA2025-001",
        piece_ref: "VIR-001",
        debit: 6000.0,
        credit: 0.0,
        lettrage: "A",
        is_lettred: true,
        fiscal_year: 2025,
        is_validated: true,
        validated_at: new Date("2025-01-12"),
      },
      {
        company_id: company.id,
        journal_id: banqueJournal.id,
        entry_number: "BQ-2025-001",
        entry_date: "2025-01-12",
        account_number: "411001",
        third_party_id: companyThirdParties[0]?.id,
        label: "Virement client FA2025-001",
        piece_ref: "VIR-001",
        debit: 0.0,
        credit: 6000.0,
        lettrage: "A",
        is_lettred: true,
        fiscal_year: 2025,
        is_validated: true,
        validated_at: new Date("2025-01-12"),
      },
    ];

    // Paiement fournisseur
    const entriesPaiement1 = [
      {
        company_id: company.id,
        journal_id: banqueJournal.id,
        entry_number: "BQ-2025-002",
        entry_date: "2025-01-09",
        account_number: "401001",
        third_party_id: companyThirdParties[3]?.id,
        label: "Paiement FOUR2025-001",
        piece_ref: "VIR-002",
        debit: 540.0,
        credit: 0.0,
        lettrage: "B",
        is_lettred: true,
        fiscal_year: 2025,
        is_validated: true,
        validated_at: new Date("2025-01-09"),
      },
      {
        company_id: company.id,
        journal_id: banqueJournal.id,
        entry_number: "BQ-2025-002",
        entry_date: "2025-01-09",
        account_number: "512001",
        label: "Paiement FOUR2025-001",
        piece_ref: "VIR-002",
        debit: 0.0,
        credit: 540.0,
        lettrage: "B",
        is_lettred: true,
        fiscal_year: 2025,
        is_validated: true,
        validated_at: new Date("2025-01-09"),
      },
    ];

    // Salaires
    const entriesSalaires = [
      {
        company_id: company.id,
        journal_id: odJournal.id,
        entry_number: "OD-2025-001",
        entry_date: "2025-01-31",
        account_number: "641100",
        label: "Salaires janvier 2025",
        piece_ref: "PAIE-JAN2025",
        debit: 8000.0,
        credit: 0.0,
        fiscal_year: 2025,
        is_validated: true,
        validated_at: new Date("2025-01-31"),
      },
      {
        company_id: company.id,
        journal_id: odJournal.id,
        entry_number: "OD-2025-001",
        entry_date: "2025-01-31",
        account_number: "645000",
        label: "Charges sociales janvier 2025",
        piece_ref: "PAIE-JAN2025",
        debit: 3200.0,
        credit: 0.0,
        fiscal_year: 2025,
        is_validated: true,
        validated_at: new Date("2025-01-31"),
      },
      {
        company_id: company.id,
        journal_id: odJournal.id,
        entry_number: "OD-2025-001",
        entry_date: "2025-01-31",
        account_number: "421000",
        label: "Salaires nets à payer janvier 2025",
        piece_ref: "PAIE-JAN2025",
        debit: 0.0,
        credit: 6400.0,
        fiscal_year: 2025,
        is_validated: true,
        validated_at: new Date("2025-01-31"),
      },
      {
        company_id: company.id,
        journal_id: odJournal.id,
        entry_number: "OD-2025-001",
        entry_date: "2025-01-31",
        account_number: "431000",
        label: "Charges sociales à payer janvier 2025",
        piece_ref: "PAIE-JAN2025",
        debit: 0.0,
        credit: 4800.0,
        fiscal_year: 2025,
        is_validated: true,
        validated_at: new Date("2025-01-31"),
      },
    ];

    // Écriture d'achat EDF
    const entriesEDF = [
      {
        company_id: company.id,
        journal_id: achatsJournal.id,
        entry_number: "AC-2025-002",
        entry_date: "2025-01-05",
        account_number: "606100",
        label: "Facture EDF JAN2025 - Énergie",
        piece_ref: "EDF-JAN2025",
        debit: 280.0,
        credit: 0.0,
        fiscal_year: 2025,
        is_validated: true,
        validated_at: new Date("2025-01-05"),
      },
      {
        company_id: company.id,
        journal_id: achatsJournal.id,
        entry_number: "AC-2025-002",
        entry_date: "2025-01-05",
        account_number: "445660",
        label: "Facture EDF JAN2025 - TVA déductible 20%",
        piece_ref: "EDF-JAN2025",
        debit: 56.0,
        credit: 0.0,
        fiscal_year: 2025,
        is_validated: true,
        validated_at: new Date("2025-01-05"),
      },
      {
        company_id: company.id,
        journal_id: achatsJournal.id,
        entry_number: "AC-2025-002",
        entry_date: "2025-01-05",
        account_number: "401002",
        third_party_id: companyThirdParties[4]?.id,
        label: "Facture EDF JAN2025",
        piece_ref: "EDF-JAN2025",
        debit: 0.0,
        credit: 336.0,
        fiscal_year: 2025,
        is_validated: true,
        validated_at: new Date("2025-01-05"),
      },
    ];

    // Écriture d'achat COMPTA
    const entriesCompta = [
      {
        company_id: company.id,
        journal_id: achatsJournal.id,
        entry_number: "AC-2025-003",
        entry_date: "2025-01-12",
        account_number: "622600",
        label: "Facture COMPTA2025-001 - Honoraires",
        piece_ref: "COMPTA2025-001",
        debit: 1200.0,
        credit: 0.0,
        fiscal_year: 2025,
        is_validated: true,
        validated_at: new Date("2025-01-12"),
      },
      {
        company_id: company.id,
        journal_id: achatsJournal.id,
        entry_number: "AC-2025-003",
        entry_date: "2025-01-12",
        account_number: "445660",
        label: "Facture COMPTA2025-001 - TVA déductible 20%",
        piece_ref: "COMPTA2025-001",
        debit: 240.0,
        credit: 0.0,
        fiscal_year: 2025,
        is_validated: true,
        validated_at: new Date("2025-01-12"),
      },
      {
        company_id: company.id,
        journal_id: achatsJournal.id,
        entry_number: "AC-2025-003",
        entry_date: "2025-01-12",
        account_number: "401003",
        third_party_id: companyThirdParties[5]?.id,
        label: "Facture COMPTA2025-001",
        piece_ref: "COMPTA2025-001",
        debit: 0.0,
        credit: 1440.0,
        fiscal_year: 2025,
        is_validated: true,
        validated_at: new Date("2025-01-12"),
      },
    ];

    // Écriture d'avoir (crédit note)
    const entriesAvoir = [
      {
        company_id: company.id,
        journal_id: ventesJournal.id,
        entry_number: "VE-2025-003",
        entry_date: "2025-01-18",
        account_number: "411001",
        third_party_id: companyThirdParties[0]?.id,
        label: "Avoir AV2025-001",
        piece_ref: "AV2025-001",
        debit: 0.0,
        credit: 600.0,
        fiscal_year: 2025,
        is_validated: true,
        validated_at: new Date("2025-01-18"),
      },
      {
        company_id: company.id,
        journal_id: ventesJournal.id,
        entry_number: "VE-2025-003",
        entry_date: "2025-01-18",
        account_number: "706000",
        label: "Avoir AV2025-001 - Reprise produit",
        piece_ref: "AV2025-001",
        debit: 500.0,
        credit: 0.0,
        fiscal_year: 2025,
        is_validated: true,
        validated_at: new Date("2025-01-18"),
      },
      {
        company_id: company.id,
        journal_id: ventesJournal.id,
        entry_number: "VE-2025-003",
        entry_date: "2025-01-18",
        account_number: "445710",
        label: "Avoir AV2025-001 - Reprise TVA collectée 20%",
        piece_ref: "AV2025-001",
        debit: 100.0,
        credit: 0.0,
        fiscal_year: 2025,
        is_validated: true,
        validated_at: new Date("2025-01-18"),
      },
    ];

    const allEntries = [
      ...entriesVente1,
      ...entriesVente2,
      ...entriesAchat1,
      ...entriesEDF,
      ...entriesCompta,
      ...entriesAvoir,
      ...entriesReglement1,
      ...entriesPaiement1,
      ...entriesSalaires,
    ];

    for (const entry of allEntries) {
      await AccountingEntry.create(entry);
    }
    console.log(
      `  ✓ ${allEntries.length} écritures créées pour ${company.name}`
    );
  }
}

// ==========================================
// 8. SEED BANK TRANSACTIONS
// ==========================================
async function seedBankTransactions(companies, bankAccounts, thirdParties) {
  for (const company of companies) {
    const companyBankAccounts = bankAccounts.filter(
      (ba) => ba.company_id === company.id
    );
    const mainBankAccount = companyBankAccounts[0];

    if (!mainBankAccount) continue;

    const companyThirdParties = thirdParties.filter(
      (tp) => tp.company_id === company.id
    );

    const transactions = [
      {
        company_id: company.id,
        bank_account_id: mainBankAccount.id,
        date: "2025-01-12",
        value_date: "2025-01-12",
        label: "VIR DUPONT DISTRIBUTION",
        reference: "VIR-001",
        debit: 0.0,
        credit: 6000.0,
        balance: 51000.0,
        status: "reconciled",
        third_party_id: companyThirdParties[0]?.id,
        category: "Ventes",
      },
      {
        company_id: company.id,
        bank_account_id: mainBankAccount.id,
        date: "2025-01-09",
        value_date: "2025-01-09",
        label: "VIR FOURNITURES BUREAU PRO",
        reference: "VIR-002",
        debit: 540.0,
        credit: 0.0,
        balance: 45000.0,
        status: "reconciled",
        third_party_id: companyThirdParties[3]?.id,
        category: "Achats",
      },
      {
        company_id: company.id,
        bank_account_id: mainBankAccount.id,
        date: "2025-01-05",
        value_date: "2025-01-05",
        label: "PRLV EDF ELECTRICITE",
        reference: "PRLV-001",
        debit: 336.0,
        credit: 0.0,
        balance: 44664.0,
        status: "matched",
        third_party_id: companyThirdParties[4]?.id,
        category: "Énergie",
      },
      {
        company_id: company.id,
        bank_account_id: mainBankAccount.id,
        date: "2025-01-15",
        value_date: "2025-01-15",
        label: "FRAIS BANCAIRES",
        reference: "FB-JAN2025",
        debit: 25.0,
        credit: 0.0,
        balance: 44639.0,
        status: "pending",
        category: "Frais bancaires",
      },
      {
        company_id: company.id,
        bank_account_id: mainBankAccount.id,
        date: "2025-01-20",
        value_date: "2025-01-20",
        label: "RETRAIT DAB",
        reference: "RET-001",
        debit: 300.0,
        credit: 0.0,
        balance: 44339.0,
        status: "pending",
        category: "Caisse",
      },
      {
        company_id: company.id,
        bank_account_id: mainBankAccount.id,
        date: "2025-01-22",
        value_date: "2025-01-22",
        label: "VIR MARTIN SA",
        reference: "VIR-003",
        debit: 0.0,
        credit: 2500.0,
        balance: 46839.0,
        status: "pending",
        third_party_id: companyThirdParties[1]?.id,
        category: "Ventes",
      },
    ];

    for (const transaction of transactions) {
      await BankTransaction.create(transaction);
    }
    console.log(
      `  ✓ ${transactions.length} transactions bancaires créées pour ${company.name}`
    );
  }
}

// ==========================================
// 9. SEED TVA REPORTS
// ==========================================
async function seedTVAReports(companies) {
  for (const company of companies) {
    const tvaReport = await TVAReport.create({
      company_id: company.id,
      period_start: "2025-01-01",
      period_end: "2025-01-31",
      period_label: "2025-01",
      frequency: "monthly",
      total_collectee: 2600.0,
      total_deductible_abs: 386.0,
      total_deductible_immob: 0,
      net_due: 2214.0,
      status: "computed",
    });

    const tvaItems = [
      {
        tva_report_id: tvaReport.id,
        vat_type: "collectee",
        account_number: "445710",
        counter_account: "706000",
        base_amount: 13500.0,
        tax_rate: 20.0,
        tax_amount: 2700.0,
        ttc_amount: 16200.0,
        entry_number: "FACT-2025-001",
        entry_date: "2025-01-15",
        fiscal_year: 2025,
        label: "TVA collectée janvier",
      },
      {
        tva_report_id: tvaReport.id,
        vat_type: "deductible_abs",
        account_number: "445660",
        counter_account: "607000",
        base_amount: 450.0,
        tax_rate: 20.0,
        tax_amount: 90.0,
        ttc_amount: 540.0,
        entry_number: "FACT-2025-002",
        entry_date: "2025-01-20",
        fiscal_year: 2025,
        label: "TVA déductible ABS janvier",
      },
      {
        tva_report_id: tvaReport.id,
        vat_type: "deductible_abs",
        account_number: "445660",
        counter_account: "606100",
        base_amount: 280.0,
        tax_rate: 20.0,
        tax_amount: 56.0,
        ttc_amount: 336.0,
        entry_number: "EDF-JAN2025",
        entry_date: "2025-01-05",
        fiscal_year: 2025,
        label: "TVA déductible EDF janvier",
      },
      {
        tva_report_id: tvaReport.id,
        vat_type: "deductible_abs",
        account_number: "445660",
        counter_account: "622600",
        base_amount: 1200.0,
        tax_rate: 20.0,
        tax_amount: 240.0,
        ttc_amount: 1440.0,
        entry_number: "COMPTA2025-001",
        entry_date: "2025-01-12",
        fiscal_year: 2025,
        label: "TVA déductible honoraires janvier",
      },
      {
        tva_report_id: tvaReport.id,
        vat_type: "collectee",
        account_number: "445710",
        counter_account: "706000",
        base_amount: -500.0,
        tax_rate: 20.0,
        tax_amount: -100.0,
        ttc_amount: -600.0,
        entry_number: "AV2025-001",
        entry_date: "2025-01-18",
        fiscal_year: 2025,
        label: "TVA collectée - Avoir janvier",
      },
    ];

    for (const item of tvaItems) {
      await TVAItem.create(item);
    }

    console.log(`  ✓ Rapport TVA créé pour ${company.name}`);
  }
}

// ==========================================
// 10. SEED DECLARATIONS
// ==========================================
async function seedDeclarations(companies) {
  for (const company of companies) {
    const declarations = [
      {
        company_id: company.id,
        type: "tva",
        period_start: "2025-01-01",
        period_end: "2025-01-31",
        deadline: "2025-02-19",
        amount: 2610.0,
        status: "prepared",
        submission_date: null,
      },
      {
        company_id: company.id,
        type: "urssaf",
        period_start: "2025-01-01",
        period_end: "2025-01-31",
        deadline: "2025-02-15",
        amount: 4800.0,
        status: "draft",
        submission_date: null,
      },
      {
        company_id: company.id,
        type: "is",
        period_start: "2024-01-01",
        period_end: "2024-12-31",
        deadline: "2025-05-15",
        amount: 15000.0,
        status: "draft",
        submission_date: null,
      },
    ];

    for (const declaration of declarations) {
      await Declaration.create(declaration);
    }
    console.log(
      `  ✓ ${declarations.length} déclarations créées pour ${company.name}`
    );
  }
}

// ==========================================
// 11. SEED PAYROLLS
// ==========================================
async function seedPayrolls(companies) {
  for (const company of companies) {
    const payrolls = [
      {
        company_id: company.id,
        period: "2024-12",
        employee_count: 2,
        total_gross: 7500.0,
        total_charges: 3000.0,
        total_net: 6000.0,
        status: "paid",
        payment_date: "2024-12-31",
      },
      {
        company_id: company.id,
        period: "2025-01",
        employee_count: 2,
        total_gross: 8000.0,
        total_charges: 3200.0,
        total_net: 6400.0,
        status: "validated",
        payment_date: "2025-01-31",
      },
    ];

    for (const payroll of payrolls) {
      await Payroll.create(payroll);
    }
    console.log(`  ✓ ${payrolls.length} paies créées pour ${company.name}`);
  }
}

// ==========================================
// EXPORT ET EXÉCUTION
// ==========================================
export default seedDatabase;

// Si exécuté directement
if (import.meta.url === `file://${process.argv[1]}`) {
  sequelize
    .sync({ force: true })
    .then(() => seedDatabase())
    .then(() => {
      console.log("✅ Seed terminé avec succès");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Erreur:", error);
      process.exit(1);
    });
}
