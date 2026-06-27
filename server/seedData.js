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

// ==========================================
// FONCTION PRINCIPALE DE SEED
// ==========================================
async function seedDatabase() {
  try {
    console.log("🌱 Démarrage du seed de la base de données...");

    // Ensure DB connection and recreate tables before seeding (dev only)
    await sequelize.authenticate();
    if (process.env.NODE_ENV === "production") {
      console.error("❌ Seed refusé en production (sync force désactivé)");
      return;
    }
    await sequelize.sync({ force: true });
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
  // Plan comptable de base (simplifié) - Applicable à toutes les entreprises
  const baseAccounts = [
    // ==============================================================================
    // CLASSE 1 : COMPTES DE CAPITAUX
    // ==============================================================================
    {
      account_number: "101000",
      account_label: "Capital social",
      account_type: "equity",
      account_class: 1,
      can_reconcile: false,
    },
    {
      account_number: "101300",
      account_label: "Capital souscrit - appelé, versé",
      account_type: "equity",
      account_class: 1,
      can_reconcile: false,
    },
    {
      account_number: "104100",
      account_label: "Primes d'émission",
      account_type: "equity",
      account_class: 1,
      can_reconcile: false,
    },
    {
      account_number: "105100",
      account_label: "Écarts de réévaluation",
      account_type: "equity",
      account_class: 1,
      can_reconcile: false,
    },
    {
      account_number: "106100",
      account_label: "Réserve légale",
      account_type: "equity",
      account_class: 1,
      can_reconcile: false,
    },
    {
      account_number: "106300",
      account_label: "Réserves statutaires ou contractuelles",
      account_type: "equity",
      account_class: 1,
      can_reconcile: false,
    },
    {
      account_number: "106800",
      account_label: "Autres réserves",
      account_type: "equity",
      account_class: 1,
      can_reconcile: false,
    },
    {
      account_number: "108000",
      account_label: "Compte de l'exploitant",
      account_type: "equity",
      account_class: 1,
      can_reconcile: false,
    },
    {
      account_number: "110000",
      account_label: "Report à nouveau (solde créditeur)",
      account_type: "equity",
      account_class: 1,
      can_reconcile: false,
    },
    {
      account_number: "119000",
      account_label: "Report à nouveau (solde débiteur)",
      account_type: "equity",
      account_class: 1,
      can_reconcile: false,
    },
    {
      account_number: "120000",
      account_label: "Résultat de l'exercice (bénéfice)",
      account_type: "equity",
      account_class: 1,
      can_reconcile: false,
    },
    {
      account_number: "129000",
      account_label: "Résultat de l'exercice (perte)",
      account_type: "equity",
      account_class: 1,
      can_reconcile: false,
    },
    {
      account_number: "131000",
      account_label: "Subventions d'investissement",
      account_type: "equity",
      account_class: 1,
      can_reconcile: false,
    },
    {
      account_number: "145000",
      account_label: "Amortissements dérogatoires",
      account_type: "equity",
      account_class: 1,
      can_reconcile: false,
    },
    {
      account_number: "151100",
      account_label: "Provisions pour litiges",
      account_type: "liability",
      account_class: 1,
      can_reconcile: false,
    },
    {
      account_number: "155000",
      account_label: "Provisions pour impôts",
      account_type: "liability",
      account_class: 1,
      can_reconcile: false,
    },
    {
      account_number: "161000",
      account_label: "Emprunts obligataires convertibles",
      account_type: "liability",
      account_class: 1,
      can_reconcile: false,
    },
    {
      account_number: "164000",
      account_label: "Emprunts auprès des établissements de crédit",
      account_type: "liability",
      account_class: 1,
      can_reconcile: false,
    },
    {
      account_number: "165000",
      account_label: "Dépôts et cautionnements reçus",
      account_type: "liability",
      account_class: 1,
      can_reconcile: false,
    },
    {
      account_number: "168800",
      account_label: "Intérêts courus sur emprunts",
      account_type: "liability",
      account_class: 1,
      can_reconcile: false,
    },

    // ==============================================================================
    // CLASSE 2 : COMPTES D'IMMOBILISATIONS
    // ==============================================================================
    {
      account_number: "201100",
      account_label: "Frais de constitution",
      account_type: "asset",
      account_class: 2,
      can_reconcile: false,
    },
    {
      account_number: "203000",
      account_label: "Frais de développement",
      account_type: "asset",
      account_class: 2,
      can_reconcile: false,
    },
    {
      account_number: "205000",
      account_label: "Concessions, brevets, licences, logiciels",
      account_type: "asset",
      account_class: 2,
      can_reconcile: false,
    },
    {
      account_number: "206000",
      account_label: "Droit au bail",
      account_type: "asset",
      account_class: 2,
      can_reconcile: false,
    },
    {
      account_number: "207000",
      account_label: "Fonds commercial",
      account_type: "asset",
      account_class: 2,
      can_reconcile: false,
    },
    {
      account_number: "208000",
      account_label: "Autres immobilisations incorporelles",
      account_type: "asset",
      account_class: 2,
      can_reconcile: false,
    },
    {
      account_number: "211100",
      account_label: "Terrains nus",
      account_type: "asset",
      account_class: 2,
      can_reconcile: false,
    },
    {
      account_number: "212000",
      account_label: "Agencements et aménagements de terrains",
      account_type: "asset",
      account_class: 2,
      can_reconcile: false,
    },
    {
      account_number: "213100",
      account_label: "Bâtiments",
      account_type: "asset",
      account_class: 2,
      can_reconcile: false,
    },
    {
      account_number: "213500",
      account_label: "Installations générales - aménagements des constructions",
      account_type: "asset",
      account_class: 2,
      can_reconcile: false,
    },
    {
      account_number: "215400",
      account_label: "Matériel industriel",
      account_type: "asset",
      account_class: 2,
      can_reconcile: false,
    },
    {
      account_number: "218100",
      account_label: "Installations générales, agencements divers",
      account_type: "asset",
      account_class: 2,
      can_reconcile: false,
    },
    {
      account_number: "218200",
      account_label: "Matériel de transport",
      account_type: "asset",
      account_class: 2,
      can_reconcile: false,
    },
    {
      account_number: "218300",
      account_label: "Matériel de bureau et informatique",
      account_type: "asset",
      account_class: 2,
      can_reconcile: false,
    },
    {
      account_number: "218400",
      account_label: "Mobilier",
      account_type: "asset",
      account_class: 2,
      can_reconcile: false,
    },
    {
      account_number: "231000",
      account_label: "Immobilisations corporelles en cours",
      account_type: "asset",
      account_class: 2,
      can_reconcile: false,
    },
    {
      account_number: "261000",
      account_label: "Titres de participation",
      account_type: "asset",
      account_class: 2,
      can_reconcile: false,
    },
    {
      account_number: "271000",
      account_label: "Titres immobilisés (droit de propriété)",
      account_type: "asset",
      account_class: 2,
      can_reconcile: false,
    },
    {
      account_number: "275000",
      account_label: "Dépôts et cautionnements versés",
      account_type: "asset",
      account_class: 2,
      can_reconcile: false,
    },
    {
      account_number: "280100",
      account_label: "Amortissements des frais d'établissement",
      account_type: "asset",
      account_class: 2,
      can_reconcile: false,
    },
    {
      account_number: "280500",
      account_label: "Amortissements des concessions, brevets, licences",
      account_type: "asset",
      account_class: 2,
      can_reconcile: false,
    },
    {
      account_number: "281300",
      account_label: "Amortissements des constructions",
      account_type: "asset",
      account_class: 2,
      can_reconcile: false,
    },
    {
      account_number: "281500",
      account_label: "Amortissements du matériel et outillage industriels",
      account_type: "asset",
      account_class: 2,
      can_reconcile: false,
    },
    {
      account_number: "281800",
      account_label: "Amortissements des autres immobilisations corporelles",
      account_type: "asset",
      account_class: 2,
      can_reconcile: false,
    },

    // ==============================================================================
    // CLASSE 3 : COMPTES DE STOCKS ET EN-COURS
    // ==============================================================================
    {
      account_number: "311000",
      account_label: "Matières premières",
      account_type: "asset",
      account_class: 3,
      can_reconcile: false,
    },
    {
      account_number: "321000",
      account_label: "Matières consommables",
      account_type: "asset",
      account_class: 3,
      can_reconcile: false,
    },
    {
      account_number: "331000",
      account_label: "Produits en cours",
      account_type: "asset",
      account_class: 3,
      can_reconcile: false,
    },
    {
      account_number: "335000",
      account_label: "Travaux en cours",
      account_type: "asset",
      account_class: 3,
      can_reconcile: false,
    },
    {
      account_number: "355000",
      account_label: "Produits finis",
      account_type: "asset",
      account_class: 3,
      can_reconcile: false,
    },
    {
      account_number: "370000",
      account_label: "Stocks de marchandises",
      account_type: "asset",
      account_class: 3,
      can_reconcile: false,
    },
    {
      account_number: "391000",
      account_label: "Dépréciations des matières premières",
      account_type: "asset",
      account_class: 3,
      can_reconcile: false,
    },
    {
      account_number: "397000",
      account_label: "Dépréciations des stocks de marchandises",
      account_type: "asset",
      account_class: 3,
      can_reconcile: false,
    },

    // ==============================================================================
    // CLASSE 4 : COMPTES DE TIERS
    // ==============================================================================
    {
      account_number: "401000",
      account_label: "Fournisseurs",
      account_type: "liability",
      account_class: 4,
      can_reconcile: true,
      requires_third_party: true,
    },
    {
      account_number: "403000",
      account_label: "Fournisseurs - Effets à payer",
      account_type: "liability",
      account_class: 4,
      can_reconcile: true,
    },
    {
      account_number: "404000",
      account_label: "Fournisseurs d'immobilisations",
      account_type: "liability",
      account_class: 4,
      can_reconcile: true,
    },
    {
      account_number: "408100",
      account_label: "Fournisseurs - Factures non parvenues",
      account_type: "liability",
      account_class: 4,
      can_reconcile: false,
    },
    {
      account_number: "409100",
      account_label: "Fournisseurs - Avances et acomptes versés",
      account_type: "asset",
      account_class: 4,
      can_reconcile: true,
    },
    {
      account_number: "411000",
      account_label: "Clients",
      account_type: "asset",
      account_class: 4,
      can_reconcile: true,
      requires_third_party: true,
    },
    {
      account_number: "413000",
      account_label: "Clients - Effets à recevoir",
      account_type: "asset",
      account_class: 4,
      can_reconcile: true,
    },
    {
      account_number: "416000",
      account_label: "Clients douteux ou litigieux",
      account_type: "asset",
      account_class: 4,
      can_reconcile: true,
    },
    {
      account_number: "418100",
      account_label: "Clients - Factures à établir",
      account_type: "asset",
      account_class: 4,
      can_reconcile: false,
    },
    {
      account_number: "419100",
      account_label: "Clients - Avances et acomptes reçus",
      account_type: "liability",
      account_class: 4,
      can_reconcile: true,
    },
    {
      account_number: "421000",
      account_label: "Personnel - Rémunérations dues",
      account_type: "liability",
      account_class: 4,
      can_reconcile: true,
    },
    {
      account_number: "425000",
      account_label: "Personnel - Avances et acomptes",
      account_type: "asset",
      account_class: 4,
      can_reconcile: true,
    },
    {
      account_number: "428200",
      account_label: "Dettes provisionnées pour congés à payer",
      account_type: "liability",
      account_class: 4,
      can_reconcile: false,
    },
    {
      account_number: "431000",
      account_label: "Sécurité sociale (URSSAF)",
      account_type: "liability",
      account_class: 4,
      can_reconcile: true,
    },
    {
      account_number: "437000",
      account_label: "Autres organismes sociaux (Retraite/Prévoyance)",
      account_type: "liability",
      account_class: 4,
      can_reconcile: true,
    },
    {
      account_number: "438200",
      account_label: "Charges sociales sur congés à payer",
      account_type: "liability",
      account_class: 4,
      can_reconcile: false,
    },
    {
      account_number: "442100",
      account_label: "Prélèvement à la source (Impôt sur le revenu)",
      account_type: "liability",
      account_class: 4,
      can_reconcile: false,
    },
    {
      account_number: "444000",
      account_label: "État - Impôts sur les bénéfices (IS)",
      account_type: "liability",
      account_class: 4,
      can_reconcile: false,
    },
    {
      account_number: "445200",
      account_label: "TVA due intracommunautaire",
      account_type: "liability",
      account_class: 4,
      can_reconcile: false,
    },
    {
      account_number: "445510",
      account_label: "TVA à décaisser",
      account_type: "liability",
      account_class: 4,
      can_reconcile: false,
    },
    {
      account_number: "445620",
      account_label: "TVA déductible sur immobilisations",
      account_type: "asset",
      account_class: 4,
      can_reconcile: false,
      tva_applicable: true,
    },
    {
      account_number: "445660",
      account_label: "TVA déductible sur autres biens et services",
      account_type: "asset",
      account_class: 4,
      can_reconcile: false,
      tva_applicable: true,
    },
    {
      account_number: "445670",
      account_label: "Crédit de TVA à reporter",
      account_type: "asset",
      account_class: 4,
      can_reconcile: false,
    },
    {
      account_number: "445710",
      account_label: "TVA collectée",
      account_type: "liability",
      account_class: 4,
      can_reconcile: false,
      tva_applicable: true,
    },
    {
      account_number: "445800",
      account_label: "Taxes sur le chiffre d'affaires à régulariser",
      account_type: "liability",
      account_class: 4,
      can_reconcile: false,
    },
    {
      account_number: "447000",
      account_label: "Autres impôts, taxes et versements assimilés",
      account_type: "liability",
      account_class: 4,
      can_reconcile: false,
    },
    {
      account_number: "455000",
      account_label: "Associés - Comptes courants",
      account_type: "liability",
      account_class: 4,
      can_reconcile: true,
    },
    {
      account_number: "467000",
      account_label: "Autres comptes débiteurs ou créditeurs",
      account_type: "asset",
      account_class: 4,
      can_reconcile: true,
    },
    {
      account_number: "468600",
      account_label: "Divers - Charges à payer",
      account_type: "liability",
      account_class: 4,
      can_reconcile: false,
    },
    {
      account_number: "471000",
      account_label: "Compte d'attente (à régulariser)",
      account_type: "liability",
      account_class: 4,
      can_reconcile: true,
    },
    {
      account_number: "481000",
      account_label: "Frais d'émission des emprunts",
      account_type: "asset",
      account_class: 4,
      can_reconcile: false,
    },
    {
      account_number: "486000",
      account_label: "Charges constatées d'avance",
      account_type: "asset",
      account_class: 4,
      can_reconcile: false,
    },
    {
      account_number: "487000",
      account_label: "Produits constatés d'avance",
      account_type: "liability",
      account_class: 4,
      can_reconcile: false,
    },
    {
      account_number: "491000",
      account_label: "Dépréciations des comptes de clients",
      account_type: "asset",
      account_class: 4,
      can_reconcile: false,
    },

    // ==============================================================================
    // CLASSE 5 : COMPTES FINANCIERS
    // ==============================================================================
    {
      account_number: "503000",
      account_label: "VMP - Actions",
      account_type: "asset",
      account_class: 5,
      can_reconcile: false,
    },
    {
      account_number: "512000",
      account_label: "Banque",
      account_type: "asset",
      account_class: 5,
      can_reconcile: true,
    },
    {
      account_number: "518600",
      account_label: "Intérêts courus à payer",
      account_type: "liability",
      account_class: 5,
      can_reconcile: false,
    },
    {
      account_number: "522000",
      account_label: "Jetons détenus",
      account_type: "asset",
      account_class: 5,
      can_reconcile: false,
    },
    {
      account_number: "530000",
      account_label: "Caisse",
      account_type: "asset",
      account_class: 5,
      can_reconcile: true,
    },
    {
      account_number: "580000",
      account_label: "Virements internes",
      account_type: "asset",
      account_class: 5,
      can_reconcile: true,
    },
    {
      account_number: "590000",
      account_label: "Dépréciations des VMP",
      account_type: "asset",
      account_class: 5,
      can_reconcile: false,
    },

    // ==============================================================================
    // CLASSE 6 : COMPTES DE CHARGES
    // ==============================================================================
    {
      account_number: "601000",
      account_label: "Achats stockés - Matières premières",
      account_type: "expense",
      account_class: 6,
      can_reconcile: false,
      tva_applicable: true,
      default_tva_rate: 20.0,
    },
    {
      account_number: "602000",
      account_label: "Achats stockés - Autres approvisionnements",
      account_type: "expense",
      account_class: 6,
      can_reconcile: false,
      tva_applicable: true,
      default_tva_rate: 20.0,
    },
    {
      account_number: "603100",
      account_label: "Variation des stocks de matières premières",
      account_type: "expense",
      account_class: 6,
      can_reconcile: false,
      tva_applicable: false,
    },
    {
      account_number: "603700",
      account_label: "Variation des stocks de marchandises",
      account_type: "expense",
      account_class: 6,
      can_reconcile: false,
      tva_applicable: false,
    },
    {
      account_number: "604000",
      account_label: "Achats d'études et prestations de services",
      account_type: "expense",
      account_class: 6,
      can_reconcile: false,
      tva_applicable: true,
      default_tva_rate: 20.0,
    },
    {
      account_number: "605000",
      account_label: "Achats de matériel, équipements et travaux",
      account_type: "expense",
      account_class: 6,
      can_reconcile: false,
      tva_applicable: true,
      default_tva_rate: 20.0,
    },
    {
      account_number: "606100",
      account_label: "Fournitures non stockables (eau, énergie)",
      account_type: "expense",
      account_class: 6,
      can_reconcile: false,
      tva_applicable: true,
      default_tva_rate: 20.0,
    },
    {
      account_number: "606300",
      account_label: "Fournitures d'entretien et petit équipement",
      account_type: "expense",
      account_class: 6,
      can_reconcile: false,
      tva_applicable: true,
      default_tva_rate: 20.0,
    },
    {
      account_number: "606400",
      account_label: "Fournitures administratives",
      account_type: "expense",
      account_class: 6,
      can_reconcile: false,
      tva_applicable: true,
      default_tva_rate: 20.0,
    },
    {
      account_number: "607000",
      account_label: "Achats de marchandises",
      account_type: "expense",
      account_class: 6,
      can_reconcile: false,
      tva_applicable: true,
      default_tva_rate: 20.0,
    },
    {
      account_number: "609000",
      account_label: "Rabais, remises et ristournes obtenus sur achats",
      account_type: "expense",
      account_class: 6,
      can_reconcile: false,
      tva_applicable: true,
      default_tva_rate: 20.0,
    },
    {
      account_number: "611000",
      account_label: "Sous-traitance générale",
      account_type: "expense",
      account_class: 6,
      can_reconcile: false,
      tva_applicable: true,
      default_tva_rate: 20.0,
    },
    {
      account_number: "612000",
      account_label: "Redevances de crédit-bail",
      account_type: "expense",
      account_class: 6,
      can_reconcile: false,
      tva_applicable: true,
      default_tva_rate: 20.0,
    },
    {
      account_number: "613000",
      account_label: "Locations",
      account_type: "expense",
      account_class: 6,
      can_reconcile: false,
      tva_applicable: true,
      default_tva_rate: 20.0,
    },
    {
      account_number: "614000",
      account_label: "Charges locatives et de copropriété",
      account_type: "expense",
      account_class: 6,
      can_reconcile: false,
      tva_applicable: true,
      default_tva_rate: 20.0,
    },
    {
      account_number: "615000",
      account_label: "Entretien et réparations",
      account_type: "expense",
      account_class: 6,
      can_reconcile: false,
      tva_applicable: true,
      default_tva_rate: 20.0,
    },
    {
      account_number: "616000",
      account_label: "Primes d'assurances",
      account_type: "expense",
      account_class: 6,
      can_reconcile: false,
      tva_applicable: false,
    },
    {
      account_number: "618100",
      account_label: "Documentation générale",
      account_type: "expense",
      account_class: 6,
      can_reconcile: false,
      tva_applicable: true,
      default_tva_rate: 20.0,
    },
    {
      account_number: "621100",
      account_label: "Personnel intérimaire",
      account_type: "expense",
      account_class: 6,
      can_reconcile: false,
      tva_applicable: true,
      default_tva_rate: 20.0,
    },
    {
      account_number: "622600",
      account_label: "Honoraires",
      account_type: "expense",
      account_class: 6,
      can_reconcile: false,
      tva_applicable: true,
      default_tva_rate: 20.0,
    },
    {
      account_number: "623000",
      account_label: "Publicité, publications, relations publiques",
      account_type: "expense",
      account_class: 6,
      can_reconcile: false,
      tva_applicable: true,
      default_tva_rate: 20.0,
    },
    {
      account_number: "624000",
      account_label:
        "Transports de biens et transports collectifs du personnel",
      account_type: "expense",
      account_class: 6,
      can_reconcile: false,
      tva_applicable: true,
      default_tva_rate: 20.0,
    },
    {
      account_number: "625100",
      account_label: "Voyages et déplacements",
      account_type: "expense",
      account_class: 6,
      can_reconcile: false,
      tva_applicable: true,
      default_tva_rate: 20.0,
    },
    {
      account_number: "625600",
      account_label: "Missions et réceptions",
      account_type: "expense",
      account_class: 6,
      can_reconcile: false,
      tva_applicable: true,
      default_tva_rate: 20.0,
    },
    {
      account_number: "626000",
      account_label: "Frais postaux et de télécommunications",
      account_type: "expense",
      account_class: 6,
      can_reconcile: false,
      tva_applicable: true,
      default_tva_rate: 20.0,
    },
    {
      account_number: "627000",
      account_label: "Services bancaires et assimilés",
      account_type: "expense",
      account_class: 6,
      can_reconcile: false,
      tva_applicable: false,
    },
    {
      account_number: "631100",
      account_label: "Taxe sur les salaires",
      account_type: "expense",
      account_class: 6,
      can_reconcile: false,
      tva_applicable: false,
    },
    {
      account_number: "633300",
      account_label: "Participation à la formation professionnelle",
      account_type: "expense",
      account_class: 6,
      can_reconcile: false,
      tva_applicable: false,
    },
    {
      account_number: "635100",
      account_label: "Impôts directs (CFE, CVAE, Taxe foncière)",
      account_type: "expense",
      account_class: 6,
      can_reconcile: false,
      tva_applicable: false,
    },
    {
      account_number: "641100",
      account_label: "Salaires, appointements",
      account_type: "expense",
      account_class: 6,
      can_reconcile: false,
      tva_applicable: false,
    },
    {
      account_number: "641400",
      account_label: "Indemnités et avantages divers",
      account_type: "expense",
      account_class: 6,
      can_reconcile: false,
      tva_applicable: false,
    },
    {
      account_number: "644000",
      account_label: "Rémunération du travail de l'exploitant",
      account_type: "expense",
      account_class: 6,
      can_reconcile: false,
      tva_applicable: false,
    },
    {
      account_number: "645000",
      account_label: "Charges de sécurité sociale et de prévoyance",
      account_type: "expense",
      account_class: 6,
      can_reconcile: false,
      tva_applicable: false,
    },
    {
      account_number: "646000",
      account_label: "Cotisations sociales personnelles de l'exploitant",
      account_type: "expense",
      account_class: 6,
      can_reconcile: false,
      tva_applicable: false,
    },
    {
      account_number: "651000",
      account_label: "Redevances pour concessions, brevets, licences",
      account_type: "expense",
      account_class: 6,
      can_reconcile: false,
      tva_applicable: true,
      default_tva_rate: 20.0,
    },
    {
      account_number: "654000",
      account_label: "Pertes sur créances irrécouvrables",
      account_type: "expense",
      account_class: 6,
      can_reconcile: false,
      tva_applicable: false,
    },
    {
      account_number: "655000",
      account_label: "Quote-part de résultat sur opérations en commun",
      account_type: "expense",
      account_class: 6,
      can_reconcile: false,
      tva_applicable: false,
    },
    {
      account_number: "658000",
      account_label: "Charges diverses de gestion courante",
      account_type: "expense",
      account_class: 6,
      can_reconcile: false,
      tva_applicable: false,
    },
    {
      account_number: "661100",
      account_label: "Intérêts des emprunts et dettes",
      account_type: "expense",
      account_class: 6,
      can_reconcile: false,
      tva_applicable: false,
    },
    {
      account_number: "661600",
      account_label: "Intérêts bancaires",
      account_type: "expense",
      account_class: 6,
      can_reconcile: false,
      tva_applicable: false,
    },
    {
      account_number: "665000",
      account_label: "Escomptes accordés",
      account_type: "expense",
      account_class: 6,
      can_reconcile: false,
      tva_applicable: true,
      default_tva_rate: 20.0,
    },
    {
      account_number: "671000",
      account_label: "Charges exceptionnelles sur opérations de gestion",
      account_type: "expense",
      account_class: 6,
      can_reconcile: false,
      tva_applicable: false,
    },
    {
      account_number: "675000",
      account_label: "Valeurs comptables des éléments d'actif cédés",
      account_type: "expense",
      account_class: 6,
      can_reconcile: false,
      tva_applicable: false,
    },
    {
      account_number: "681100",
      account_label: "Dotations aux amortissements (Exploitation)",
      account_type: "expense",
      account_class: 6,
      can_reconcile: false,
      tva_applicable: false,
    },
    {
      account_number: "681700",
      account_label: "Dotations pour dépréciations des actifs circulants",
      account_type: "expense",
      account_class: 6,
      can_reconcile: false,
      tva_applicable: false,
    },
    {
      account_number: "691000",
      account_label: "Participation des salariés aux résultats",
      account_type: "expense",
      account_class: 6,
      can_reconcile: false,
      tva_applicable: false,
    },
    {
      account_number: "695000",
      account_label: "Impôts sur les bénéfices (IS)",
      account_type: "expense",
      account_class: 6,
      can_reconcile: false,
      tva_applicable: false,
    },

    // ==============================================================================
    // CLASSE 7 : COMPTES DE PRODUITS
    // ==============================================================================
    {
      account_number: "701000",
      account_label: "Ventes de produits finis",
      account_type: "revenue",
      account_class: 7,
      can_reconcile: false,
      tva_applicable: true,
      default_tva_rate: 20.0,
    },
    {
      account_number: "704000",
      account_label: "Travaux",
      account_type: "revenue",
      account_class: 7,
      can_reconcile: false,
      tva_applicable: true,
      default_tva_rate: 20.0,
    },
    {
      account_number: "706000",
      account_label: "Prestations de services",
      account_type: "revenue",
      account_class: 7,
      can_reconcile: false,
      tva_applicable: true,
      default_tva_rate: 20.0,
    },
    {
      account_number: "707000",
      account_label: "Ventes de marchandises",
      account_type: "revenue",
      account_class: 7,
      can_reconcile: false,
      tva_applicable: true,
      default_tva_rate: 20.0,
    },
    {
      account_number: "708000",
      account_label: "Produits des activités annexes",
      account_type: "revenue",
      account_class: 7,
      can_reconcile: false,
      tva_applicable: true,
      default_tva_rate: 20.0,
    },
    {
      account_number: "709000",
      account_label: "Rabais, remises et ristournes accordés",
      account_type: "revenue",
      account_class: 7,
      can_reconcile: false,
      tva_applicable: true,
      default_tva_rate: 20.0,
    },
    {
      account_number: "713300",
      account_label: "Variation des en-cours de production",
      account_type: "revenue",
      account_class: 7,
      can_reconcile: false,
      tva_applicable: false,
    },
    {
      account_number: "713500",
      account_label: "Variation des stocks de produits",
      account_type: "revenue",
      account_class: 7,
      can_reconcile: false,
      tva_applicable: false,
    },
    {
      account_number: "721000",
      account_label: "Production immobilisée - incorporelles",
      account_type: "revenue",
      account_class: 7,
      can_reconcile: false,
      tva_applicable: false,
    },
    {
      account_number: "722000",
      account_label: "Production immobilisée - corporelles",
      account_type: "revenue",
      account_class: 7,
      can_reconcile: false,
      tva_applicable: false,
    },
    {
      account_number: "740000",
      account_label: "Subventions d'exploitation",
      account_type: "revenue",
      account_class: 7,
      can_reconcile: false,
      tva_applicable: false,
    },
    {
      account_number: "751000",
      account_label: "Redevances pour concessions, brevets, licences",
      account_type: "revenue",
      account_class: 7,
      can_reconcile: false,
      tva_applicable: true,
      default_tva_rate: 20.0,
    },
    {
      account_number: "755000",
      account_label: "Quote-part de résultat sur opérations en commun",
      account_type: "revenue",
      account_class: 7,
      can_reconcile: false,
      tva_applicable: false,
    },
    {
      account_number: "758000",
      account_label: "Produits divers de gestion courante",
      account_type: "revenue",
      account_class: 7,
      can_reconcile: false,
      tva_applicable: false,
    },
    {
      account_number: "761000",
      account_label: "Produits de participations",
      account_type: "revenue",
      account_class: 7,
      can_reconcile: false,
      tva_applicable: false,
    },
    {
      account_number: "765000",
      account_label: "Escomptes obtenus",
      account_type: "revenue",
      account_class: 7,
      can_reconcile: false,
      tva_applicable: true,
      default_tva_rate: 20.0,
    },
    {
      account_number: "768000",
      account_label: "Autres produits financiers",
      account_type: "revenue",
      account_class: 7,
      can_reconcile: false,
      tva_applicable: false,
    },
    {
      account_number: "771000",
      account_label: "Produits exceptionnels sur opérations de gestion",
      account_type: "revenue",
      account_class: 7,
      can_reconcile: false,
      tva_applicable: false,
    },
    {
      account_number: "775000",
      account_label: "Produits des cessions d'éléments d'actif",
      account_type: "revenue",
      account_class: 7,
      can_reconcile: false,
      tva_applicable: false,
    },
    {
      account_number: "777000",
      account_label:
        "Quote-part des subventions d'investissement virée au résultat",
      account_type: "revenue",
      account_class: 7,
      can_reconcile: false,
      tva_applicable: false,
    },
    {
      account_number: "781000",
      account_label: "Reprises sur amortissements et provisions (Exploitation)",
      account_type: "revenue",
      account_class: 7,
      can_reconcile: false,
      tva_applicable: false,
    },
    {
      account_number: "791000",
      account_label: "Transferts de charges d'exploitation",
      account_type: "revenue",
      account_class: 7,
      can_reconcile: false,
      tva_applicable: false,
    },
  ];

  // Créer les comptes pour chaque entreprise
  for (const company of companies) {
    for (const account of baseAccounts) {
      await ChartOfAccounts.create({
        company_id: company.id,
        ...account,
      });
    }
    console.log(
      `  ✓ ${baseAccounts.length} comptes créés pour ${company.name}`
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
        account_number: "606000",
        label: "Facture FOUR2025-001 - Fournitures",
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
        account_number: "641000",
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

    const allEntries = [
      ...entriesVente1,
      ...entriesVente2,
      ...entriesAchat1,
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
    // Rapport TVA janvier 2025
    const tvaReport = await TVAReport.create({
      company_id: company.id,
      period: "2025-01",
      regime: company.tva_regime,
      total_collected: 2700.0,
      total_deductible: 90.0,
      net: 2610.0,
      due_date: "2025-02-19",
      status: "calculated",
    });

    // Détail par taux
    const tvaItems = [
      {
        tva_report_id: tvaReport.id,
        rate: 20.0,
        base_ht: 13500.0,
        tva_collected: 2700.0,
        tva_deductible: 90.0,
        net: 2610.0,
      },
      {
        tva_report_id: tvaReport.id,
        rate: 10.0,
        base_ht: 0.0,
        tva_collected: 0.0,
        tva_deductible: 0.0,
        net: 0.0,
      },
      {
        tva_report_id: tvaReport.id,
        rate: 5.5,
        base_ht: 0.0,
        tva_collected: 0.0,
        tva_deductible: 0.0,
        net: 0.0,
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
  seedDatabase()
    .then(() => {
      console.log("✅ Seed terminé avec succès");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Erreur:", error);
      process.exit(1);
    });
}
