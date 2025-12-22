import { toast } from "react-toastify";

import customFetch from "../../utils/customFetch";

export async function companiesLoader() {
  try {
    const [companiesRes, statsRes] = await Promise.all([
      customFetch.get("/companies"),
      customFetch.get("/companies/stats"),
    ]);

    return {
      companies: companiesRes.data.data || [],
      stats: statsRes.data.data || { total: 0, active: 0 },
    };
  } catch (error) {
    console.error("Error loading companies:", error);
    // En cas d'erreur, retourner des données vides
    return {
      companies: [],
      stats: { total: 0, active: 0 },
    };
  }
}
// import { mockData } from "../../data/mockData";

// export async function compagniesLoader() {
//   await new Promise((resolve) => setTimeout(resolve, 300));
//   return { companies: mockData.companies };
// }
