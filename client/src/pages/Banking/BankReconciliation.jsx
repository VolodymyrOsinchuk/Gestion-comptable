import { useLoaderData } from "react-router-dom";
import Card from "../../components/ui/Card";
import StatCard from "../../components/ui/StatCard";
import Badge from "../../components/ui/Badge";

export default function BankReconciliation() {
  const { transactions } = useLoaderData();

  const reconciled = transactions.filter((t) => t.status === "reconciled");
  const pending = transactions.filter((t) => t.status === "pending" || t.status === "imported");
  const debitTotal = transactions.reduce((s, t) => s + Number(t.debit || 0), 0);
  const creditTotal = transactions.reduce((s, t) => s + Number(t.credit || 0), 0);

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Rapprochement Bancaire</h1>
      </div>

      <Card title="Import du Relevé Bancaire">
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="bankAccount">Compte Bancaire</label>
            <select id="bankAccount">
              <option value="">Sélectionner le compte</option>
              <option value="compte1">Compte Principal - FR76 1234...</option>
              <option value="compte2">Compte Secondaire - FR76 5678...</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="statementPeriod">Période</label>
            <input type="month" id="statementPeriod" />
          </div>
        </div>

        <input
          type="file"
          id="bankUpload"
          accept=".csv,.xlsx,.xls"
          style={{ display: "none" }}
        />
        <button
          className="btn btn-primary"
          onClick={() => document.getElementById("bankUpload").click()}
        >
          ☁️ Importer le relevé
        </button>
      </Card>

      <Card title="État de Rapprochement">
        <div className="stats-grid">
          <StatCard label="Transactions" value={String(transactions.length)} />
          <StatCard label="Rapprochées" value={String(reconciled.length)} />
          <StatCard label="En attente" value={String(pending.length)} variant="warning" />
          <StatCard label="Écart" value={`${(debitTotal - creditTotal).toLocaleString("fr-FR", { minimumFractionDigits: 2 })} €`} variant={Math.abs(debitTotal - creditTotal) > 0.01 ? "error" : "success"} />
        </div>
      </Card>

      <Card title="Transactions Bancaires">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Libellé</th>
                <th>Référence</th>
                <th>Débit</th>
                <th>Crédit</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tr) => (
                <tr key={tr.id}>
                  <td>{tr.date}</td>
                  <td>{tr.label}</td>
                  <td>{tr.reference}</td>
                  <td>{Number(tr.debit) > 0 ? `${Number(tr.debit).toFixed(2)} €` : "-"}</td>
                  <td>{Number(tr.credit) > 0 ? `${Number(tr.credit).toFixed(2)} €` : "-"}</td>
                  <td>
                    <Badge
                      variant={
                        tr.status === "reconciled" ? "success" : "warning"
                      }
                    >
                      {tr.status}
                    </Badge>
                  </td>
                  <td>
                    <button
                      className="btn btn-primary"
                      style={{ padding: "0.5rem 1rem", fontSize: "0.875rem" }}
                    >
                      Rapprocher
                    </button>
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
