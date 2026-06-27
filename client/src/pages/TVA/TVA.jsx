import { useState, useEffect, useCallback } from "react";
import { useLoaderData, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";

const API = import.meta.env.VITE_API_URL || "/api/v1";

const VAT_TYPE_LABELS = {
  collectee: "TVA collectée",
  deductible_abs: "TVA déductible (ABS)",
  deductible_immob: "TVA déductible immobilisations",
  importation: "TVA sur importations",
  intracommunautaire: "TVA intracommunautaire",
  autoliquidation: "TVA autoliquidation",
  regularisation: "Régularisations",
};

const STATUS_VARIANTS = {
  draft: "secondary",
  computed: "info",
  declared: "success",
  locked: "warning",
};
const STATUS_LABELS = {
  draft: "Brouillon",
  computed: "Calculé",
  declared: "Déclaré",
  locked: "Verrouillé",
};
const FREQ_LABELS = {
  monthly: "Mensuelle",
  quarterly: "Trimestrielle",
  yearly: "Annuelle",
};

export default function TVA() {
  const { declarations = [], status } = useLoaderData() || {};
  const { companyId } = useParams();
  const [declList, setDeclList] = useState(declarations);
  const [vatStatus, setVatStatus] = useState(status);
  const [loading, setLoading] = useState(false);
  const [selectedDecl, setSelectedDecl] = useState(null);
  const [expandedDecl, setExpandedDecl] = useState(null);

  const refresh = useCallback(async () => {
    if (!companyId) return;
    try {
      const [statusRes, declsRes] = await Promise.all([
        fetch(`${API}/tva/companies/${companyId}/status`),
        fetch(`${API}/tva/companies/${companyId}/declarations`),
      ]);
      if (statusRes.ok) setVatStatus(await statusRes.json());
      if (declsRes.ok) {
        const data = await declsRes.json();
        setDeclList(data.declarations || []);
      }
    } catch {}
  }, [companyId]);

  const handleGenerate = async () => {
    if (!companyId) return;
    setLoading(true);
    try {
      const res = await fetch(`${API}/tva/companies/${companyId}/declarations/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.msg);
        setSelectedDecl(data.declaration);
        await refresh();
      } else {
        toast.error(data.msg || data.error || "Erreur");
      }
    } catch {
      toast.error("Erreur réseau");
    } finally {
      setLoading(false);
    }
  };

  const handleRecompute = async () => {
    if (!companyId) return;
    setLoading(true);
    try {
      const res = await fetch(`${API}/tva/companies/${companyId}/declarations/recompute`, {
        method: "POST",
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.msg);
        await refresh();
      } else {
        toast.error(data.error || "Erreur");
      }
    } catch {
      toast.error("Erreur réseau");
    } finally {
      setLoading(false);
    }
  };

  const handleLock = async (id) => {
    try {
      const res = await fetch(`${API}/tva/declarations/${id}/lock`, { method: "PATCH" });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.msg);
        await refresh();
      } else {
        toast.error(data.error || "Erreur");
      }
    } catch {
      toast.error("Erreur réseau");
    }
  };

  const handleUnlock = async (id) => {
    if (!window.confirm("Déverrouiller cette période ? Les écritures pourront être modifiées.")) return;
    try {
      const res = await fetch(`${API}/tva/declarations/${id}/unlock`, { method: "PATCH" });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.msg);
        await refresh();
      } else {
        toast.error(data.error || "Erreur");
      }
    } catch {
      toast.error("Erreur réseau");
    }
  };

  const fetchDeclaration = async (id) => {
    try {
      const res = await fetch(`${API}/tva/declarations/${id}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedDecl(data.declaration);
      }
    } catch {}
  };

  const currentPeriod = vatStatus?.currentPeriod;
  const needsDeclaration = vatStatus?.pendingPeriod;
  const freq = vatStatus?.company?.tva_frequency || "monthly";

  return (
    <>
      <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1 className="page-title">Déclaration de TVA</h1>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button className="btn btn-secondary" onClick={handleRecompute} disabled={loading}>
            🔄 Recalculer tout
          </button>
          <button className="btn btn-primary" onClick={handleGenerate} disabled={loading}>
            {loading ? "⏳ Calcul..." : needsDeclaration ? "📊 Générer la déclaration" : "📊 Régénérer"}
          </button>
        </div>
      </div>

      {/* Status card */}
      <Card title="Statut TVA">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
          <div>
            <div style={{ fontSize: "0.8rem", color: "#666" }}>Régime</div>
            <div style={{ fontWeight: 600 }}>{vatStatus?.company?.tva_regime || "—"}</div>
          </div>
          <div>
            <div style={{ fontSize: "0.8rem", color: "#666" }}>Fréquence</div>
            <div style={{ fontWeight: 600 }}>{FREQ_LABELS[freq] || freq}</div>
          </div>
          <div>
            <div style={{ fontSize: "0.8rem", color: "#666" }}>Période en cours</div>
            <div style={{ fontWeight: 600 }}>{currentPeriod?.label || "—"}</div>
          </div>
          <div>
            <div style={{ fontSize: "0.8rem", color: "#666" }}>Statut période</div>
            <Badge variant={needsDeclaration ? "warning" : "success"}>
              {needsDeclaration ? "Déclaration en attente" : "Déjà déclarée"}
            </Badge>
          </div>
        </div>
      </Card>

      {/* Declaration list */}
      {selectedDecl && (
        <Card title={`Déclaration ${selectedDecl.period_label}`}
          subtitle={<Badge variant={STATUS_VARIANTS[selectedDecl.status]}>{STATUS_LABELS[selectedDecl.status]}</Badge>}
        >
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "1rem", marginBottom: "1rem" }}>
            <div>
              <div style={{ fontSize: "0.8rem", color: "#666" }}>TVA collectée</div>
              <div style={{ fontWeight: 700, fontSize: "1.2rem", color: "#1d4ed8" }}>
                {Number(selectedDecl.total_collectee).toLocaleString("fr-FR", { minimumFractionDigits: 2 })} €
              </div>
            </div>
            <div>
              <div style={{ fontSize: "0.8rem", color: "#666" }}>TVA déductible (ABS)</div>
              <div style={{ fontWeight: 600, color: "#16a34a" }}>
                {Number(selectedDecl.total_deductible_abs).toLocaleString("fr-FR", { minimumFractionDigits: 2 })} €
              </div>
            </div>
            <div>
              <div style={{ fontSize: "0.8rem", color: "#666" }}>TVA déductible (Immob.)</div>
              <div style={{ fontWeight: 600, color: "#16a34a" }}>
                {Number(selectedDecl.total_deductible_immob).toLocaleString("fr-FR", { minimumFractionDigits: 2 })} €
              </div>
            </div>
            <div>
              <div style={{ fontSize: "0.8rem", color: "#666" }}>Net dû</div>
              <div style={{ fontWeight: 700, fontSize: "1.2rem", color: Number(selectedDecl.net_due) >= 0 ? "#dc2626" : "#16a34a" }}>
                {Number(selectedDecl.net_due).toLocaleString("fr-FR", { minimumFractionDigits: 2 })} €
              </div>
            </div>
            <div>
              <div style={{ fontSize: "0.8rem", color: "#666" }}>Crédit TVA</div>
              <div style={{ fontWeight: 600 }}>
                {Number(selectedDecl.credit_tva || 0).toLocaleString("fr-FR", { minimumFractionDigits: 2 })} €
              </div>
            </div>
          </div>

          {selectedDecl.status !== "locked" ? (
            <button className="btn btn-warning" onClick={() => handleLock(selectedDecl.id)}>
              🔒 Verrouiller la période
            </button>
          ) : (
            <button className="btn btn-secondary" onClick={() => handleUnlock(selectedDecl.id)}>
              🔓 Déverrouiller
            </button>
          )}
        </Card>
      )}

      {/* Declarations history */}
      <Card title={`Historique des déclarations (${declList.length})`}>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Période</th>
                <th>Fréquence</th>
                <th>TVA collectée</th>
                <th>TVA déductible</th>
                <th>Net dû</th>
                <th>Crédit</th>
                <th>Statut</th>
                <th style={{ textAlign: "center" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {declList.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: "center", padding: "2rem", color: "#999" }}>
                    Aucune déclaration. Cliquez sur "Générer la déclaration" pour créer la première.
                  </td>
                </tr>
              ) : (
                declList.map((decl) => (
                  <tr key={decl.id} style={{ cursor: "pointer" }}
                    onClick={() => fetchDeclaration(decl.id)}
                  >
                    <td style={{ fontWeight: 600 }}>{decl.period_label}</td>
                    <td><Badge variant="secondary">{FREQ_LABELS[decl.frequency] || decl.frequency}</Badge></td>
                    <td style={{ textAlign: "right" }}>{Number(decl.total_collectee).toLocaleString("fr-FR", { minimumFractionDigits: 2 })}</td>
                    <td style={{ textAlign: "right" }}>{(Number(decl.total_deductible_abs) + Number(decl.total_deductible_immob)).toLocaleString("fr-FR", { minimumFractionDigits: 2 })}</td>
                    <td style={{ textAlign: "right", fontWeight: 600, color: Number(decl.net_due) >= 0 ? "#dc2626" : "#16a34a" }}>
                      {Number(decl.net_due).toLocaleString("fr-FR", { minimumFractionDigits: 2 })}
                    </td>
                    <td style={{ textAlign: "right" }}>{Number(decl.credit_tva || 0).toLocaleString("fr-FR", { minimumFractionDigits: 2 })}</td>
                    <td>
                      <Badge variant={STATUS_VARIANTS[decl.status]}>{STATUS_LABELS[decl.status]}</Badge>
                    </td>
                    <td style={{ textAlign: "center" }}>
                      <div style={{ display: "flex", gap: "0.25rem", justifyContent: "center" }}>
                        {decl.status !== "locked" ? (
                          <button className="btn btn-sm btn-warning" onClick={(e) => { e.stopPropagation(); handleLock(decl.id); }} title="Verrouiller">🔒</button>
                        ) : (
                          <button className="btn btn-sm btn-secondary" onClick={(e) => { e.stopPropagation(); handleUnlock(decl.id); }} title="Déverrouiller">🔓</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Declaration detail */}
      {selectedDecl && selectedDecl.lines && selectedDecl.lines.length > 0 && (
        <Card title={`Détail par écriture (${selectedDecl.lines.length} lignes TVA)`}>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Type TVA</th>
                  <th>Compte</th>
                  <th>Contrepartie</th>
                  <th>Base HT</th>
                  <th>Taux</th>
                  <th>TVA</th>
                  <th>TTC</th>
                  <th>N° pièce</th>
                  <th>Date</th>
                  <th>Libellé</th>
                </tr>
              </thead>
              <tbody>
                {selectedDecl.lines.map((line, i) => (
                  <tr key={line.id || i}>
                    <td><Badge variant="secondary">{VAT_TYPE_LABELS[line.vat_type] || line.vat_type}</Badge></td>
                    <td style={{ fontFamily: "monospace" }}>{line.account_number}</td>
                    <td style={{ fontFamily: "monospace" }}>{line.counter_account || "—"}</td>
                    <td style={{ textAlign: "right" }}>{Number(line.base_amount).toLocaleString("fr-FR", { minimumFractionDigits: 2 })}</td>
                    <td style={{ textAlign: "right" }}>{Number(line.tax_rate).toFixed(2)}%</td>
                    <td style={{ textAlign: "right", fontWeight: 600 }}>{Number(line.tax_amount).toLocaleString("fr-FR", { minimumFractionDigits: 2 })}</td>
                    <td style={{ textAlign: "right" }}>{Number(line.ttc_amount).toLocaleString("fr-FR", { minimumFractionDigits: 2 })}</td>
                    <td style={{ fontFamily: "monospace" }}>{line.entry_number || "—"}</td>
                    <td>{line.entry_date ? new Date(line.entry_date).toLocaleDateString("fr-FR") : "—"}</td>
                    <td style={{ maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis" }}>{line.label || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </>
  );
}
