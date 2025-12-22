// import { toast } from "react-toastify";
// import customFetch from "../../utils/customFetch.js";

// export const companyAction = async ({ request, params }) => {
//   const formData = await request.formData();
//   const data = Object.fromEntries(formData);
//   try {
//     const resp = await customFetch.post("/companies", data);
//     toast.success("Société créée avec succès");
//     return resp.data;
//   } catch (error) {
//     toast.error(error?.response?.data?.msg);
//     return error;
//   }
// };

import { toast } from "react-toastify";
import { mockData } from "../../data/mockData";

export async function companyAction({ request }) {
  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "create") {
    const newCompany = {
      id: mockData.companies.length + 1,
      name: formData.get("name"),
      siret: formData.get("siret"),
      address: formData.get("address"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      status: "active",
    };

    // Validate SIRET
    if (!/^\d{14}$/.test(newCompany.siret)) {
      toast.error("⚠️ Le SIRET doit contenir exactement 14 chiffres");
      return { error: "Invalid SIRET" };
    }

    mockData.companies.push(newCompany);
    toast.success("✅ Entreprise enregistrée avec succès !");
    return { success: true };
  }

  return null;
}
