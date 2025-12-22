import { redirect } from "react-router-dom";
import { toast } from "react-toastify";
import customFetch from "../../utils/customFetch.js";

// Action pour gérer les opérations CRUD
export const documentsAction = async ({ request, params }) => {
  const formData = await request.formData();
  const intent = formData.get("intent");
  const { companyId } = params;

  try {
    switch (intent) {
      case "create": {
        const documentData = {
          reference: formData.get("reference"),
          date: formData.get("date"),
          due_date: formData.get("due_date"),
          type: formData.get("type"),
          supplier: formData.get("supplier"),
          amount_ht: parseFloat(formData.get("amount_ht")),
          amount_tva: parseFloat(formData.get("amount_tva")),
          amount_ttc: parseFloat(formData.get("amount_ttc")),
          payment_method: formData.get("payment_method"),
          notes: formData.get("notes"),
          status: formData.get("status") || "pending",
        };

        await customFetch.post(
          `/companies/${companyId}/documents`,
          documentData
        );
        toast.success("Document créé avec succès");
        return redirect(`/companies/${companyId}/documents`);
      }

      case "update": {
        const documentId = formData.get("id");
        const documentData = {
          reference: formData.get("reference"),
          date: formData.get("date"),
          due_date: formData.get("due_date"),
          type: formData.get("type"),
          supplier: formData.get("supplier"),
          amount_ht: parseFloat(formData.get("amount_ht")),
          amount_tva: parseFloat(formData.get("amount_tva")),
          amount_ttc: parseFloat(formData.get("amount_ttc")),
          payment_method: formData.get("payment_method"),
          notes: formData.get("notes"),
          status: formData.get("status"),
        };

        await customFetch.patch(`/documents/${documentId}`, documentData);
        toast.success("Document mis à jour avec succès");
        return redirect(`/companies/${companyId}/documents`);
      }

      case "delete": {
        const documentId = formData.get("id");
        await customFetch.delete(`/documents/${documentId}`);
        toast.success("Document supprimé avec succès");
        return { success: true };
      }

      case "updateStatus": {
        const documentId = formData.get("id");
        const status = formData.get("status");
        await customFetch.patch(`/documents/${documentId}/status`, { status });
        toast.success("Statut mis à jour avec succès");
        return { success: true };
      }

      default:
        return null;
    }
  } catch (error) {
    toast.error(error?.response?.data?.msg || "Une erreur s'est produite");
    return { error: error?.response?.data?.msg };
  }
};
