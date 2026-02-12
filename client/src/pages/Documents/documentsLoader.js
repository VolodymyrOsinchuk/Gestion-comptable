import { toast } from "react-toastify";
import customFetch from "../../utils/customFetch.js";

// Loader pour récupérer les documents
export const documentsLoader = async ({ params }) => {
  try {
    const { companyId } = params;
    const { data } = await customFetch.get(`/companies/${companyId}/documents`);
    console.log("🚀 ~ documentsLoader ~  data :", data);
    return data || [];
  } catch (error) {
    console.error("Documents loader error:", error);
    toast.error(error?.response?.data?.message || "Erreur lors du chargement");
    return [];
  }
};

// import { mockData } from "../../data/mockData";

// export async function documentsLoader() {
//   // Simulate API call
//   await new Promise((resolve) => setTimeout(resolve, 300));

//   return {
//     documents: mockData.documents,
//     accountingEntries: mockData.accountingEntries,
//   };
// }
