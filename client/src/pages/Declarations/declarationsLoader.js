// import { toast } from "react-toastify";
// import customFetch from "../../utils/customFetch.js";

// export const declarationsLoader = async ({ params }) => {
//   try {
//     const resp = await customFetch.get(`/companies/${params.id}`);
//     return resp.data;
//   } catch (error) {
//     toast.error(error?.response?.data?.msg);
//     return error;
//   }
// };

import { mockData } from "../../data/mockData";

export async function declarationsLoader() {
  await new Promise((resolve) => setTimeout(resolve, 300));
  return { declarations: mockData.declarations };
}
