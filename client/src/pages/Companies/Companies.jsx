import { useLoaderData, useFetcher } from "react-router-dom";
import { useState } from "react";
import Card from "../../components/ui/Card";
import StatCard from "../../components/ui/StatCard";
import Badge from "../../components/ui/Badge";

export default function Companies() {
  const { companies } = useLoaderData();
  const fetcher = useFetcher();
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    siret: "",
    address: "",
    email: "",
    phone: "",
    tva: "",
    naf: "",
    legalForm: "",
  });

  const activeCompanies = companies.filter((c) => c.status === "active").length;

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const submitData = new FormData();
    submitData.append("intent", "create");
    submitData.append("name", formData.name);
    submitData.append("siret", formData.siret);
    submitData.append("address", formData.address);
    submitData.append("email", formData.email);
    submitData.append("phone", formData.phone);

    fetcher.submit(submitData, { method: "post" });
    setShowModal(false);

    setFormData({
      name: "",
      siret: "",
      address: "",
      email: "",
      phone: "",
      tva: "",
      naf: "",
      legalForm: "",
    });
  };

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Gestion des Entreprises</h1>
      </div>

      <div className="stats-grid">
        <StatCard
          label="Entreprises Actives"
          value={activeCompanies}
          variant="success"
        />
        <StatCard label="Total Entreprises" value={companies.length} />
        <StatCard label="Nouveaux ce mois" value="0" />
      </div>

      <Card title="Liste des Entreprises">
        <button
          className="btn btn-primary"
          onClick={() => setShowModal(true)}
          style={{ marginBottom: "1.5rem" }}
        >
          ➕ Ajouter une Entreprise
        </button>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Nom</th>
                <th>SIRET</th>
                <th>Adresse</th>
                <th>Email</th>
                <th>Téléphone</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {companies.map((company) => (
                <tr key={company.id}>
                  <td>
                    <strong>{company.name}</strong>
                  </td>
                  <td>{company.siret}</td>
                  <td>{company.address}</td>
                  <td>{company.email}</td>
                  <td>{company.phone}</td>
                  <td>
                    <Badge
                      variant={
                        company.status === "active" ? "success" : "error"
                      }
                    >
                      {company.status}
                    </Badge>
                  </td>
                  <td>
                    <button
                      className="btn btn-primary"
                      style={{ padding: "0.5rem 1rem", fontSize: "0.875rem" }}
                    >
                      Modifier
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {showModal && (
        <div className="modal active">
          <div className="modal-content">
            <h2 className="card-title" style={{ marginBottom: "1.5rem" }}>
              Nouvelle Entreprise
            </h2>

            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="name">Nom de l'entreprise *</label>
                  <input
                    type="text"
                    id="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="siret">SIRET *</label>
                  <input
                    type="text"
                    id="siret"
                    maxLength="14"
                    value={formData.siret}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="address">Adresse *</label>
                <input
                  type="text"
                  id="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="email">Email *</label>
                  <input
                    type="email"
                    id="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="phone">Téléphone *</label>
                  <input
                    type="tel"
                    id="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="tva">Numéro TVA</label>
                  <input
                    type="text"
                    id="tva"
                    value={formData.tva}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="naf">Code NAF</label>
                  <input
                    type="text"
                    id="naf"
                    value={formData.naf}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="legalForm">Forme Juridique</label>
                <select
                  id="legalForm"
                  value={formData.legalForm}
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
                </select>
              </div>

              <div className="btn-group" style={{ marginTop: "1.5rem" }}>
                <button type="submit" className="btn btn-primary">
                  Enregistrer
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
