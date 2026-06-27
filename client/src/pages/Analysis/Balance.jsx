import { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";

const API = import.meta.env.VITE_API_URL || "/api/v1";

export default function Balance() {
  const { companyId } = useParams();
  const [accounts, setAccounts] = useState([]);
  const [totals, setTotals] = useState({ totalDebit: 0, totalCredit: 0 });
  const [year, setYear] = useState(new Date().getFullYear());
  const [classe, setClasse] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchBalance = useCallback(async () => {
    if (!companyId) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({ year });
      if (classe) params.set("classe", classe);
      const res = await fetch(`${API}/accounting/${companyId}/balance?${params}`);
      const data = await res.json();
      if (res.ok) {
        setAccounts(data.accounts || []);
        setTotals({ totalDebit: data.totalDebit, totalCredit: data.totalCredit });
      }
    } catch (err) {
      console.error("Erreur balance:", err);
    } finally {
      setLoading(false);
    }
  }, [companyId, year, classe]);

  useEffect(() => {
    fetchBalance();
  }, [fetchBalance]);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear - i);

  const netTotal = totals.totalDebit - totals.totalCredit;

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">État de Solde</h1>
        <p className="page-subtitle">Balance générale des comptes</p>
      </div>

      <Card>
        <div className="form-grid" style={{ gridTemplateColumns: "1fr 1fr auto", alignItems: "end" }}>
          <div className="form-group">
            <label>Exercice</label>
            <select value={year} onChange={(e) => setYear(Number(e.target.value))}>
              {years.map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Classe</label>
            <select value={classe} onChange={(e) => setClasse(e.target.value)}>
              <option value="">Toutes les classes</option>
              <option value="1">1 — Capitaux</option>
              <option value="2">2 — Immobilisations</option>
              <option value="3">3 — Stocks</option>
              <option value="4">4 — Tiers</option>
              <option value="5">5 — Financiers</option>
              <option value="6">6 — Charges</option>
              <option value="7">7 — Produits</option>
            </select>
          </div>
        </div>
      </Card>

      <Card title={`Balance — Exercice ${year}`}>
        {loading ? (
          <p style={{ color: "#666" }}>Chargement...</p>
        ) : accounts.length === 0 ? (
          <p style={{ color: "#666" }}>Aucune écriture pour l'exercice {year}.</p>
        ) : (
          <>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Compte</th>
                    <th>Libellé</th>
                    <th>Classe</th>
                    <th>Type</th>
                    <th style={{ textAlign: "right" }}>Total Débit</th>
                    <th style={{ textAlign: "right" }}>Total Crédit</th>
                    <th style={{ textAlign: "right" }}>Solde</th>
                  </tr>
                </thead>
                <tbody>
                  {accounts.map((acc) => (
                    <tr key={acc.account_number}>
                      <td className="td-mono">{acc.account_number}</td>
                      <td>{acc.label}</td>
                      <td>{acc.account_class}</td>
                      <td>
                        <Badge variant={acc.account_type === "revenue" || acc.account_type === "asset" ? "success" : acc.account_type === "liability" ? "warning" : "info"}>
                          {acc.account_type}
                        </Badge>
                      </td>
                      <td style={{ textAlign: "right" }}>{acc.total_debit.toLocaleString("fr-FR", { minimumFractionDigits: 2 })}</td>
                      <td style={{ textAlign: "right" }}>{acc.total_credit.toLocaleString("fr-FR", { minimumFractionDigits: 2 })}</td>
                      <td style={{ textAlign: "right", fontWeight: 600, color: acc.side === "debit" ? "var(--success)" : "var(--danger)" }}>
                        {acc.balance.toLocaleString("fr-FR", { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr style={{ fontWeight: 700, borderTop: "2px solid var(--primary)" }}>
                    <td colSpan={4}>TOTAUX</td>
                    <td style={{ textAlign: "right" }}>{totals.totalDebit.toLocaleString("fr-FR", { minimumFractionDigits: 2 })}</td>
                    <td style={{ textAlign: "right" }}>{totals.totalCredit.toLocaleString("fr-FR", { minimumFractionDigits: 2 })}</td>
                    <td style={{ textAlign: "right", color: netTotal >= 0 ? "var(--success)" : "var(--danger)" }}>
                      {netTotal.toLocaleString("fr-FR", { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
            <p style={{ marginTop: "0.75rem", color: "#666", fontSize: "0.875rem" }}>
              {accounts.length} comptes movementés
            </p>
          </>
        )}
      </Card>
    </>
  );
}
