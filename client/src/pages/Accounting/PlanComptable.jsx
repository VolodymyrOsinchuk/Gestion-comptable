import { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import Alert from "../../components/ui/Alert";

const API = import.meta.env.VITE_API_URL || "/api/v1";

const CLASS_LABELS = {
  1: "Capitaux",
  2: "Immobilisations",
  3: "Stocks",
  4: "Tiers",
  5: "Financiers",
  6: "Charges",
  7: "Produits",
  8: "Spéciaux",
};

const TYPE_LABELS = {
  asset: "Actif",
  liability: "Passif",
  equity: "Capitaux propres",
  revenue: "Produits",
  expense: "Charges",
  special: "Spéciaux",
};

const TYPE_VARIANTS = {
  asset: "info",
  liability: "warning",
  equity: "primary",
  revenue: "success",
  expense: "danger",
  special: "secondary",
};

export default function PlanComptable() {
  const { companyId } = useParams();
  const [accounts, setAccounts] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [classeFilter, setClasseFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [activeFilter, setActiveFilter] = useState("");

  const [page, setPage] = useState(1);
  const [pageSize] = useState(200);
  const [classes, setClasses] = useState([]);

  const [showModal, setShowModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [formData, setFormData] = useState({
    account_number: "",
    account_label: "",
    account_type: "expense",
    account_class: 6,
    is_active: true,
    can_reconcile: false,
    requires_third_party: false,
    tva_applicable: false,
    default_tva_rate: "",
    parent_account: "",
    notes: "",
  });

  const fetchClasses = useCallback(async () => {
    if (!companyId) return;
    try {
      const res = await fetch(`${API}/chart-of-accounts/${companyId}/classes`);
      if (res.ok) {
        const data = await res.json();
        setClasses(data.classes || []);
      }
    } catch {}
  }, [companyId]);

  const fetchAccounts = useCallback(async () => {
    if (!companyId) return;
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (classeFilter) params.set("class", classeFilter);
      if (typeFilter) params.set("type", typeFilter);
      if (activeFilter) params.set("active", activeFilter);
      params.set("page", page);
      params.set("pageSize", pageSize);

      const res = await fetch(`${API}/chart-of-accounts/${companyId}?${params}`);
      const data = await res.json();
      if (res.ok) {
        setAccounts(data.accounts || []);
        setTotal(data.total || 0);
      } else {
        toast.error(data.msg || "Erreur de chargement");
      }
    } catch (err) {
      toast.error("Erreur réseau");
    } finally {
      setLoading(false);
    }
  }, [companyId, search, classeFilter, typeFilter, activeFilter, page, pageSize]);

  useEffect(() => {
    fetchClasses();
  }, [fetchClasses]);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  const openCreateModal = () => {
    setEditingAccount(null);
    setFormData({
      account_number: "",
      account_label: "",
      account_type: "expense",
      account_class: 6,
      is_active: true,
      can_reconcile: false,
      requires_third_party: false,
      tva_applicable: false,
      default_tva_rate: "",
      parent_account: "",
      notes: "",
    });
    setShowModal(true);
  };

  const openEditModal = (account) => {
    setEditingAccount(account);
    setFormData({
      account_number: account.account_number,
      account_label: account.account_label,
      account_type: account.account_type,
      account_class: account.account_class,
      is_active: account.is_active,
      can_reconcile: account.can_reconcile,
      requires_third_party: account.requires_third_party,
      tva_applicable: account.tva_applicable,
      default_tva_rate: account.default_tva_rate || "",
      parent_account: account.parent_account || "",
      notes: account.notes || "",
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!companyId) return;

    const payload = {
      ...formData,
      account_class: Number(formData.account_class),
      default_tva_rate: formData.default_tva_rate ? Number(formData.default_tva_rate) : null,
      parent_account: formData.parent_account || null,
    };

    try {
      const url = editingAccount
        ? `${API}/chart-of-accounts/${companyId}/${editingAccount.id}`
        : `${API}/chart-of-accounts/${companyId}`;
      const method = editingAccount ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (res.ok) {
        toast.success(editingAccount ? "Compte mis à jour" : "Compte créé");
        setShowModal(false);
        fetchAccounts();
      } else {
        toast.error(data.msg || data.error || "Erreur");
      }
    } catch {
      toast.error("Erreur réseau");
    }
  };

  const handleToggle = async (account) => {
    if (!companyId) return;
    try {
      const res = await fetch(`${API}/chart-of-accounts/${companyId}/${account.id}/toggle`, { method: "PATCH" });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.msg);
        fetchAccounts();
      } else {
        toast.error(data.msg || "Erreur");
      }
    } catch {
      toast.error("Erreur réseau");
    }
  };

  const handleDelete = async (account) => {
    if (!window.confirm(`Supprimer le compte ${account.account_number} - ${account.account_label} ?`)) return;
    try {
      const res = await fetch(`${API}/chart-of-accounts/${companyId}/${account.id}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.msg);
        fetchAccounts();
      } else {
        toast.error(data.msg || "Erreur");
      }
    } catch {
      toast.error("Erreur réseau");
    }
  };

  const handleSeed = async () => {
    if (!window.confirm("Importer le Plan Comptable Général (PCG) ? Cette action créera les 158 comptes standards.")) return;
    try {
      const res = await fetch(`${API}/chart-of-accounts/${companyId}/seed`, { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.msg);
        fetchAccounts();
        fetchClasses();
      } else {
        toast.error(data.msg || "Erreur");
      }
    } catch {
      toast.error("Erreur réseau");
    }
  };

  const handleForceSeed = async () => {
    if (!window.confirm("RÉINITIALISER le plan comptable ? Tous les comptes personnalisés seront supprimés.")) return;
    try {
      const res = await fetch(`${API}/chart-of-accounts/${companyId}/seed/force`, { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.msg);
        fetchAccounts();
        fetchClasses();
      } else {
        toast.error(data.msg || "Erreur");
      }
    } catch {
      toast.error("Erreur réseau");
    }
  };

  const totalPages = Math.ceil(total / pageSize);

  return (
    <>
      <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1 className="page-title">Plan Comptable</h1>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button className="btn btn-success" onClick={handleSeed}>
            📥 Importer PCG
          </button>
          <button className="btn btn-danger" onClick={handleForceSeed}>
            🔄 Réinitialiser
          </button>
          <button className="btn btn-primary" onClick={openCreateModal}>
            + Nouveau compte
          </button>
        </div>
      </div>

      <Card title={`${total} comptes`}>
        <div className="form-grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))" }}>
          <div className="form-group">
            <label>Recherche</label>
            <input
              type="text"
              placeholder="Numéro ou libellé..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
          <div className="form-group">
            <label>Classe</label>
            <select value={classeFilter} onChange={(e) => { setClasseFilter(e.target.value); setPage(1); }}>
              <option value="">Toutes</option>
              {[1,2,3,4,5,6,7,8].map((c) => (
                <option key={c} value={c}>{c} - {CLASS_LABELS[c]}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Type</label>
            <select value={typeFilter} onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}>
              <option value="">Tous</option>
              {Object.entries(TYPE_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Statut</label>
            <select value={activeFilter} onChange={(e) => { setActiveFilter(e.target.value); setPage(1); }}>
              <option value="">Tous</option>
              <option value="true">Actifs</option>
              <option value="false">Inactifs</option>
            </select>
          </div>
        </div>

        {loading ? (
          <p style={{ color: "#666", padding: "1rem" }}>Chargement...</p>
        ) : accounts.length === 0 ? (
          <Alert type="info">
            Aucun compte trouvé.{" "}
            <button className="btn btn-sm btn-success" onClick={handleSeed} style={{ marginLeft: "0.5rem" }}>
              Importer le PCG
            </button>
          </Alert>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Classe</th>
                  <th>Compte</th>
                  <th>Libellé</th>
                  <th>Type</th>
                  <th>TVA</th>
                  <th>Lettrable</th>
                  <th>Statut</th>
                  <th style={{ textAlign: "center" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {accounts.map((account) => (
                  <tr key={account.id}>
                    <td>
                      <Badge variant="secondary">{account.account_class}</Badge>
                    </td>
                    <td style={{ fontFamily: "monospace", fontWeight: 600 }}>{account.account_number}</td>
                    <td>{account.account_label}</td>
                    <td>
                      <Badge variant={TYPE_VARIANTS[account.account_type] || "secondary"}>
                        {TYPE_LABELS[account.account_type] || account.account_type}
                      </Badge>
                    </td>
                    <td style={{ textAlign: "center" }}>
                      {account.tva_applicable ? (
                        <Badge variant="success">
                          {account.default_tva_rate ? `${account.default_tva_rate}%` : "Oui"}
                        </Badge>
                      ) : (
                        <span style={{ color: "#999" }}>—</span>
                      )}
                    </td>
                    <td style={{ textAlign: "center" }}>
                      {account.can_reconcile ? "✅" : "—"}
                    </td>
                    <td>
                      <Badge variant={account.is_active ? "success" : "danger"}>
                        {account.is_active ? "Actif" : "Inactif"}
                      </Badge>
                    </td>
                    <td style={{ textAlign: "center" }}>
                      <div style={{ display: "flex", gap: "0.25rem", justifyContent: "center" }}>
                        <button className="btn btn-sm btn-secondary" onClick={() => openEditModal(account)} title="Modifier">
                          ✏️
                        </button>
                        <button
                          className="btn btn-sm btn-secondary"
                          onClick={() => handleToggle(account)}
                          title={account.is_active ? "Désactiver" : "Activer"}
                        >
                          {account.is_active ? "🔴" : "🟢"}
                        </button>
                        <button className="btn btn-sm btn-danger" onClick={() => handleDelete(account)} title="Supprimer">
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div style={{ display: "flex", justifyContent: "center", gap: "0.5rem", marginTop: "1rem" }}>
            <button className="btn btn-sm btn-secondary" disabled={page <= 1} onClick={() => setPage(page - 1)}>
              ← Précédent
            </button>
            <span style={{ padding: "0.5rem" }}>Page {page} / {totalPages}</span>
            <button className="btn btn-sm btn-secondary" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
              Suivant →
            </button>
          </div>
        )}
      </Card>

      {showModal && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000,
        }}>
          <div style={{
            background: "#fff", borderRadius: "8px", padding: "2rem",
            maxWidth: "600px", width: "90%", maxHeight: "90vh", overflow: "auto",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <h2 style={{ fontSize: "1.5rem", fontWeight: 600 }}>
                {editingAccount ? "Modifier le compte" : "Nouveau compte"}
              </h2>
              <button onClick={() => setShowModal(false)} style={{ background: "none", border: "none", fontSize: "1.5rem", cursor: "pointer" }}>
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Numéro de compte *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: 411000"
                    value={formData.account_number}
                    onChange={(e) => setFormData({ ...formData, account_number: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Libellé *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Clients"
                    value={formData.account_label}
                    onChange={(e) => setFormData({ ...formData, account_label: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Classe *</label>
                  <select
                    value={formData.account_class}
                    onChange={(e) => setFormData({ ...formData, account_class: Number(e.target.value) })}
                  >
                    {[1,2,3,4,5,6,7,8].map((c) => (
                      <option key={c} value={c}>{c} - {CLASS_LABELS[c]}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Type *</label>
                  <select
                    value={formData.account_type}
                    onChange={(e) => setFormData({ ...formData, account_type: e.target.value })}
                  >
                    {Object.entries(TYPE_LABELS).map(([k, v]) => (
                      <option key={k} value={k}>{v}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Compte parent</label>
                  <input
                    type="text"
                    placeholder="Ex: 411"
                    value={formData.parent_account}
                    onChange={(e) => setFormData({ ...formData, parent_account: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Taux TVA par défaut</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Ex: 20.00"
                    value={formData.default_tva_rate}
                    onChange={(e) => setFormData({ ...formData, default_tva_rate: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-grid" style={{ gridTemplateColumns: "1fr 1fr 1fr", marginTop: "1rem" }}>
                <label className="checkbox-group">
                  <input
                    type="checkbox"
                    checked={formData.tva_applicable}
                    onChange={(e) => setFormData({ ...formData, tva_applicable: e.target.checked })}
                  />
                  TVA applicable
                </label>
                <label className="checkbox-group">
                  <input
                    type="checkbox"
                    checked={formData.can_reconcile}
                    onChange={(e) => setFormData({ ...formData, can_reconcile: e.target.checked })}
                  />
                  Lettrable
                </label>
                <label className="checkbox-group">
                  <input
                    type="checkbox"
                    checked={formData.requires_third_party}
                    onChange={(e) => setFormData({ ...formData, requires_third_party: e.target.checked })}
                  />
                  Tiers obligatoire
                </label>
              </div>

              <div className="form-group" style={{ marginTop: "1rem" }}>
                <label>Notes</label>
                <textarea
                  rows={3}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Notes internes..."
                />
              </div>

              <div style={{ display: "flex", gap: "0.5rem", marginTop: "1.5rem" }}>
                <button type="submit" className="btn btn-primary btn-large" style={{ flex: 1 }}>
                  {editingAccount ? "💾 Mettre à jour" : "✅ Créer le compte"}
                </button>
                <button type="button" className="btn btn-secondary btn-large" onClick={() => setShowModal(false)}>
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
