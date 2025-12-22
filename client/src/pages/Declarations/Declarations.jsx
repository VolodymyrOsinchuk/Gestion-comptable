import { useLoaderData } from "react-router-dom";
import Card from "../../components/ui/Card";
import StatCard from "../../components/ui/StatCard";
import Badge from "../../components/ui/Badge";

export default function Declarations() {
  const { declarations } = useLoaderData();

  const draftCount = declarations.filter((d) => d.status === "draft").length;
  const submittedCount = declarations.filter(
    (d) => d.status === "submitted"
  ).length;
  const totalAmount = declarations.reduce((s, d) => s + d.amount, 0);

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Déclarations Fiscales</h1>
      </div>

      <div className="stats-grid">
        <StatCard label="En Attente" value={draftCount} variant="warning" />
        <StatCard label="Soumises" value={submittedCount} variant="success" />
        <StatCard
          label="Montant Total"
          value={`${totalAmount.toLocaleString("fr-FR")} €`}
        />
      </div>

      <Card title="Calendrier Fiscal">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Type</th>
                <th>Période</th>
                <th>Échéance</th>
                <th>Montant</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {declarations.map((decl) => (
                <tr key={decl.id}>
                  <td>
                    <Badge variant="info">{decl.type.toUpperCase()}</Badge>
                  </td>
                  <td>{decl.period}</td>
                  <td>{decl.deadline}</td>
                  <td>
                    {decl.amount.toLocaleString("fr-FR", {
                      minimumFractionDigits: 2,
                    })}{" "}
                    €
                  </td>
                  <td>
                    <Badge
                      variant={
                        decl.status === "submitted" ? "success" : "warning"
                      }
                    >
                      {decl.status}
                    </Badge>
                  </td>
                  <td>
                    <button
                      className="btn btn-primary"
                      style={{ padding: "0.5rem 1rem", fontSize: "0.875rem" }}
                    >
                      Préparer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card title="Nouvelle Déclaration">
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="declType">Type de Déclaration</label>
            <select id="declType">
              <option value="">Sélectionner...</option>
              <option value="tva">TVA (CA3)</option>
              <option value="is">Impôt sur les Sociétés</option>
              <option value="cfet">CFET</option>
              <option value="cvae">CVAE</option>
              <option value="deb">DEB (Déclaration Échanges de Biens)</option>
              <option value="des">
                DES (Déclaration Échanges de Services)
              </option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="declPeriod">Période</label>
            <input type="month" id="declPeriod" />
          </div>
        </div>

        <button className="btn btn-primary">➕ Créer une Déclaration</button>
      </Card>
    </>
  );
}
