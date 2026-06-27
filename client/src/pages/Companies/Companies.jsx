import {
  useLoaderData,
  Form,
  useNavigation,
  useActionData,
} from "react-router-dom";
import { useState, useEffect } from "react";
import Card from "../../components/ui/Card";
import StatCard from "../../components/ui/StatCard";
import Badge from "../../components/ui/Badge";

export default function Companies() {
  const loaderData = useLoaderData();
  const companies = loaderData?.companies || [];
  const stats = loaderData?.stats || { total: 0, active: 0 };
  console.log("🚀 ~ Companies ~ loaderData:", loaderData);
  const navigation = useNavigation();
  const actionData = useActionData();

  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentCompanyId, setCurrentCompanyId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    siret: "",
    siren: "",
    tva_number: "",
    naf_code: "",
    legal_form: "",
    address: "",
    postal_code: "",
    city: "",
    country: "France",
    email: "",
    phone: "",
    website: "",
    capital: "",
    fiscal_year_start: "01-01",
    fiscal_year_end: "12-31",
    tva_regime: "normal",
    accounting_plan: "PCG",
    status: "active",
    notes: "",
  });

  // Fermer le modal après succès
  useEffect(() => {
    if (navigation.state === "loading" && actionData?.success !== false) {
      setShowModal(false);
    }
  }, [navigation.state, actionData]);

  // Filtrer les entreprises
  const filteredCompanies = companies.filter(
    (company) =>
      company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.siret?.includes(searchTerm) ||
      company.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Gérer les changements
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Auto-calculer le SIREN
    if (name === "siret" && value.length === 14) {
      setFormData((prev) => ({ ...prev, siren: value.substring(0, 9) }));
    }
  };

  // Créer
  const handleCreate = () => {
    setEditMode(false);
    setCurrentCompanyId(null);
    setFormData({
      name: "",
      siret: "",
      siren: "",
      tva_number: "",
      naf_code: "",
      legal_form: "",
      address: "",
      postal_code: "",
      city: "",
      country: "France",
      email: "",
      phone: "",
      website: "",
      capital: "",
      fiscal_year_start: "01-01",
      fiscal_year_end: "12-31",
      tva_regime: "normal",
      accounting_plan: "PCG",
      status: "active",
      notes: "",
    });
    setShowModal(true);
  };

  // Éditer
  const handleEdit = (company) => {
    setEditMode(true);
    setCurrentCompanyId(company.id);
    setFormData({
      name: company.name || "",
      siret: company.siret || "",
      siren: company.siren || "",
      tva_number: company.tva_number || "",
      naf_code: company.naf_code || "",
      legal_form: company.legal_form || "",
      address: company.address || "",
      postal_code: company.postal_code || "",
      city: company.city || "",
      country: company.country || "France",
      email: company.email || "",
      phone: company.phone || "",
      website: company.website || "",
      capital: company.capital || "",
      fiscal_year_start: company.fiscal_year_start || "01-01",
      fiscal_year_end: company.fiscal_year_end || "12-31",
      tva_regime: company.tva_regime || "normal",
      accounting_plan: company.accounting_plan || "PCG",
      status: company.status || "active",
      notes: company.notes || "",
    });
    setShowModal(true);
  };

  const isSubmitting = navigation.state === "submitting";

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Gestion des Entreprises</h1>
        <button className="btn btn-primary" onClick={handleCreate}>
          ➕ Nouvelle Entreprise
        </button>
      </div>

      {/* Statistiques */}
      <div className="stats-grid">
        <StatCard
          label="Entreprises Actives"
          value={stats?.active || 0}
          variant="success"
        />
        <StatCard
          label="Total Entreprises"
          value={stats?.total || companies.length}
        />
        <StatCard
          label="Inactives"
          value={companies.filter((c) => c.status === "inactive").length}
          variant="error"
        />
        <StatCard
          label="Suspendues"
          value={companies.filter((c) => c.status === "suspended").length}
          variant="warning"
        />
      </div>

      {/* Tableau */}
      <Card title="Liste des Entreprises">
        <div style={{ marginBottom: "1.5rem" }}>
          <input
            type="text"
            placeholder="🔍 Rechercher par nom, SIRET ou email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: "100%",
              padding: "0.75rem",
              border: "1px solid var(--border)",
              borderRadius: "0.5rem",
              fontSize: "0.95rem",
            }}
          />
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Nom</th>
                <th>SIRET</th>
                <th>Ville</th>
                <th>Email</th>
                <th>Téléphone</th>
                <th>Régime TVA</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCompanies.length === 0 ? (
                <tr>
                  <td
                    colSpan="8"
                    style={{ textAlign: "center", padding: "2rem" }}
                  >
                    {searchTerm
                      ? "Aucune entreprise trouvée"
                      : "Aucune entreprise enregistrée"}
                  </td>
                </tr>
              ) : (
                filteredCompanies.map((company) => (
                  <tr key={company.id}>
                    <td>
                      <strong>{company.name}</strong>
                      {company.legal_form && (
                        <div
                          style={{
                            fontSize: "0.85rem",
                            color: "#666",
                            marginTop: "0.25rem",
                          }}
                        >
                          {company.legal_form}
                        </div>
                      )}
                    </td>
                    <td>
                      <div>{company.siret}</div>
                      {company.siren && (
                        <div style={{ fontSize: "0.85rem", color: "#666" }}>
                          SIREN: {company.siren}
                        </div>
                      )}
                    </td>
                    <td>
                      {company.city && company.postal_code
                        ? `${company.city} (${company.postal_code})`
                        : company.city || "—"}
                    </td>
                    <td>{company.email}</td>
                    <td>{company.phone}</td>
                    <td>
                      <Badge
                        variant={
                          company.tva_regime === "franchise"
                            ? "warning"
                            : "info"
                        }
                      >
                        {company.tva_regime}
                      </Badge>
                    </td>
                    <td>
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
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: "0.5rem" }}>
                        <button
                          className="btn btn-primary"
                          onClick={() => handleEdit(company)}
                          title="Modifier"
                          style={{
                            padding: "0.4rem 0.8rem",
                            fontSize: "0.85rem",
                          }}
                        >
                          ✏️
                        </button>
                        {company.status === "active" && (
                          <Form method="post" style={{ display: "inline" }}>
                            <input type="hidden" name="intent" value="delete" />
                            <input type="hidden" name="id" value={company.id} />
                            <button
                              type="submit"
                              className="btn btn-danger"
                              title="Désactiver"
                              style={{
                                padding: "0.4rem 0.8rem",
                                fontSize: "0.85rem",
                              }}
                              onClick={(e) => {
                                if (
                                  !window.confirm(
                                    `Êtes-vous sûr de vouloir désactiver "${company.name}" ?`
                                  )
                                ) {
                                  e.preventDefault();
                                }
                              }}
                            >
                              🗑️
                            </button>
                          </Form>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div
          style={{
            marginTop: "1rem",
            padding: "0.75rem",
            background: "#f8f9fa",
            borderRadius: "0.5rem",
            fontSize: "0.9rem",
            color: "#666",
          }}
        >
          Affichage de {filteredCompanies.length} entreprise(s)
          {searchTerm && ` sur ${companies.length} au total`}
        </div>
      </Card>

      {/* Modal */}
      {showModal && (
        <div className="modal active">
          <div className="modal-content" style={{ maxWidth: "900px" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "1.5rem",
              }}
            >
              <h2 className="card-title">
                {editMode ? "Modifier l'entreprise" : "Nouvelle Entreprise"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "1.5rem",
                  cursor: "pointer",
                  color: "#666",
                }}
              >
                ×
              </button>
            </div>

            <Form method="post">
              <input
                type="hidden"
                name="intent"
                value={editMode ? "update" : "create"}
              />
              {editMode && (
                <input type="hidden" name="id" value={currentCompanyId} />
              )}

              {/* Informations générales */}
              <fieldset
                style={{
                  marginBottom: "1.5rem",
                  padding: "1rem",
                  border: "1px solid #e0e0e0",
                  borderRadius: "8px",
                }}
              >
                <legend style={{ padding: "0 0.5rem", fontWeight: "600" }}>
                  📋 Informations Générales
                </legend>

                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="name">
                      Nom de l'entreprise{" "}
                      <span style={{ color: "red" }}>*</span>
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="legal_form">Forme Juridique</label>
                    <select
                      id="legal_form"
                      name="legal_form"
                      value={formData.legal_form}
                      onChange={handleInputChange}
                    >
                      <option value="">Sélectionner...</option>
                      <option value="SARL">SARL</option>
                      <option value="EURL">EURL</option>
                      <option value="SAS">SAS</option>
                      <option value="SASU">SASU</option>
                      <option value="SA">SA</option>
                      <option value="SNC">SNC</option>
                      <option value="EI">Entreprise Individuelle</option>
                      <option value="Auto">Auto-Entrepreneur</option>
                      <option value="Association">Association</option>
                    </select>
                  </div>
                </div>

                <div
                  className="form-grid"
                  style={{ gridTemplateColumns: "1fr 1fr 1fr" }}
                >
                  <div className="form-group">
                    <label htmlFor="siret">
                      SIRET <span style={{ color: "red" }}>*</span>
                    </label>
                    <input
                      type="text"
                      id="siret"
                      name="siret"
                      maxLength="14"
                      value={formData.siret}
                      onChange={handleInputChange}
                      required
                      placeholder="14 chiffres"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="siren">SIREN</label>
                    <input
                      type="text"
                      id="siren"
                      name="siren"
                      maxLength="9"
                      value={formData.siren}
                      readOnly
                      style={{ background: "#f5f5f5" }}
                      placeholder="Auto-calculé"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="naf_code">Code NAF/APE</label>
                    <input
                      type="text"
                      id="naf_code"
                      name="naf_code"
                      maxLength="5"
                      value={formData.naf_code}
                      onChange={handleInputChange}
                      placeholder="Ex: 6201Z"
                    />
                  </div>
                </div>

                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="tva_number">
                      Numéro TVA Intracommunautaire
                    </label>
                    <input
                      type="text"
                      id="tva_number"
                      name="tva_number"
                      value={formData.tva_number}
                      onChange={handleInputChange}
                      placeholder="Ex: FR12123456789"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="capital">Capital Social (€)</label>
                    <input
                      type="number"
                      id="capital"
                      name="capital"
                      step="0.01"
                      value={formData.capital}
                      onChange={handleInputChange}
                      placeholder="Ex: 50000"
                    />
                  </div>
                </div>
              </fieldset>

              {/* Adresse */}
              <fieldset
                style={{
                  marginBottom: "1.5rem",
                  padding: "1rem",
                  border: "1px solid #e0e0e0",
                  borderRadius: "8px",
                }}
              >
                <legend style={{ padding: "0 0.5rem", fontWeight: "600" }}>
                  📍 Adresse
                </legend>

                <div className="form-group">
                  <label htmlFor="address">
                    Adresse complète <span style={{ color: "red" }}>*</span>
                  </label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    required
                    placeholder="Numéro et nom de rue"
                  />
                </div>

                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="postal_code">Code Postal</label>
                    <input
                      type="text"
                      id="postal_code"
                      name="postal_code"
                      maxLength="5"
                      value={formData.postal_code}
                      onChange={handleInputChange}
                      placeholder="75001"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="city">Ville</label>
                    <input
                      type="text"
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      placeholder="Paris"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="country">Pays</label>
                    <input
                      type="text"
                      id="country"
                      name="country"
                      value={formData.country}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </fieldset>

              {/* Contact */}
              <fieldset
                style={{
                  marginBottom: "1.5rem",
                  padding: "1rem",
                  border: "1px solid #e0e0e0",
                  borderRadius: "8px",
                }}
              >
                <legend style={{ padding: "0 0.5rem", fontWeight: "600" }}>
                  📞 Contact
                </legend>

                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="email">
                      Email <span style={{ color: "red" }}>*</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      placeholder="contact@entreprise.fr"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="phone">
                      Téléphone <span style={{ color: "red" }}>*</span>
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                      placeholder="0140123456"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="website">Site Web</label>
                    <input
                      type="url"
                      id="website"
                      name="website"
                      value={formData.website}
                      onChange={handleInputChange}
                      placeholder="https://www.entreprise.fr"
                    />
                  </div>
                </div>
              </fieldset>

              {/* Paramètres comptables */}
              <fieldset
                style={{
                  marginBottom: "1.5rem",
                  padding: "1rem",
                  border: "1px solid #e0e0e0",
                  borderRadius: "8px",
                }}
              >
                <legend style={{ padding: "0 0.5rem", fontWeight: "600" }}>
                  📊 Paramètres Comptables
                </legend>

                <div
                  className="form-grid"
                  style={{ gridTemplateColumns: "1fr 1fr 1fr 1fr" }}
                >
                  <div className="form-group">
                    <label htmlFor="tva_regime">Régime TVA</label>
                    <select
                      id="tva_regime"
                      name="tva_regime"
                      value={formData.tva_regime}
                      onChange={handleInputChange}
                    >
                      <option value="normal">Normal</option>
                      <option value="simplifie">Simplifié</option>
                      <option value="reel">Réel</option>
                      <option value="franchise">Franchise en base</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="accounting_plan">Plan Comptable</label>
                    <select
                      id="accounting_plan"
                      name="accounting_plan"
                      value={formData.accounting_plan}
                      onChange={handleInputChange}
                    >
                      <option value="PCG">PCG (Plan Comptable Général)</option>
                      <option value="Custom">Personnalisé</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="fiscal_year_start">Début exercice</label>
                    <input
                      type="text"
                      id="fiscal_year_start"
                      name="fiscal_year_start"
                      value={formData.fiscal_year_start}
                      onChange={handleInputChange}
                      placeholder="01-01"
                      maxLength="5"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="fiscal_year_end">Fin exercice</label>
                    <input
                      type="text"
                      id="fiscal_year_end"
                      name="fiscal_year_end"
                      value={formData.fiscal_year_end}
                      onChange={handleInputChange}
                      placeholder="12-31"
                      maxLength="5"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="status">Statut</label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="suspended">Suspendue</option>
                  </select>
                </div>
              </fieldset>

              {/* Notes */}
              <div className="form-group">
                <label htmlFor="notes">Notes internes</label>
                <textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows="3"
                  placeholder="Notes ou commentaires..."
                />
              </div>

              {/* Boutons */}
              <div
                className="btn-group"
                style={{ marginTop: "1.5rem", justifyContent: "flex-end" }}
              >
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowModal(false)}
                  disabled={isSubmitting}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting
                    ? "⏳ En cours..."
                    : editMode
                    ? "💾 Enregistrer"
                    : "➕ Créer"}
                </button>
              </div>
            </Form>
          </div>
        </div>
      )}
    </>
  );
}
