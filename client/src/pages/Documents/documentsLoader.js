// import { toast } from "react-toastify";
// import customFetch from "../../utils/customFetch.js";

// export const documentsLoader = async ({ params }) => {
//   try {
//     const resp = await customFetch.get(`/companies/${params.id}`);
//     return resp.data;
//   } catch (error) {
//     toast.error(error?.response?.data?.msg);
//     return error;
//   }
// };
import { mockData } from "../../data/mockData";

export async function documentsLoader() {
  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 300));

  return {
    documents: mockData.documents,
    accountingEntries: mockData.accountingEntries,
  };
}
