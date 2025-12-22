import { Outlet, useLoaderData, useNavigation } from "react-router-dom";
import Sidebar from "./Sidebar"; // Chemin à adapter
import customFetch from "../../utils/customFetch";

// 1. Le Loader Global qui alimente la Sidebar et les pages
export const appLoader = async () => {
  try {
    const { data } = await customFetch.get("/companies");
    console.log("🚀 ~ appLoader ~  data :", data);

    return { companies: data.data || [] };
  } catch (error) {
    console.error("Erreur chargement global:", error);
    return { companies: [] };
  }
};

export default function MainLayout() {
  const { companies } = useLoaderData();
  const navigation = useNavigation();
  const isLoading = navigation.state === "loading";
  return (
    <div className="app-container">
      <Sidebar companies={companies} />
      <main className="main-content">
        <Outlet context={{ companies }} />
      </main>
    </div>
  );
}
