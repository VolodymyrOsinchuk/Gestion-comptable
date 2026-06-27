import { toast } from "react-toastify";
import customFetch from "../../utils/customFetch.js";

export const payrollLoader = async ({ params }) => {
  try {
    const resp = await customFetch.get(`/companies/${params.companyId}/payrolls`);
    return { payroll: resp.data.payrolls || resp.data || [] };
  } catch (error) {
    return { payroll: [] };
  }
};
