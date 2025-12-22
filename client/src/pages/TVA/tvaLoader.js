import { toast } from "react-toastify";
import customFetch from "../../utils/customFetch.js";

export const tvaLoader = async ({ params }) => {
  try {
    const resp = await customFetch.get(`/tva`);
    console.log("🚀 ~ tvaLoader ~ resp:", resp);
    return resp.data;
  } catch (error) {
    console.error("Error fetching TVA data:", error);
    toast.error(error?.response?.data?.msg);
    return error;
  }
};
