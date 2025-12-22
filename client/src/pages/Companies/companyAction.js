import { toast } from "react-toastify";
import customFetch from "../../utils/customFetch.js";

export const companyAction = async ({ request, params }) => {
  const formData = await request.formData();
  const data = Object.fromEntries(formData);
  try {
    const resp = await customFetch.post("/companies", data);
    toast.success("Société créée avec succès");
    return resp.data;
  } catch (error) {
    toast.error(error?.response?.data?.msg);
    return error;
  }
};
