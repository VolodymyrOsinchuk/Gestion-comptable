import { createBrowserRouter } from "react-router-dom";
import { lazy, Suspense } from "react";
import MainLayout from "./components/layout/MainLayout";
import LoadingSpinner from "./components/layout/LoadingSpinner";

// Lazy load pages
const InvoiceScanner = lazy(() => import("./pages/Scanner/InvoiceScanner"));
const Documents = lazy(() => import("./pages/Documents/Documents"));
const BankReconciliation = lazy(() =>
  import("./pages/Banking/BankReconciliation")
);
const Digitalisation = lazy(() => import("./pages/Digital/Digitalisation"));
const FEC = lazy(() => import("./pages/FEC/FEC"));
const TVA = lazy(() => import("./pages/TVA/TVA"));
const Declarations = lazy(() => import("./pages/Declarations/Declarations"));
const Payroll = lazy(() => import("./pages/Payroll/Payroll"));
const Accounting = lazy(() => import("./pages/Accounting/Accounting"));
const Closing = lazy(() => import("./pages/Closing/Closing"));
const Analysis = lazy(() => import("./pages/Analysis/Analysis"));
const Operations = lazy(() => import("./pages/Operations/Operations"));
const Companies = lazy(() => import("./pages/Companies/Companies"));

// Loaders
import { documentsLoader } from "./pages/Documents/documentsLoader.js";
import { declarationsLoader } from "./pages/Declarations/declarationsLoader.js";
import { payrollLoader } from "./pages/Payroll/payrollLoader.js";
import { compagniesLoader } from "./pages/Companies/companiesLoader.js";

// Actions
import { companyAction } from "./pages/Companies/companyAction";

const SuspenseWrapper = ({ children }) => (
  <Suspense fallback={<LoadingSpinner />}>{children}</Suspense>
);

const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: (
          <SuspenseWrapper>
            <InvoiceScanner />
          </SuspenseWrapper>
        ),
      },
      {
        path: "scanner",
        element: (
          <SuspenseWrapper>
            <InvoiceScanner />
          </SuspenseWrapper>
        ),
      },
      {
        path: "documents",
        element: (
          <SuspenseWrapper>
            <Documents />
          </SuspenseWrapper>
        ),
        loader: documentsLoader,
      },
      {
        path: "banking",
        element: (
          <SuspenseWrapper>
            <BankReconciliation />
          </SuspenseWrapper>
        ),
      },
      {
        path: "digital",
        element: (
          <SuspenseWrapper>
            <Digitalisation />
          </SuspenseWrapper>
        ),
      },
      {
        path: "fec",
        element: (
          <SuspenseWrapper>
            <FEC />
          </SuspenseWrapper>
        ),
      },
      {
        path: "tva",
        element: (
          <SuspenseWrapper>
            <TVA />
          </SuspenseWrapper>
        ),
      },
      {
        path: "declarations",
        element: (
          <SuspenseWrapper>
            <Declarations />
          </SuspenseWrapper>
        ),
        loader: declarationsLoader,
      },
      {
        path: "payroll",
        element: (
          <SuspenseWrapper>
            <Payroll />
          </SuspenseWrapper>
        ),
        loader: payrollLoader,
      },
      {
        path: "accounting",
        element: (
          <SuspenseWrapper>
            <Accounting />
          </SuspenseWrapper>
        ),
      },
      {
        path: "closing",
        element: (
          <SuspenseWrapper>
            <Closing />
          </SuspenseWrapper>
        ),
      },
      {
        path: "analysis",
        element: (
          <SuspenseWrapper>
            <Analysis />
          </SuspenseWrapper>
        ),
      },
      {
        path: "operations",
        element: (
          <SuspenseWrapper>
            <Operations />
          </SuspenseWrapper>
        ),
      },
      {
        path: "companies",
        element: (
          <SuspenseWrapper>
            <Companies />
          </SuspenseWrapper>
        ),
        loader: compagniesLoader,
        action: companyAction,
      },
    ],
  },
]);

export default router;
