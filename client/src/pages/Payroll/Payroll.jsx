import { useLoaderData } from "react-router-dom";
import Card from "../../components/ui/Card";
import StatCard from "../../components/ui/StatCard";
import Badge from "../../components/ui/Badge";

export default function Payroll() {
  const { payroll } = useLoaderData();

  const totalEmployees = payroll.reduce((s, p) => s + (p.employee_count || 0), 0);
  const totalGross = payroll.reduce((s, p) => s + Number(p.total_gross || 0), 0);
  const totalCharges = payroll.reduce((s, p) => s + Number(p.total_charges || 0), 0);
  const totalNet = payroll.reduce((s, p) => s + Number(p.total_net || 0), 0);

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Paie & Social</h1>
      </div>

      <div className="stats-grid">
        <StatCard label="Salariés" value={String(totalEmployees)} />
        <StatCard label="Masse Salariale (mois)" value={`${totalGross.toLocaleString("fr-FR", { minimumFractionDigits: 2 })} €`} />
        <StatCard label="Charges Sociales" value={`${totalCharges.toLocaleString("fr-FR", { minimumFractionDigits: 2 })} €`} variant="warning" />
        <StatCard label="Net à Payer" value={`${totalNet.toLocaleString("fr-FR", { minimumFractionDigits: 2 })} €`} variant="success" />
      </div>

      <Card title="Bulletin de Paie">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Période</th>
                <th>Salariés</th>
                <th>Brut Total</th>
                <th>Charges</th>
                <th>Net Total</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {payroll.map((pay) => (
                <tr key={pay.id}>
                  <td>{pay.period}</td>
                  <td>{pay.employee_count}</td>
                  <td>
                    {Number(pay.total_gross).toLocaleString("fr-FR", {
                      minimumFractionDigits: 2,
                    })} €
                  </td>
                  <td>
                    {Number(pay.total_charges).toLocaleString("fr-FR", {
                      minimumFractionDigits: 2,
                    })} €
                  </td>
                  <td>
                    {Number(pay.total_net).toLocaleString("fr-FR", {
                      minimumFractionDigits: 2,
                    })} €
                  </td>
                  <td>
                    <Badge
                      variant={pay.status === "paid" ? "success" : "warning"}
                    >
                      {pay.status}
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

      <Card title="Déclarations Sociales">
        <div className="btn-group">
          <button className="btn btn-primary">📋 DSN Mensuelle</button>
          <button className="btn btn-primary">👥 URSSAF</button>
          <button className="btn btn-primary">🏥 Mutuelle</button>
          <button className="btn btn-primary">
            🎓 Formation Professionnelle
          </button>
        </div>
      </Card>
    </>
  );
}
