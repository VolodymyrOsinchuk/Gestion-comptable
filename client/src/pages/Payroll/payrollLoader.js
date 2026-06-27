import { toast } from "react-toastify";
import customFetch from "../../utils/customFetch.js";

export const payrollLoader = async ({ params }) => {
  try {
    const resp = await customFetch.get(`/companies/${params.companyId}/documents`);
    return resp.data;
  } catch (error) {
    toast.error(error?.response?.data?.msg);
    return error;
  }
};
