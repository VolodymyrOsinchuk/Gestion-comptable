import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import App from "./App.jsx";
import { ToastContainer } from "react-toastify";
import router from "./router.jsx";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RouterProvider router={router} />
    {/* <App /> */}
    <ToastContainer position="top-right" autoClose={3000} />
  </StrictMode>
);
