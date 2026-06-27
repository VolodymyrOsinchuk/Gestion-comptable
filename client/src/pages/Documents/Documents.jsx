import { useState } from "react";
import { useLoaderData, Form, useNavigation, useActionData, useParams } from "react-router-dom";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";

function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;
  return (
    <div
      style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
        display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000,
      }}
    >
      <div
        style={{
          background: "#fff", borderRadius: "8px", padding: "2rem",
          maxWidth: "600px", width: "90%", maxHeight: "90vh", overflow: "auto",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
          <h2 style={{ fontSize: "1.5rem", fontWeight: 600 }}>{title}</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: "1.5rem", cursor: "pointer" }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

const STATUS_VARIANTS = {
  pending: "warning",
  validated: "success",
  cancelled: "danger",
  brouillon: "secondary",
};
const STATUS_LABELS = {
  pending: "En attente",
  validated: "Validé",
  cancelled: "Annulé",
  brouillon: "Brouillon",
};
const TYPE_LABELS = {
  invoice: "Facture",
  credit_note: "Avoir",
  payment: "Paiement",
  expense: "Dépense",
  other: "Autre",
};

export default function Documents() {
  const { documents = [], accountingEntries = [], count = 0 } = useLoaderData() || {};
  const actionData = useActionData();
  const navigation = useNavigation();
  const { companyId } = useParams();
  const isSubmitting = navigation.state === "submitting";

  const [showCreate, setShowCreate] = useState(false);
  const [showEntries, setShowEntries] = useState(false);
  const [editId, setEditId] = useState(null);

  const stats = {
    total: documents.length,
    validated: documents.filter((d) => d.status === "validated").length,
    pending: documents.filter((d) => d.status === "pending").length,
    amount: documents.reduce((s, d) => s + (Number(d.amount_ttc) || 0), 0),
  };

  const defaultValues = (doc) => ({
    intent: editId ? "update" : "create",
    id: doc?.id || "",
    reference: doc?.reference || "",
    date: doc?.date || new Date().toISOString().split("T")[0],
    due_date: doc?.due_date || "",
    type: doc?.type || "invoice",
    supplier: doc?.supplier || "",
    amount_ht: doc?.amount_ht || "",
    amount_tva: doc?.amount_tva || "",
    amount_ttc: doc?.amount_ttc || "",
    payment_method: doc?.payment_method || "",
    status: doc?.status || "pending",
    notes: doc?.notes || "",
  });

  const handleEdit = (doc) => {
    setEditId(doc.id);
    setShowCreate(true);
  };

  const closeModal = () => {
    setShowCreate(false);
    setEditId(null);
  };

  return (
    <>
      <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1 className="page-title">Documents & Écritures</h1>
        <button className="btn btn-primary" onClick={() => { setEditId(null); setShowCreate(true); }}>
          + Nouveau document
        </button>
      </div>

      <div className="stats-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1rem", marginBottom: "1.5rem" }}>
        <Card>
          <div style={{ fontSize: "0.875rem", color: "#666" }}>Total documents</div>
          <div style={{ fontSize: "1.75rem", fontWeight: 700 }}>{stats.total}</div>
        </Card>
        <Card>
          <div style={{ fontSize: "0.875rem", color: "#666" }}>Validés</div>
          <div style={{ fontSize: "1.75rem", fontWeight: 700, color: "var(--success, #16a34a)" }}>{stats.validated}</div>
        </Card>
        <Card>
          <div style={{ fontSize: "0.875rem", color: "#666" }}>En attente</div>
          <div style={{ fontSize: "1.75rem", fontWeight: 700, color: "var(--warning, #d97706)" }}>{stats.pending}</div>
        </Card>
        <Card>
          <div style={{ fontSize: "0.875rem", color: "#666" }}>Montant TTC</div>
          <div style={{ fontSize: "1.75rem", fontWeight: 700 }}>{stats.amount.toLocaleString("fr-FR", { minimumFractionDigits: 2 })} €</div>
        </Card>
      </div>

      <Card title={`${count} documents trouvés`}>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Référence</th>
                <th>Date</th>
                <th>Type</th>
                <th>Fournisseur</th>
                <th>HT</th>
                <th>TVA</th>
                <th>TTC</th>
                <th>Statut</th>
                <th style={{ textAlign: "center" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {documents.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: "center", padding: "2rem", color: "#999" }}>
                    Aucun document. Créez-en un avec le bouton "+ Nouveau document".
                  </td>
                </tr>
              ) : (
                documents.map((doc) => (
                  <tr key={doc.id}>
                    <td style={{ fontWeight: 600 }}>{doc.reference || `DOC-${doc.id}`}</td>
                    <td>{doc.date ? new Date(doc.date).toLocaleDateString("fr-FR") : "—"}</td>
                    <td><Badge variant="secondary">{TYPE_LABELS[doc.type] || doc.type}</Badge></td>
                    <td>{doc.supplier || "—"}</td>
                    <td style={{ textAlign: "right" }}>{Number(doc.amount_ht || 0).toLocaleString("fr-FR", { minimumFractionDigits: 2 })}</td>
                    <td style={{ textAlign: "right" }}>{Number(doc.amount_tva || 0).toLocaleString("fr-FR", { minimumFractionDigits: 2 })}</td>
                    <td style={{ textAlign: "right", fontWeight: 600 }}>{Number(doc.amount_ttc || 0).toLocaleString("fr-FR", { minimumFractionDigits: 2 })}</td>
                    <td><Badge variant={STATUS_VARIANTS[doc.status] || "secondary"}>{STATUS_LABELS[doc.status] || doc.status}</Badge></td>
                    <td style={{ textAlign: "center" }}>
                      <div style={{ display: "flex", gap: "0.25rem", justifyContent: "center" }}>
                        <Form method="post" style={{ display: "inline" }}>
                          <input type="hidden" name="intent" value="updateStatus" />
                          <input type="hidden" name="id" value={doc.id} />
                          <input type="hidden" name="status" value={doc.status === "validated" ? "cancelled" : "validated"} />
                          <button className="btn btn-sm btn-secondary" title={doc.status === "validated" ? "Annuler" : "Valider"}>
                            {doc.status === "validated" ? "↩️" : "✅"}
                          </button>
                        </Form>
                        <button className="btn btn-sm btn-secondary" onClick={() => handleEdit(doc)} title="Modifier">✏️</button>
                        <Form method="post" style={{ display: "inline" }} onSubmit={(e) => { if (!window.confirm("Supprimer ce document ?")) e.preventDefault(); }}>
                          <input type="hidden" name="intent" value="delete" />
                          <input type="hidden" name="id" value={doc.id} />
                          <button className="btn btn-sm btn-danger" title="Supprimer">🗑️</button>
                        </Form>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Card title={`Écritures comptables (${accountingEntries.length} dernières)`}>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>N° pièce</th>
                <th>Date</th>
                <th>Compte</th>
                <th>Libellé</th>
                <th style={{ textAlign: "right" }}>Débit</th>
                <th style={{ textAlign: "right" }}>Crédit</th>
                <th>Statut</th>
              </tr>
            </thead>
            <tbody>
              {accountingEntries.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", padding: "2rem", color: "#999" }}>
                    Aucune écriture comptable. Validez un document pour générer ses écritures.
                  </td>
                </tr>
              ) : (
                accountingEntries.map((entry) => (
                  <tr key={entry.id}>
                    <td style={{ fontFamily: "monospace" }}>{entry.entry_number}</td>
                    <td>{entry.entry_date ? new Date(entry.entry_date).toLocaleDateString("fr-FR") : "—"}</td>
                    <td style={{ fontFamily: "monospace", fontWeight: 600 }}>{entry.account_number}</td>
                    <td>{entry.label}</td>
                    <td style={{ textAlign: "right" }}>{Number(entry.debit || 0).toFixed(2)}</td>
                    <td style={{ textAlign: "right" }}>{Number(entry.credit || 0).toFixed(2)}</td>
                    <td>
                      <Badge variant={entry.is_validated ? "success" : "secondary"}>
                        {entry.is_validated ? "Validée" : "Brouillon"}
                      </Badge>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal isOpen={showCreate} onClose={closeModal} title={editId ? "Modifier le document" : "Nouveau document"}>
        <Form method="post" onSubmit={() => setTimeout(closeModal, 100)}>
          <input type="hidden" name="intent" value={editId ? "update" : "create"} />
          {editId && <input type="hidden" name="id" value={editId} />}

          <div className="form-grid">
            <div className="form-group">
              <label>Référence *</label>
              <input type="text" name="reference" defaultValue={defaultValues().reference} required placeholder="FACT-2025-001" />
            </div>
            <div className="form-group">
              <label>Date *</label>
              <input type="date" name="date" defaultValue={defaultValues().date} required />
            </div>
            <div className="form-group">
              <label>Date échéance</label>
              <input type="date" name="due_date" defaultValue={defaultValues().due_date} />
            </div>
            <div className="form-group">
              <label>Type</label>
              <select name="type" defaultValue="invoice">
                <option value="invoice">Facture</option>
                <option value="credit_note">Avoir</option>
                <option value="payment">Paiement</option>
                <option value="expense">Dépense</option>
                <option value="other">Autre</option>
              </select>
            </div>
            <div className="form-group">
              <label>Fournisseur / Client</label>
              <input type="text" name="supplier" defaultValue={defaultValues().supplier} placeholder="Nom" />
            </div>
            <div className="form-group">
              <label>Mode de paiement</label>
              <select name="payment_method" defaultValue="">
                <option value="">—</option>
                <option value="cheque">Chèque</option>
                <option value="virement">Virement</option>
                <option value="especes">Espèces</option>
                <option value="cb">Carte bancaire</option>
                <option value="prelevement">Prélèvement</option>
              </select>
            </div>
            <div className="form-group">
              <label>Montant HT (€)</label>
              <input type="number" name="amount_ht" step="0.01" defaultValue={defaultValues().amount_ht} />
            </div>
            <div className="form-group">
              <label>Montant TVA (€)</label>
              <input type="number" name="amount_tva" step="0.01" defaultValue={defaultValues().amount_tva} />
            </div>
            <div className="form-group">
              <label>Montant TTC (€)</label>
              <input type="number" name="amount_ttc" step="0.01" defaultValue={defaultValues().amount_ttc} />
            </div>
            <div className="form-group">
              <label>Statut</label>
              <select name="status" defaultValue="pending">
                <option value="brouillon">Brouillon</option>
                <option value="pending">En attente</option>
                <option value="validated">Validé</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Notes</label>
            <textarea name="notes" rows={3} defaultValue={defaultValues().notes} placeholder="Notes..." />
          </div>

          {actionData?.error && (
            <div className="alert alert-danger" style={{ marginBottom: "1rem" }}>{actionData.error}</div>
          )}

          <div style={{ display: "flex", gap: "0.5rem", marginTop: "1.5rem" }}>
            <button type="submit" className="btn btn-primary btn-large" style={{ flex: 1 }} disabled={isSubmitting}>
              {isSubmitting ? "⏳ Enregistrement..." : editId ? "💾 Mettre à jour" : "✅ Créer le document"}
            </button>
            <button type="button" className="btn btn-secondary btn-large" onClick={closeModal}>Annuler</button>
          </div>
        </Form>
      </Modal>
    </>
  );
}
