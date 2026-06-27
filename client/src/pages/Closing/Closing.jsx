import { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import Card from "../../components/ui/Card";
import Alert from "../../components/ui/Alert";

const API = import.meta.env.VITE_API_URL || "/api/v1";

export default function Closing() {
  const { companyId } = useParams();
  const [year, setYear] = useState(new Date().getFullYear());
  const [closureStatus, setClosureStatus] = useState(null);
  const [bilan, setBilan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [closing, setClosing] = useState(false);

  const fetchData = useCallback(async () => {
    if (!companyId) return;
    setLoading(true);
    try {
      const [statusRes, bilanRes] = await Promise.all([
        fetch(`${API}/closing/status/${companyId}/${year}`),
        fetch(`${API}/closing/bilan/${companyId}/${year}`),
      ]);
      if (statusRes.ok) setClosureStatus(await statusRes.json());
      if (bilanRes.ok) setBilan(await bilanRes.json());
    } catch (err) {
      console.error("Erreur chargement clôture:", err);
    } finally {
      setLoading(false);
    }
  }, [companyId, year]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleClosure = async () => {
    if (!window.confirm(`Êtes-vous sûr de vouloir clôturer l'exercice ${year} ? Cette action est irréversible.`)) return;
    setClosing(true);
    try {
      const res = await fetch(`${API}/closing/execute`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyId, year }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.msg);
        await fetchData();
      } else {
        toast.error(data.error || "Erreur lors de la clôture");
      }
    } catch (err) {
      toast.error("Erreur réseau");
    } finally {
      setClosing(false);
    }
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Clôture & Bilan</h1>
      </div>

      <Card title="Processus de Clôture">
        <div className="form-group">
          <label htmlFor="closingYear">Exercice à clôturer</label>
          <select
            id="closingYear"
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
          >
            {years.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>

        {closureStatus?.closed && (
          <Alert type="info">
            ✅ Exercice {year} clôturé le{" "}
            {new Date(closureStatus.closedAt).toLocaleDateString("fr-FR")}.
            Résultat :{" "}
            {Number(closureStatus.result) >= 0
              ? `${Number(closureStatus.result).toLocaleString("fr-FR", { minimumFractionDigits: 2 })} € (bénéfice)`
              : `${Math.abs(Number(closureStatus.result)).toLocaleString("fr-FR", { minimumFractionDigits: 2 })} € (perte)`}
          </Alert>
        )}

        <Alert type="warning">
          ⚠️ La clôture est un processus irréversible. Assurez-vous que toutes
          les écritures sont validées.
        </Alert>

        <h3 className="card-title" style={{ marginTop: "1.5rem" }}>
          Checklist de Clôture
        </h3>

        <div className="checkbox-group">
          <input type="checkbox" id="close1" defaultChecked />
          <label htmlFor="close1">✅ Toutes les écritures sont saisies</label>
        </div>
        <div className="checkbox-group">
          <input type="checkbox" id="close2" />
          <label htmlFor="close2">Rapprochement bancaire effectué</label>
        </div>
        <div className="checkbox-group">
          <input type="checkbox" id="close3" />
          <label htmlFor="close3">Lettrage des comptes clients/fournisseurs</label>
        </div>
        <div className="checkbox-group">
          <input type="checkbox" id="close4" />
          <label htmlFor="close4">Inventaire des stocks réalisé</label>
        </div>
        <div className="checkbox-group">
          <input type="checkbox" id="close5" />
          <label htmlFor="close5">Amortissements calculés</label>
        </div>

        <button
          className="btn btn-warning btn-large btn-block"
          style={{ marginTop: "1.5rem" }}
          onClick={handleClosure}
          disabled={closing || closureStatus?.closed}
        >
          {closing
            ? "⏳ Clôture en cours..."
            : closureStatus?.closed
            ? "✅ Exercice déjà clôturé"
            : "⚖️ Procéder à la Clôture"}
        </button>
      </Card>

      {bilan && (
        <>
          <Card title="Compte de Résultat">
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", fontSize: "0.875rem" }}>
                <thead>
                  <tr>
                    <th>Compte</th>
                    <th style={{ textAlign: "right" }}>Montant</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td colSpan="2" style={{ fontWeight: 600, color: "var(--primary)", paddingTop: "0.75rem" }}>
                      CHARGES (Classe 6)
                    </td>
                  </tr>
                  {bilan.charges.map((c, i) => (
                    <tr key={i}>
                      <td>{c.account}</td>
                      <td style={{ textAlign: "right" }}>
                        {c.amount.toLocaleString("fr-FR", { minimumFractionDigits: 2 })} €
                      </td>
                    </tr>
                  ))}
                  <tr style={{ borderTop: "1px solid #ddd", fontWeight: 600 }}>
                    <td>Total charges</td>
                    <td style={{ textAlign: "right" }}>
                      {bilan.totalCharges.toLocaleString("fr-FR", { minimumFractionDigits: 2 })} €
                    </td>
                  </tr>
                  <tr>
                    <td colSpan="2" style={{ fontWeight: 600, color: "var(--primary)", paddingTop: "0.75rem" }}>
                      PRODUITS (Classe 7)
                    </td>
                  </tr>
                  {bilan.produits.map((p, i) => (
                    <tr key={i}>
                      <td>{p.account}</td>
                      <td style={{ textAlign: "right" }}>
                        {p.amount.toLocaleString("fr-FR", { minimumFractionDigits: 2 })} €
                      </td>
                    </tr>
                  ))}
                  <tr style={{ borderTop: "1px solid #ddd", fontWeight: 600 }}>
                    <td>Total produits</td>
                    <td style={{ textAlign: "right" }}>
                      {bilan.totalProduits.toLocaleString("fr-FR", { minimumFractionDigits: 2 })} €
                    </td>
                  </tr>
                  <tr style={{ borderTop: "2px solid var(--primary)", fontWeight: 700, fontSize: "1rem" }}>
                    <td>RÉSULTAT</td>
                    <td style={{ textAlign: "right" }}>
                      {bilan.resultat >= 0 ? "+" : ""}
                      {bilan.resultat.toLocaleString("fr-FR", { minimumFractionDigits: 2 })} €
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Card>

          <Card title="Bilan Comptable">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}>
              <div>
                <h3 style={{ fontSize: "1.1rem", fontWeight: 600, marginBottom: "1rem", color: "var(--primary)" }}>
                  ACTIF
                </h3>
                <table style={{ width: "100%", fontSize: "0.875rem" }}>
                  <tbody>
                    {bilan.actif.map((a, i) => (
                      <tr key={i}>
                        <td>{a.label}</td>
                        <td style={{ textAlign: "right", fontWeight: 600 }}>
                          {Number(a.amount).toLocaleString("fr-FR", { minimumFractionDigits: 2 })} €
                        </td>
                      </tr>
                    ))}
                    <tr style={{ borderTop: "2px solid var(--primary)", fontWeight: 700 }}>
                      <td>TOTAL ACTIF</td>
                      <td style={{ textAlign: "right" }}>
                        {bilan.totalActif.toLocaleString("fr-FR", { minimumFractionDigits: 2 })} €
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div>
                <h3 style={{ fontSize: "1.1rem", fontWeight: 600, marginBottom: "1rem", color: "var(--primary)" }}>
                  PASSIF
                </h3>
                <table style={{ width: "100%", fontSize: "0.875rem" }}>
                  <tbody>
                    {bilan.passif.map((p, i) => (
                      <tr key={i}>
                        <td>{p.label}</td>
                        <td style={{ textAlign: "right", fontWeight: 600 }}>
                          {Number(p.amount).toLocaleString("fr-FR", { minimumFractionDigits: 2 })} €
                        </td>
                      </tr>
                    ))}
                    <tr style={{ borderTop: "2px solid var(--primary)", fontWeight: 700 }}>
                      <td>TOTAL PASSIF</td>
                      <td style={{ textAlign: "right" }}>
                        {bilan.totalPassif.toLocaleString("fr-FR", { minimumFractionDigits: 2 })} €
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </Card>
        </>
      )}

      {!bilan && !loading && (
        <Card title="Aperçu du Bilan">
          <p style={{ color: "#666" }}>Aucune écriture trouvée pour l'exercice {year}. Le bilan sera affiché ici une fois les écritures saisies.</p>
        </Card>
      )}

      {loading && (
        <Card title="Chargement...">
          <p style={{ color: "#666" }}>Chargement des données de l'exercice {year}...</p>
        </Card>
      )}
    </>
  );
}
