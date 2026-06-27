import { NavLink, useParams, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";

// Note: J'ai retiré le customFetch et le useEffect ici car les données viendront des props

const menuItems = [
  { path: "scanner", icon: "📸", label: "Scanner de Factures" },
  { path: "documents", icon: "📄", label: "Documents & Écritures" },
  { path: "banking", icon: "🏦", label: "Rapprochement Bancaire" },
  { path: "digital", icon: "⚙️", label: "Digitalisation" },
  { path: "fec", icon: "📋", label: "FEC" },
  { path: "tva", icon: "%", label: "TVA" },
  { path: "declarations", icon: "📝", label: "Déclarations Fiscales" },
  { path: "payroll", icon: "👥", label: "Paie & Social" },
  { path: "accounting", icon: "🧮", label: "Comptabilité" },
  { path: "plan-comptable", icon: "📒", label: "Plan Comptable" },
  { path: "closing", icon: "⚖️", label: "Clôture & Bilan" },
  { path: "analysis", icon: "📊", label: "Analyse Financière" },
  { path: "operations", icon: "🎯", label: "Centre Opérations" },
];

// Ajout de la prop 'companies'
export default function Sidebar({ companies = [] }) {
  const [isOpen, setIsOpen] = useState(false);
  const { companyId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (window.innerWidth <= 768) {
      setIsOpen(false);
    }
  }, [location.pathname]);

  // Trouver l'entreprise active basée sur l'URL
  const selectedCompany = companyId
    ? companies.find((c) => String(c.id) === String(companyId))
    : null;

  const toggleSidebar = () => setIsOpen(!isOpen);

  // Gérer le basculement d'entreprise
  const handleCompanyChange = (e) => {
    const newCompanyId = e.target.value;
    if (newCompanyId) {
      // Redirection vers une vue par défaut de l'entreprise (ex: documents ou dashboard)
      navigate(`/companies/${newCompanyId}/documents`);
    } else {
      // Retour à la vue globale (Admin)
      navigate("/companies");
    }

    // Fermer le menu sur mobile après sélection
    if (window.innerWidth <= 768) setIsOpen(false);
  };

  const getNavLink = (itemPath) => {
    if (companyId) {
      return `/companies/${companyId}/${itemPath}`;
    }
    return `/${itemPath}`;
  };

  return (
    <>
      <button className="menu-toggle" onClick={toggleSidebar}>
        ☰
      </button>
      <aside className={`sidebar ${isOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <NavLink to="/" style={{ color: "inherit", textDecoration: "none" }}>
            <h1>Gestion Comptable Pro</h1>
          </NavLink>

          {/* Sélecteur Synchronisé */}
          <div style={{ marginTop: "1rem" }}>
            <label
              htmlFor="company-select"
              style={{
                display: "block",
                fontSize: "0.75rem",
                color: "#6b7280",
                marginBottom: "0.25rem",
              }}
            >
              {selectedCompany ? "Entreprise active" : "Vue Globale"}
            </label>
            <select
              id="company-select"
              value={companyId || ""}
              onChange={handleCompanyChange}
              style={{
                width: "100%",
                padding: "0.5rem",
                borderRadius: "4px",
                border: "1px solid #d1d5db",
                fontSize: "0.875rem",
                backgroundColor: "#fff",
                cursor: "pointer",
              }}
            >
              <option value="">📂 Toutes les entreprises</option>
              {companies.map((company) => (
                <option key={company.id} value={company.id}>
                  {company.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <nav style={{ marginTop: "1.5rem" }}>
          <ul className="nav-menu">
            {/* Lien Gestion Entreprises (Toujours visible) */}
            <li className="nav-item">
              <NavLink
                to="/companies"
                end // Ajout de 'end' pour ne pas être actif sur les sous-routes
                className={({ isActive }) =>
                  `nav-link ${isActive && !companyId ? "active" : ""}`
                }
                onClick={() => window.innerWidth <= 768 && setIsOpen(false)}
              >
                <span className="nav-icon">🏢</span>
                <span>Gestion Entreprises</span>
              </NavLink>
            </li>

            <li
              style={{ borderTop: "1px solid #e5e7eb", margin: "0.5rem 0" }}
            />

            {/* Menu contextuel (Désactivé si pas d'entreprise sélectionnée) */}
            {menuItems.map((item) => {
              const isDisabled = !companyId;
              const content = (
                <>
                  <span className="nav-icon">{item.icon}</span>
                  <span>{item.label}</span>
                </>
              );

              return (
                <li key={item.path} className="nav-item">
                  {isDisabled ? (
                    <div className="nav-link disabled" style={{ opacity: 0.5 }}>
                      {content}
                    </div>
                  ) : (
                    <NavLink
                      to={getNavLink(item.path)}
                      className={({ isActive }) =>
                        `nav-link ${isActive ? "active" : ""}`
                      }
                      onClick={() =>
                        window.innerWidth <= 768 && setIsOpen(false)
                      }
                    >
                      {content}
                    </NavLink>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Info Footer Sidebar */}
        {selectedCompany && (
          <div
            style={{
              position: "static",
              bottom: "1rem",
              left: "1rem",
              right: "1rem",
              padding: "0.75rem",
              background: "#eef2ff",
              border: "1px solid #c7d2fe",
              borderRadius: "6px",
              fontSize: "0.75rem",
            }}
          >
            <div
              style={{
                fontWeight: "600",
                color: "#3730a3",
                marginBottom: "0.25rem",
              }}
            >
              {selectedCompany.name}
            </div>
            <div style={{ color: "#6b7280" }}>
              SIREN: {selectedCompany.siren || "N/A"}
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
