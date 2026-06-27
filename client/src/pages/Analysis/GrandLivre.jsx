import { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";

const API = import.meta.env.VITE_API_URL || "/api/v1";

export default function GrandLivre() {
  const { companyId } = useParams();
  const [entries, setEntries] = useState([]);
  const [total, setTotal] = useState(0);
  const [year, setYear] = useState(new Date().getFullYear());
  const [accountFilter, setAccountFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const pageSize = 100;

  const fetchEntries = useCallback(async () => {
    if (!companyId) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({ year, page, pageSize });
      if (accountFilter) params.set("account_number", accountFilter);
      if (startDate) params.set("start_date", startDate);
      if (endDate) params.set("end_date", endDate);
      const res = await fetch(
        `${API}/accounting/${companyId}/grand-livre?${params}`,
      );
      const data = await res.json();
      if (res.ok) {
        setEntries(data.entries || []);
        setTotal(data.total || 0);
      }
    } catch (err) {
      console.error("Erreur grand-livre:", err);
    } finally {
      setLoading(false);
    }
  }, [companyId, year, accountFilter, startDate, endDate, page, pageSize]);

  useEffect(() => {
    setPage(1);
  }, [year, accountFilter, startDate, endDate]);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear - i);
  const totalPages = Math.ceil(total / pageSize);

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Grand Livre Comptable</h1>
        <p className="page-subtitle">Toutes les écritures comptables</p>
      </div>

      <Card>
        <div
          className="form-grid"
          style={{
            gridTemplateColumns: "1fr 1fr 1fr 1fr auto",
            alignItems: "end",
          }}
        >
          <div className="form-group">
            <label>Exercice</label>
            <select
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
            >
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Compte (préfixe)</label>
            <input
              type="text"
              placeholder="Ex: 411, 401..."
              value={accountFilter}
              onChange={(e) => setAccountFilter(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Date début</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Date fin</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>
      </Card>

      <Card title={`Écritures comptables — ${total} lignes`}>
        {loading ? (
          <p style={{ color: "#666" }}>Chargement...</p>
        ) : entries.length === 0 ? (
          <p style={{ color: "#666" }}>Aucune écriture trouvée.</p>
        ) : (
          <>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Pièce</th>
                    <th>Compte</th>
                    <th>Libellé</th>
                    <th>Lettrage</th>
                    <th>Lettré</th>
                    <th style={{ textAlign: "right" }}>Débit</th>
                    <th style={{ textAlign: "right" }}>Crédit</th>
                    <th>Journal</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map((e) => (
                    <tr key={e.id}>
                      <td>{e.entry_date}</td>
                      <td className="td-mono">{e.entry_number}</td>
                      <td className="td-mono">{e.account_number}</td>
                      <td>{e.label}</td>
                      <td>{e.lettrage || "-"}</td>
                      <td>{e.is_lettred ? "✅" : "—"}</td>
                      <td style={{ textAlign: "right" }}>
                        {Number(e.debit) > 0
                          ? Number(e.debit).toLocaleString("fr-FR", {
                              minimumFractionDigits: 2,
                            })
                          : "-"}
                      </td>
                      <td style={{ textAlign: "right" }}>
                        {Number(e.credit) > 0
                          ? Number(e.credit).toLocaleString("fr-FR", {
                              minimumFractionDigits: 2,
                            })
                          : "-"}
                      </td>
                      <td>{e.journal_id || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div
                className="pagination"
                style={{
                  display: "flex",
                  justifyContent: "center",
                  gap: "0.5rem",
                  marginTop: "1rem",
                }}
              >
                <button
                  className="btn btn-secondary"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  ← Précédent
                </button>
                <span style={{ padding: "0.5rem 1rem", alignSelf: "center" }}>
                  Page {page} / {totalPages}
                </span>
                <button
                  className="btn btn-secondary"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Suivant →
                </button>
              </div>
            )}
          </>
        )}
      </Card>
    </>
  );
}
