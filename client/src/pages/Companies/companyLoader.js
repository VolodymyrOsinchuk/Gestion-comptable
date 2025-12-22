// ============================================
// LOADER - Charger les données de l'entreprise
// ============================================
import { toast } from "react-toastify";

export const companyLoader = async ({ params }) => {
  try {
    const customFetch = (await import("../../utils/customFetch.js")).default;
    const { id } = params;

    // Charger l'entreprise et ses statistiques
    const companyResp = await customFetch.get(`/companies/${id}`);

    // TODO: Charger les statistiques réelles depuis le backend
    // Pour l'instant, données mockées
    const stats = {
      bankAccounts: 2,
      customers: 12,
      suppliers: 8,
      entries: 145,
      accounts: 67,
      journals: 6,
      tvaReports: 3,
      invoicesCustomer: 45,
      invoicesSupplier: 32,
      creditNotes: 5,
      quotes: 8,
      transactions: 234,
      toReconcile: 12,
    };

    return {
      company: companyResp.data.data,
      stats,
    };
  } catch (error) {
    console.error("Erreur lors du chargement de l'entreprise:", error);
    toast.error("Erreur lors du chargement des données");
    throw error;
  }
};
