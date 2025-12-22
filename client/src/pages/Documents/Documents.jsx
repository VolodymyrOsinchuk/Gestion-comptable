import { useState } from "react";
import {
  useLoaderData,
  Form,
  useNavigation,
  useActionData,
  useParams,
} from "react-router-dom";
import Card from "../../components/ui/Card";
import StatCard from "../../components/ui/StatCard";
import Badge from "../../components/ui/Badge";

const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: "8px",
          padding: "2rem",
          maxWidth: "600px",
          width: "90%",
          maxHeight: "90vh",
          overflow: "auto",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "1.5rem",
          }}
        >
          <h2 style={{ fontSize: "1.5rem", fontWeight: "600" }}>{title}</h2>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              fontSize: "1.5rem",
              cursor: "pointer",
            }}
          >
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

export default function Documents() {
  const { documents = [], accountingEntries = [] } = useLoaderData();
  const navigation = useNavigation();
  const actionData = useActionData();
  const { companyId } = useParams();

  const [showModal, setShowModal] = useState(false);
  const [editingDoc, setEditingDoc] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

  const isSubmitting = navigation.state === "submitting";

  const totalAmount = documents.reduce(
    (sum, d) => sum + parseFloat(d.amount_ttc || 0),
    0
  );
  const validatedCount = documents.filter(
    (d) => d.status === "validated"
  ).length;
  const pendingCount = documents.filter((d) => d.status === "pending").length;

  const handleEdit = (doc) => {
    setEditingDoc(doc);
    setShowModal(true);
  };

  const handleNew = () => {
    setEditingDoc(null);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingDoc(null);
  };

  return (
    <>
      <div className="page-header">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h1 className="page-title">Documents & Écritures</h1>
          <button
            onClick={handleNew}
            className="btn btn-primary"
            style={{ padding: "0.75rem 1.5rem" }}
          >
            + Nouveau Document
          </button>
        </div>
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
                  <td>{new Date(doc.date).toLocaleDateString()}</td>
                  <td>{doc.type}</td>
                  <td>{doc.supplier || "-"}</td>
                  <td>{parseFloat(doc.amount_ttc).toFixed(2)} €</td>
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
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      <button
                        onClick={() => handleEdit(doc)}
                        className="btn btn-primary"
                        style={{ padding: "0.5rem 1rem", fontSize: "0.875rem" }}
                      >
                        Modifier
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirm(doc.id)}
                        className="btn"
                        style={{
                          padding: "0.5rem 1rem",
                          fontSize: "0.875rem",
                          background: "#ef4444",
                          color: "#fff",
                        }}
                      >
                        Supprimer
                      </button>
                    </div>
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
                  <td>{new Date(entry.date).toLocaleDateString()}</td>
                  <td>{entry.account}</td>
                  <td>{entry.label}</td>
                  <td>
                    {entry.debit > 0
                      ? `${parseFloat(entry.debit).toFixed(2)} €`
                      : "-"}
                  </td>
                  <td>
                    {entry.credit > 0
                      ? `${parseFloat(entry.credit).toFixed(2)} €`
                      : "-"}
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

      {/* Modal de création/modification */}
      <Modal
        isOpen={showModal}
        onClose={closeModal}
        title={editingDoc ? "Modifier le Document" : "Nouveau Document"}
      >
        <Form
          method="post"
          style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
        >
          <input
            type="hidden"
            name="intent"
            value={editingDoc ? "update" : "create"}
          />
          {editingDoc && (
            <input type="hidden" name="id" value={editingDoc.id} />
          )}

          <div>
            <label
              style={{
                display: "block",
                marginBottom: "0.5rem",
                fontWeight: "500",
              }}
            >
              Référence
            </label>
            <input
              type="text"
              name="reference"
              defaultValue={editingDoc?.reference}
              required
              style={{
                width: "100%",
                padding: "0.5rem",
                border: "1px solid #d1d5db",
                borderRadius: "4px",
              }}
            />
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "1rem",
            }}
          >
            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "0.5rem",
                  fontWeight: "500",
                }}
              >
                Date
              </label>
              <input
                type="date"
                name="date"
                defaultValue={editingDoc?.date}
                required
                style={{
                  width: "100%",
                  padding: "0.5rem",
                  border: "1px solid #d1d5db",
                  borderRadius: "4px",
                }}
              />
            </div>
            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "0.5rem",
                  fontWeight: "500",
                }}
              >
                Date d'échéance
              </label>
              <input
                type="date"
                name="due_date"
                defaultValue={editingDoc?.due_date}
                style={{
                  width: "100%",
                  padding: "0.5rem",
                  border: "1px solid #d1d5db",
                  borderRadius: "4px",
                }}
              />
            </div>
          </div>

          <div>
            <label
              style={{
                display: "block",
                marginBottom: "0.5rem",
                fontWeight: "500",
              }}
            >
              Type
            </label>
            <select
              name="type"
              defaultValue={editingDoc?.type || "invoice_supplier"}
              required
              style={{
                width: "100%",
                padding: "0.5rem",
                border: "1px solid #d1d5db",
                borderRadius: "4px",
              }}
            >
              <option value="invoice_customer">Facture de vente</option>
              <option value="invoice_supplier">Facture d'achat</option>
              <option value="credit_note">Avoir</option>
              <option value="receipt">Reçu</option>
              <option value="quote">Devis</option>
              <option value="order">Bon de commande</option>
              <option value="delivery">Bon de livraison</option>
              <option value="other">Autre</option>
            </select>
          </div>

          <div>
            <label
              style={{
                display: "block",
                marginBottom: "0.5rem",
                fontWeight: "500",
              }}
            >
              Fournisseur
            </label>
            <input
              type="text"
              name="supplier"
              defaultValue={editingDoc?.supplier}
              style={{
                width: "100%",
                padding: "0.5rem",
                border: "1px solid #d1d5db",
                borderRadius: "4px",
              }}
            />
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: "1rem",
            }}
          >
            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "0.5rem",
                  fontWeight: "500",
                }}
              >
                Montant HT
              </label>
              <input
                type="number"
                step="0.01"
                name="amount_ht"
                defaultValue={editingDoc?.amount_ht}
                required
                style={{
                  width: "100%",
                  padding: "0.5rem",
                  border: "1px solid #d1d5db",
                  borderRadius: "4px",
                }}
              />
            </div>
            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "0.5rem",
                  fontWeight: "500",
                }}
              >
                TVA
              </label>
              <input
                type="number"
                step="0.01"
                name="amount_tva"
                defaultValue={editingDoc?.amount_tva}
                required
                style={{
                  width: "100%",
                  padding: "0.5rem",
                  border: "1px solid #d1d5db",
                  borderRadius: "4px",
                }}
              />
            </div>
            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "0.5rem",
                  fontWeight: "500",
                }}
              >
                Montant TTC
              </label>
              <input
                type="number"
                step="0.01"
                name="amount_ttc"
                defaultValue={editingDoc?.amount_ttc}
                required
                style={{
                  width: "100%",
                  padding: "0.5rem",
                  border: "1px solid #d1d5db",
                  borderRadius: "4px",
                }}
              />
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "1rem",
            }}
          >
            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "0.5rem",
                  fontWeight: "500",
                }}
              >
                Mode de paiement
              </label>
              <select
                name="payment_method"
                defaultValue={editingDoc?.payment_method}
                style={{
                  width: "100%",
                  padding: "0.5rem",
                  border: "1px solid #d1d5db",
                  borderRadius: "4px",
                }}
              >
                <option value="">Sélectionner...</option>
                <option value="virement">Virement</option>
                <option value="prelevement">Prélèvement</option>
                <option value="cheque">Chèque</option>
                <option value="especes">Espèces</option>
                <option value="cb">Carte bancaire</option>
                <option value="autre">Autre</option>
              </select>
            </div>
            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "0.5rem",
                  fontWeight: "500",
                }}
              >
                Statut
              </label>
              <select
                name="status"
                defaultValue={editingDoc?.status || "pending"}
                style={{
                  width: "100%",
                  padding: "0.5rem",
                  border: "1px solid #d1d5db",
                  borderRadius: "4px",
                }}
              >
                <option value="draft">Brouillon</option>
                <option value="pending">En attente</option>
                <option value="validated">Validé</option>
                <option value="partially_paid">Partiellement payé</option>
                <option value="paid">Payé</option>
                <option value="cancelled">Annulé</option>
                <option value="overdue">En retard</option>
              </select>
            </div>
          </div>

          <div>
            <label
              style={{
                display: "block",
                marginBottom: "0.5rem",
                fontWeight: "500",
              }}
            >
              Notes
            </label>
            <textarea
              name="notes"
              defaultValue={editingDoc?.notes}
              rows="3"
              style={{
                width: "100%",
                padding: "0.5rem",
                border: "1px solid #d1d5db",
                borderRadius: "4px",
              }}
            />
          </div>

          <div
            style={{
              display: "flex",
              gap: "1rem",
              justifyContent: "flex-end",
              marginTop: "1rem",
            }}
          >
            <button
              type="button"
              onClick={closeModal}
              className="btn"
              style={{ background: "#6b7280" }}
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary"
            >
              {isSubmitting
                ? "Enregistrement..."
                : editingDoc
                ? "Mettre à jour"
                : "Créer"}
            </button>
          </div>
        </Form>
      </Modal>

      {/* Modal de confirmation de suppression */}
      <Modal
        isOpen={!!showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(null)}
        title="Confirmer la suppression"
      >
        <p style={{ marginBottom: "1.5rem" }}>
          Êtes-vous sûr de vouloir supprimer ce document ? Cette action est
          irréversible.
        </p>
        <Form method="post">
          <input type="hidden" name="intent" value="delete" />
          <input type="hidden" name="id" value={showDeleteConfirm} />
          <div
            style={{ display: "flex", gap: "1rem", justifyContent: "flex-end" }}
          >
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(null)}
              className="btn"
              style={{ background: "#6b7280" }}
            >
              Annuler
            </button>
            <button
              type="submit"
              className="btn"
              style={{ background: "#ef4444", color: "#fff" }}
            >
              Supprimer
            </button>
          </div>
        </Form>
      </Modal>
    </>
  );
}
