import { toast } from "react-toastify";
import customFetch from "../../utils/customFetch.js";

export const declarationsLoader = async ({ params }) => {
  try {
    const resp = await customFetch.get(`/tva/companies/${params.companyId}/declarations`);
    return { declarations: resp.data.declarations || [] };
  } catch (error) {
    return { declarations: [] };
  }
};
