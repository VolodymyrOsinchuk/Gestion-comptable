import { NavLink } from "react-router-dom";
import { useState } from "react";

const menuItems = [
  { path: "/scanner", icon: "📸", label: "Scanner de Factures" },
  { path: "/documents", icon: "📄", label: "Documents & Écritures" },
  { path: "/banking", icon: "🏦", label: "Rapprochement Bancaire" },
  { path: "/digital", icon: "⚙️", label: "Digitalisation" },
  { path: "/fec", icon: "📋", label: "FEC" },
  { path: "/tva", icon: "%", label: "TVA" },
  { path: "/declarations", icon: "📝", label: "Déclarations Fiscales" },
  { path: "/payroll", icon: "👥", label: "Paie & Social" },
  { path: "/accounting", icon: "🧮", label: "Comptabilité" },
  { path: "/closing", icon: "⚖️", label: "Clôture & Bilan" },
  { path: "/analysis", icon: "📊", label: "Analyse Financière" },
  { path: "/operations", icon: "🎯", label: "Centre Opérations" },
  { path: "/companies", icon: "🏢", label: "Gestion Entreprises" },
];

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => setIsOpen(!isOpen);

  return (
    <>
      <button className="menu-toggle" onClick={toggleSidebar}>
        ☰
      </button>
      <aside className={`sidebar ${isOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <h1>Gestion Comptable Pro</h1>
        </div>
        <nav>
          <ul className="nav-menu">
            {menuItems.map((item) => (
              <li key={item.path} className="nav-item">
                <NavLink
                  to={item.path}
                  className="nav-link"
                  onClick={() => window.innerWidth <= 768 && setIsOpen(false)}
                >
                  <span className="nav-icon">{item.icon}</span>
                  <span>{item.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
    </>
  );
}
