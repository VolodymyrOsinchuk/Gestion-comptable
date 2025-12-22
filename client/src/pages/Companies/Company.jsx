// ============================================
// FILE: pages/Company.jsx
// Page de détails d'une entreprise avec toutes ses données
// ============================================
import { useLoaderData, useNavigate, useFetcher, Link } from "react-router-dom";
import { useState } from "react";
import Card from "../../components/ui/Card";
import StatCard from "../../components/ui/StatCard";
import Badge from "../../components/ui/Badge";
import { toast } from "react-toastify";

export default function Company() {
  const { company, stats } = useLoaderData();
  const navigate = useNavigate();
  const fetcher = useFetcher();
  const [activeTab, setActiveTab] = useState("overview");

  // Formater les dates
  const formatDate = (date) => {
    if (!date) return "—";
    return new Date(date).toLocaleDateString("fr-FR");
  };

  // Formater les montants
  const formatCurrency = (amount) => {
    if (!amount) return "—";
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
    }).format(amount);
  };

  // Gérer la suppression
  const handleDelete = () => {
    if (
      window.confirm(
        `Êtes-vous sûr de vouloir désactiver l'entreprise "${company.name}" ?`
      )
    ) {
      const formData = new FormData();
      formData.append("intent", "delete");
      fetcher.submit(formData, { method: "post" });
    }
  };

  return (
    <>
      {/* En-tête avec actions */}
      <div className="page-header">
        <div>
          <button
            className="btn btn-secondary"
            onClick={() => navigate("/companies")}
            style={{ marginBottom: "0.5rem" }}
          >
            ← Retour
          </button>
          <h1 className="page-title" style={{ marginTop: "0.5rem" }}>
            {company.name}
          </h1>
          <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}>
            <Badge
              variant={
                company.status === "active"
                  ? "success"
                  : company.status === "suspended"
                  ? "warning"
                  : "error"
              }
            >
              {company.status}
            </Badge>
            <Badge variant="info">{company.legal_form || "Non défini"}</Badge>
            <Badge variant="info">{company.tva_regime}</Badge>
          </div>
        </div>
        <div style={{ display: "flex", gap: "0.75rem" }}>
          <button
            className="btn btn-primary"
            onClick={() => navigate(`/companies/${company.id}/edit`)}
          >
            ✏️ Modifier
          </button>
          {company.status === "active" && (
            <button className="btn btn-danger" onClick={handleDelete}>
              🗑️ Désactiver
            </button>
          )}
        </div>
      </div>

      {/* Statistiques rapides */}
      <div className="stats-grid">
        <StatCard
          label="Comptes bancaires"
          value={stats.bankAccounts || 0}
          variant="info"
        />
        <StatCard
          label="Clients"
          value={stats.customers || 0}
          variant="success"
        />
        <StatCard
          label="Fournisseurs"
          value={stats.suppliers || 0}
          variant="warning"
        />
        <StatCard
          label="Écritures comptables"
          value={stats.entries || 0}
          variant="primary"
        />
      </div>

      {/* Onglets */}
      <div
        style={{
          borderBottom: "2px solid var(--border-color)",
          marginBottom: "1.5rem",
        }}
      >
        <div style={{ display: "flex", gap: "1rem" }}>
          {[
            { id: "overview", label: "📋 Vue d'ensemble" },
            { id: "accounting", label: "📊 Comptabilité" },
            { id: "contacts", label: "📞 Contacts" },
            { id: "documents", label: "📄 Documents" },
            { id: "settings", label: "⚙️ Paramètres" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: "0.75rem 1.5rem",
                border: "none",
                background: "none",
                cursor: "pointer",
                borderBottom:
                  activeTab === tab.id
                    ? "3px solid var(--primary-color)"
                    : "3px solid transparent",
                fontWeight: activeTab === tab.id ? "600" : "400",
                color: activeTab === tab.id ? "var(--primary-color)" : "#666",
                transition: "all 0.2s",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Contenu des onglets */}
      {activeTab === "overview" && (
        <div style={{ display: "grid", gap: "1.5rem" }}>
          {/* Informations générales */}
          <Card title="📋 Informations Générales">
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                gap: "1.5rem",
              }}
            >
              <InfoItem label="Nom commercial" value={company.name} />
              <InfoItem label="Forme juridique" value={company.legal_form} />
              <InfoItem label="SIRET" value={company.siret} />
              <InfoItem label="SIREN" value={company.siren} />
              <InfoItem label="N° TVA" value={company.tva_number} />
              <InfoItem label="Code NAF/APE" value={company.naf_code} />
              <InfoItem
                label="Capital social"
                value={formatCurrency(company.capital)}
              />
              <InfoItem label="Statut" value={company.status} />
            </div>
          </Card>

          {/* Adresse */}
          <Card title="📍 Adresse">
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                gap: "1.5rem",
              }}
            >
              <InfoItem label="Adresse" value={company.address} />
              <InfoItem label="Code postal" value={company.postal_code} />
              <InfoItem label="Ville" value={company.city} />
              <InfoItem label="Pays" value={company.country} />
            </div>
          </Card>

          {/* Contact */}
          <Card title="📞 Contact">
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                gap: "1.5rem",
              }}
            >
              <InfoItem
                label="Email"
                value={company.email}
                link={`mailto:${company.email}`}
              />
              <InfoItem
                label="Téléphone"
                value={company.phone}
                link={`tel:${company.phone}`}
              />
              <InfoItem
                label="Site web"
                value={company.website}
                link={company.website}
                external
              />
            </div>
          </Card>

          {/* Notes */}
          {company.notes && (
            <Card title="📝 Notes internes">
              <p style={{ whiteSpace: "pre-wrap", color: "#666" }}>
                {company.notes}
              </p>
            </Card>
          )}
        </div>
      )}

      {activeTab === "accounting" && (
        <div style={{ display: "grid", gap: "1.5rem" }}>
          {/* Paramètres comptables */}
          <Card title="📊 Paramètres Comptables">
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                gap: "1.5rem",
              }}
            >
              <InfoItem label="Régime TVA" value={company.tva_regime} />
              <InfoItem
                label="Plan comptable"
                value={company.accounting_plan}
              />
              <InfoItem
                label="Début exercice"
                value={company.fiscal_year_start}
              />
              <InfoItem label="Fin exercice" value={company.fiscal_year_end} />
            </div>
          </Card>

          {/* Liens rapides */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "1rem",
            }}
          >
            <QuickLinkCard
              title="Plan Comptable"
              icon="📚"
              count={stats.accounts || 0}
              link={`/companies/${company.id}/accounts`}
            />
            <QuickLinkCard
              title="Journaux"
              icon="📖"
              count={stats.journals || 0}
              link={`/companies/${company.id}/journals`}
            />
            <QuickLinkCard
              title="Écritures"
              icon="✍️"
              count={stats.entries || 0}
              link={`/companies/${company.id}/entries`}
            />
            <QuickLinkCard
              title="Déclarations TVA"
              icon="📊"
              count={stats.tvaReports || 0}
              link={`/companies/${company.id}/tva`}
            />
          </div>

          {/* Exercices comptables */}
          <Card title="📅 Exercice Comptable">
            <div
              style={{
                padding: "1rem",
                background: "#f8f9fa",
                borderRadius: "8px",
              }}
            >
              <p style={{ marginBottom: "0.5rem" }}>
                <strong>Exercice en cours :</strong> Du{" "}
                {company.fiscal_year_start} au {company.fiscal_year_end}
              </p>
              <p style={{ color: "#666", fontSize: "0.9rem" }}>
                L'exercice comptable définit la période sur laquelle sont
                calculés les résultats et établies les déclarations fiscales.
              </p>
            </div>
          </Card>
        </div>
      )}

      {activeTab === "contacts" && (
        <div style={{ display: "grid", gap: "1.5rem" }}>
          {/* Tiers */}
          <Card title="👥 Tiers (Clients & Fournisseurs)">
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                gap: "1rem",
              }}
            >
              <QuickLinkCard
                title="Clients"
                icon="🛒"
                count={stats.customers || 0}
                link={`/companies/${company.id}/customers`}
                variant="success"
              />
              <QuickLinkCard
                title="Fournisseurs"
                icon="📦"
                count={stats.suppliers || 0}
                link={`/companies/${company.id}/suppliers`}
                variant="warning"
              />
              <QuickLinkCard
                title="Tous les tiers"
                icon="👥"
                count={(stats.customers || 0) + (stats.suppliers || 0)}
                link={`/companies/${company.id}/third-parties`}
                variant="info"
              />
            </div>
          </Card>

          {/* Coordonnées principales */}
          <Card title="📞 Coordonnées de Contact">
            <div style={{ padding: "1rem" }}>
              <div style={{ marginBottom: "1rem" }}>
                <label
                  style={{
                    fontWeight: "600",
                    display: "block",
                    marginBottom: "0.25rem",
                  }}
                >
                  Email principal
                </label>
                <a
                  href={`mailto:${company.email}`}
                  style={{
                    color: "var(--primary-color)",
                    textDecoration: "none",
                  }}
                >
                  {company.email}
                </a>
              </div>
              <div style={{ marginBottom: "1rem" }}>
                <label
                  style={{
                    fontWeight: "600",
                    display: "block",
                    marginBottom: "0.25rem",
                  }}
                >
                  Téléphone principal
                </label>
                <a
                  href={`tel:${company.phone}`}
                  style={{
                    color: "var(--primary-color)",
                    textDecoration: "none",
                  }}
                >
                  {company.phone}
                </a>
              </div>
              {company.website && (
                <div>
                  <label
                    style={{
                      fontWeight: "600",
                      display: "block",
                      marginBottom: "0.25rem",
                    }}
                  >
                    Site web
                  </label>
                  <a
                    href={company.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      color: "var(--primary-color)",
                      textDecoration: "none",
                    }}
                  >
                    {company.website} ↗
                  </a>
                </div>
              )}
            </div>
          </Card>
        </div>
      )}

      {activeTab === "documents" && (
        <div style={{ display: "grid", gap: "1.5rem" }}>
          <Card title="📄 Documents">
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                gap: "1rem",
              }}
            >
              <QuickLinkCard
                title="Factures clients"
                icon="📤"
                count={stats.invoicesCustomer || 0}
                link={`/companies/${company.id}/invoices/customer`}
                variant="success"
              />
              <QuickLinkCard
                title="Factures fournisseurs"
                icon="📥"
                count={stats.invoicesSupplier || 0}
                link={`/companies/${company.id}/invoices/supplier`}
                variant="warning"
              />
              <QuickLinkCard
                title="Avoirs"
                icon="🔄"
                count={stats.creditNotes || 0}
                link={`/companies/${company.id}/credit-notes`}
                variant="info"
              />
              <QuickLinkCard
                title="Devis"
                icon="📋"
                count={stats.quotes || 0}
                link={`/companies/${company.id}/quotes`}
                variant="primary"
              />
            </div>
          </Card>

          {/* Transactions bancaires */}
          <Card title="💳 Transactions Bancaires">
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                gap: "1rem",
              }}
            >
              <QuickLinkCard
                title="Comptes bancaires"
                icon="🏦"
                count={stats.bankAccounts || 0}
                link={`/companies/${company.id}/bank-accounts`}
                variant="info"
              />
              <QuickLinkCard
                title="Transactions"
                icon="💰"
                count={stats.transactions || 0}
                link={`/companies/${company.id}/transactions`}
                variant="success"
              />
              <QuickLinkCard
                title="Rapprochement bancaire"
                icon="🔗"
                count={stats.toReconcile || 0}
                link={`/companies/${company.id}/reconciliation`}
                variant="warning"
              />
            </div>
          </Card>
        </div>
      )}

      {activeTab === "settings" && (
        <div style={{ display: "grid", gap: "1.5rem" }}>
          {/* Informations système */}
          <Card title="⚙️ Informations Système">
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                gap: "1.5rem",
              }}
            >
              <InfoItem label="ID" value={company.id} />
              <InfoItem
                label="Date de création"
                value={formatDate(company.createdAt)}
              />
              <InfoItem
                label="Dernière modification"
                value={formatDate(company.updatedAt)}
              />
              <InfoItem label="Statut" value={company.status} />
            </div>
          </Card>

          {/* Logo */}
          <Card title="🎨 Logo de l'entreprise">
            {company.logo_url ? (
              <div style={{ textAlign: "center" }}>
                <img
                  src={company.logo_url}
                  alt={`Logo ${company.name}`}
                  style={{ maxWidth: "200px", maxHeight: "200px" }}
                />
              </div>
            ) : (
              <div
                style={{
                  padding: "2rem",
                  background: "#f8f9fa",
                  borderRadius: "8px",
                  textAlign: "center",
                  color: "#666",
                }}
              >
                <p>Aucun logo défini</p>
                <button
                  className="btn btn-secondary"
                  style={{ marginTop: "1rem" }}
                  onClick={() => navigate(`/companies/${company.id}/edit`)}
                >
                  Ajouter un logo
                </button>
              </div>
            )}
          </Card>

          {/* Actions dangereuses */}
          <Card title="⚠️ Zone de danger">
            <div
              style={{
                padding: "1rem",
                background: "#fff3cd",
                borderRadius: "8px",
              }}
            >
              <h4 style={{ color: "#856404", marginBottom: "0.5rem" }}>
                Désactiver l'entreprise
              </h4>
              <p
                style={{
                  color: "#856404",
                  marginBottom: "1rem",
                  fontSize: "0.9rem",
                }}
              >
                La désactivation de l'entreprise empêchera toute nouvelle
                opération mais conservera l'historique.
              </p>
              {company.status === "active" && (
                <button className="btn btn-danger" onClick={handleDelete}>
                  🗑️ Désactiver cette entreprise
                </button>
              )}
              {company.status !== "active" && (
                <button
                  className="btn btn-success"
                  onClick={() => {
                    const formData = new FormData();
                    formData.append("intent", "activate");
                    fetcher.submit(formData, { method: "post" });
                  }}
                >
                  ✅ Réactiver cette entreprise
                </button>
              )}
            </div>
          </Card>
        </div>
      )}
    </>
  );
}

// ============================================
// Composant InfoItem
// ============================================
function InfoItem({ label, value, link, external }) {
  return (
    <div>
      <label
        style={{
          display: "block",
          fontSize: "0.85rem",
          fontWeight: "600",
          color: "#666",
          marginBottom: "0.25rem",
          textTransform: "uppercase",
        }}
      >
        {label}
      </label>
      {link ? (
        <a
          href={link}
          target={external ? "_blank" : undefined}
          rel={external ? "noopener noreferrer" : undefined}
          style={{
            color: "var(--primary-color)",
            textDecoration: "none",
            fontSize: "0.95rem",
          }}
        >
          {value || "—"} {external && "↗"}
        </a>
      ) : (
        <div style={{ fontSize: "0.95rem", color: "#333" }}>{value || "—"}</div>
      )}
    </div>
  );
}

// ============================================
// Composant QuickLinkCard
// ============================================
function QuickLinkCard({ title, icon, count, link, variant = "primary" }) {
  return (
    <Link
      to={link}
      style={{
        textDecoration: "none",
        color: "inherit",
      }}
    >
      <div
        style={{
          padding: "1.5rem",
          background: "#fff",
          border: "2px solid var(--border-color)",
          borderRadius: "8px",
          cursor: "pointer",
          transition: "all 0.2s",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = "var(--primary-color)";
          e.currentTarget.style.transform = "translateY(-2px)";
          e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = "var(--border-color)";
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = "none";
        }}
      >
        <div
          style={{
            fontSize: "2rem",
            marginBottom: "0.5rem",
            textAlign: "center",
          }}
        >
          {icon}
        </div>
        <h3
          style={{
            fontSize: "0.95rem",
            fontWeight: "600",
            textAlign: "center",
            marginBottom: "0.5rem",
          }}
        >
          {title}
        </h3>
        <div
          style={{
            fontSize: "1.5rem",
            fontWeight: "700",
            textAlign: "center",
            color: `var(--${variant}-color, var(--primary-color))`,
          }}
        >
          {count}
        </div>
      </div>
    </Link>
  );
}
