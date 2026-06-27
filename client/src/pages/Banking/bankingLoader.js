import customFetch from "../../utils/customFetch.js";

export const bankingLoader = async ({ params }) => {
  try {
    const resp = await customFetch.get(`/bank/companies/${params.companyId}/transactions`);
    return { transactions: resp.data.transactions || resp.data || [] };
  } catch (error) {
    return { transactions: [] };
  }
};
