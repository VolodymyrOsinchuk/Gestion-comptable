import { useLoaderData } from "react-router-dom";
import Card from "../../components/ui/Card";
import StatCard from "../../components/ui/StatCard";
import Badge from "../../components/ui/Badge";

export default function Documents() {
  const { documents, accountingEntries } = useLoaderData();

  const totalAmount = documents.reduce((sum, d) => sum + d.amountTTC, 0);
  const validatedCount = documents.filter(
    (d) => d.status === "validated"
  ).length;
  const pendingCount = documents.filter((d) => d.status === "pending").length;

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Documents & Écritures</h1>
      </div>

      <div className="stats-grid">
        <StatCard label="Documents Totaux" value={documents.length} />
        <StatCard label="Validés" value={validatedCount} variant="success" />
        <StatCard label="En attente" value={pendingCount} variant="warning" />
        <StatCard label="Montant Total" value={`${totalAmount.toFixed(2)} €`} />
      </div>

      <Card title="Liste des Documents">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Référence</th>
                <th>Date</th>
                <th>Type</th>
                <th>Fournisseur</th>
                <th>Montant TTC</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {documents.map((doc) => (
                <tr key={doc.id}>
                  <td>{doc.reference}</td>
                  <td>{doc.date}</td>
                  <td>{doc.type}</td>
                  <td>{doc.supplier}</td>
                  <td>{doc.amountTTC.toFixed(2)} €</td>
                  <td>
                    <Badge
                      variant={
                        doc.status === "validated" ? "success" : "warning"
                      }
                    >
                      {doc.status}
                    </Badge>
                  </td>
                  <td>
                    <button
                      className="btn btn-primary"
                      style={{ padding: "0.5rem 1rem", fontSize: "0.875rem" }}
                    >
                      Voir
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card title="Écritures Comptables Associées">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Compte</th>
                <th>Libellé</th>
                <th>Débit</th>
                <th>Crédit</th>
                <th>Journal</th>
              </tr>
            </thead>
            <tbody>
              {accountingEntries.map((entry) => (
                <tr key={entry.id}>
                  <td>{entry.date}</td>
                  <td>{entry.account}</td>
                  <td>{entry.label}</td>
                  <td>
                    {entry.debit > 0 ? `${entry.debit.toFixed(2)} €` : "-"}
                  </td>
                  <td>
                    {entry.credit > 0 ? `${entry.credit.toFixed(2)} €` : "-"}
                  </td>
                  <td>
                    <Badge variant="info">{entry.journal}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}
