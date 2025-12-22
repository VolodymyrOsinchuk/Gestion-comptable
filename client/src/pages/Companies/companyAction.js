import { toast } from "react-toastify";
import { redirect } from "react-router-dom";
import customFetch from "../../utils/customFetch";

export async function companyAction({ request }) {
  const formData = await request.formData();
  const intent = formData.get("intent");

  try {
    switch (intent) {
      case "create": {
        const data = Object.fromEntries(formData);
        delete data.intent;

        await customFetch.post("/companies", data);
        toast.success("✅ Entreprise créée avec succès");
        break;
      }

      case "update": {
        const id = formData.get("id");
        const data = Object.fromEntries(formData);
        delete data.intent;
        delete data.id;

        await customFetch.put(`/companies/${id}`, data);
        toast.success("✅ Entreprise modifiée avec succès");
        break;
      }

      case "delete": {
        const id = formData.get("id");
        await customFetch.delete(`/companies/${id}`);
        toast.success("✅ Entreprise désactivée avec succès");
        break;
      }

      case "activate": {
        const id = formData.get("id");
        await customFetch.put(`/companies/${id}`, { status: "active" });
        toast.success("✅ Entreprise réactivée avec succès");
        break;
      }

      default:
        toast.error("Action inconnue");
        return { success: false, error: "Unknown action" };
    }

    // Recharger la page après l'action
    return redirect("/companies");
  } catch (error) {
    console.error("Erreur:", error);
    const errorMessage =
      error?.response?.data?.message || "Une erreur est survenue";
    toast.error(errorMessage);
    return { success: false, error: errorMessage };
  }
}

// import { toast } from "react-toastify";
// import { mockData } from "../../data/mockData";

// export async function companyAction({ request }) {
//   const formData = await request.formData();
//   const intent = formData.get("intent");

//   if (intent === "create") {
//     const newCompany = {
//       id: mockData.companies.length + 1,
//       name: formData.get("name"),
//       siret: formData.get("siret"),
//       address: formData.get("address"),
//       email: formData.get("email"),
//       phone: formData.get("phone"),
//       status: "active",
//     };

//     // Validate SIRET
//     if (!/^\d{14}$/.test(newCompany.siret)) {
//       toast.error("⚠️ Le SIRET doit contenir exactement 14 chiffres");
//       return { error: "Invalid SIRET" };
//     }

//     mockData.companies.push(newCompany);
//     toast.success("✅ Entreprise enregistrée avec succès !");
//     return { success: true };
//   }

//   return null;
// }
