// import { useState } from "react";
// import {
//   useLoaderData,
//   Form,
//   useNavigation,
//   useActionData,
//   useParams,
// } from "react-router-dom";
// import Card from "../../components/ui/Card";
// import StatCard from "../../components/ui/StatCard";
// import Badge from "../../components/ui/Badge";

// const Modal = ({ isOpen, onClose, title, children }) => {
//   if (!isOpen) return null;
//   return (
//     <div
//       style={{
//         position: "fixed",
//         inset: 0,
//         background: "rgba(0,0,0,0.5)",
//         display: "flex",
//         alignItems: "center",
//         justifyContent: "center",
//         zIndex: 1000,
//       }}
//     >
//       <div
//         style={{
//           background: "#fff",
//           borderRadius: "8px",
//           padding: "2rem",
//           maxWidth: "600px",
//           width: "90%",
//           maxHeight: "90vh",
//           overflow: "auto",
//         }}
//       >
//         <div
//           style={{
//             display: "flex",
//             justifyContent: "space-between",
//             alignItems: "center",
//             marginBottom: "1.5rem",
//           }}
//         >
//           <h2 style={{ fontSize: "1.5rem", fontWeight: "600" }}>{title}</h2>
//           <button
//             onClick={onClose}
//             style={{
//               background: "none",
//               border: "none",
//               fontSize: "1.5rem",
//               cursor: "pointer",
//             }}
//           >
//             ×
//           </button>
//         </div>
//         {children}
//       </div>
//     </div>
//   );
// };

// export default function Documents() {
//   const { data } = useLoaderData();
//   console.log("🚀 ~ Documents ~ data :", data);
//   // const loaderData = useLoaderData();
//   // console.log("🚀 ~ Documents ~ loaderData:", loaderData);
//   const navigation = useNavigation();
//   const actionData = useActionData();
//   const { companyId } = useParams();

//   const [showModal, setShowModal] = useState(false);
//   const [editingDoc, setEditingDoc] = useState(null);
//   const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

//   const isSubmitting = navigation.state === "submitting";

//   const totalAmount = data.reduce(
//     (sum, d) => sum + parseFloat(d.amount_ttc || 0),
//     0
//   );
//   const validatedCount = data.filter((d) => d.status === "validated").length;
//   const pendingCount = data.filter((d) => d.status === "pending").length;

//   const handleEdit = (doc) => {
//     setEditingDoc(doc);
//     setShowModal(true);
//   };

//   const handleNew = () => {
//     setEditingDoc(null);
//     setShowModal(true);
//   };

//   const closeModal = () => {
//     setShowModal(false);
//     setEditingDoc(null);
//   };

//   return (
//     <>
//       <div className="page-header">
//         <div
//           style={{
//             display: "flex",
//             justifyContent: "space-between",
//             alignItems: "center",
//           }}
//         >
//           <h1 className="page-title">Documents & Écritures</h1>
//           <button
//             onClick={handleNew}
//             className="btn btn-primary"
//             style={{ padding: "0.75rem 1.5rem" }}
//           >
//             + Nouveau Document
//           </button>
//         </div>
//       </div>

//       <div className="stats-grid">
//         <StatCard label="Documents Totaux" value={data.length} />
//         <StatCard label="Validés" value={validatedCount} variant="success" />
//         <StatCard label="En attente" value={pendingCount} variant="warning" />
//         <StatCard label="Montant Total" value={`${totalAmount.toFixed(2)} €`} />
//       </div>

//       <Card title="Liste des Documents">
//         <div className="table-container">
//           <table>
//             <thead>
//               <tr>
//                 <th>Référence</th>
//                 <th>Date</th>
//                 <th>Type</th>
//                 <th>Fournisseur</th>
//                 <th>Montant TTC</th>
//                 <th>Statut</th>
//                 <th>Actions</th>
//               </tr>
//             </thead>
//             <tbody>
//               {data.map((doc) => (
//                 <tr key={doc.id}>
//                   <td>{doc.reference}</td>
//                   <td>{new Date(doc.date).toLocaleDateString()}</td>
//                   <td>{doc.type}</td>
//                   <td>{doc.supplier || "-"}</td>
//                   <td>{parseFloat(doc.amount_ttc).toFixed(2)} €</td>
//                   <td>
//                     <Badge
//                       variant={
//                         doc.status === "validated" ? "success" : "warning"
//                       }
//                     >
//                       {doc.status}
//                     </Badge>
//                   </td>
//                   <td>
//                     <div style={{ display: "flex", gap: "0.5rem" }}>
//                       <button
//                         onClick={() => handleEdit(doc)}
//                         className="btn btn-primary"
//                         style={{ padding: "0.5rem 1rem", fontSize: "0.875rem" }}
//                       >
//                         Modifier
//                       </button>
//                       <button
//                         onClick={() => setShowDeleteConfirm(doc.id)}
//                         className="btn"
//                         style={{
//                           padding: "0.5rem 1rem",
//                           fontSize: "0.875rem",
//                           background: "#ef4444",
//                           color: "#fff",
//                         }}
//                       >
//                         Supprimer
//                       </button>
//                     </div>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       </Card>

//       {/* <Card title="Écritures Comptables Associées">
//         <div className="table-container">
//           <table>
//             <thead>
//               <tr>
//                 <th>Date</th>
//                 <th>Compte</th>
//                 <th>Libellé</th>
//                 <th>Débit</th>
//                 <th>Crédit</th>
//                 <th>Journal</th>
//               </tr>
//             </thead>
//             <tbody>
//               {accountingEntries.map((entry) => (
//                 <tr key={entry.id}>
//                   <td>{new Date(entry.date).toLocaleDateString()}</td>
//                   <td>{entry.account}</td>
//                   <td>{entry.label}</td>
//                   <td>
//                     {entry.debit > 0
//                       ? `${parseFloat(entry.debit).toFixed(2)} €`
//                       : "-"}
//                   </td>
//                   <td>
//                     {entry.credit > 0
//                       ? `${parseFloat(entry.credit).toFixed(2)} €`
//                       : "-"}
//                   </td>
//                   <td>
//                     <Badge variant="info">{entry.journal}</Badge>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       </Card> */}

//       {/* Modal de création/modification */}
//       <Modal
//         isOpen={showModal}
//         onClose={closeModal}
//         title={editingDoc ? "Modifier le Document" : "Nouveau Document"}
//       >
//         <Form
//           method="post"
//           style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
//         >
//           <input
//             type="hidden"
//             name="intent"
//             value={editingDoc ? "update" : "create"}
//           />
//           {editingDoc && (
//             <input type="hidden" name="id" value={editingDoc.id} />
//           )}

//           <div>
//             <label
//               style={{
//                 display: "block",
//                 marginBottom: "0.5rem",
//                 fontWeight: "500",
//               }}
//             >
//               Référence
//             </label>
//             <input
//               type="text"
//               name="reference"
//               defaultValue={editingDoc?.reference}
//               required
//               style={{
//                 width: "100%",
//                 padding: "0.5rem",
//                 border: "1px solid #d1d5db",
//                 borderRadius: "4px",
//               }}
//             />
//           </div>

//           <div
//             style={{
//               display: "grid",
//               gridTemplateColumns: "1fr 1fr",
//               gap: "1rem",
//             }}
//           >
//             <div>
//               <label
//                 style={{
//                   display: "block",
//                   marginBottom: "0.5rem",
//                   fontWeight: "500",
//                 }}
//               >
//                 Date
//               </label>
//               <input
//                 type="date"
//                 name="date"
//                 defaultValue={editingDoc?.date}
//                 required
//                 style={{
//                   width: "100%",
//                   padding: "0.5rem",
//                   border: "1px solid #d1d5db",
//                   borderRadius: "4px",
//                 }}
//               />
//             </div>
//             <div>
//               <label
//                 style={{
//                   display: "block",
//                   marginBottom: "0.5rem",
//                   fontWeight: "500",
//                 }}
//               >
//                 Date d'échéance
//               </label>
//               <input
//                 type="date"
//                 name="due_date"
//                 defaultValue={editingDoc?.due_date}
//                 style={{
//                   width: "100%",
//                   padding: "0.5rem",
//                   border: "1px solid #d1d5db",
//                   borderRadius: "4px",
//                 }}
//               />
//             </div>
//           </div>

//           <div>
//             <label
//               style={{
//                 display: "block",
//                 marginBottom: "0.5rem",
//                 fontWeight: "500",
//               }}
//             >
//               Type
//             </label>
//             <select
//               name="type"
//               defaultValue={editingDoc?.type || "invoice_supplier"}
//               required
//               style={{
//                 width: "100%",
//                 padding: "0.5rem",
//                 border: "1px solid #d1d5db",
//                 borderRadius: "4px",
//               }}
//             >
//               <option value="invoice_customer">Facture de vente</option>
//               <option value="invoice_supplier">Facture d'achat</option>
//               <option value="credit_note">Avoir</option>
//               <option value="receipt">Reçu</option>
//               <option value="quote">Devis</option>
//               <option value="order">Bon de commande</option>
//               <option value="delivery">Bon de livraison</option>
//               <option value="other">Autre</option>
//             </select>
//           </div>

//           <div>
//             <label
//               style={{
//                 display: "block",
//                 marginBottom: "0.5rem",
//                 fontWeight: "500",
//               }}
//             >
//               Fournisseur
//             </label>
//             <input
//               type="text"
//               name="supplier"
//               defaultValue={editingDoc?.supplier}
//               style={{
//                 width: "100%",
//                 padding: "0.5rem",
//                 border: "1px solid #d1d5db",
//                 borderRadius: "4px",
//               }}
//             />
//           </div>

//           <div
//             style={{
//               display: "grid",
//               gridTemplateColumns: "1fr 1fr 1fr",
//               gap: "1rem",
//             }}
//           >
//             <div>
//               <label
//                 style={{
//                   display: "block",
//                   marginBottom: "0.5rem",
//                   fontWeight: "500",
//                 }}
//               >
//                 Montant HT
//               </label>
//               <input
//                 type="number"
//                 step="0.01"
//                 name="amount_ht"
//                 defaultValue={editingDoc?.amount_ht}
//                 required
//                 style={{
//                   width: "100%",
//                   padding: "0.5rem",
//                   border: "1px solid #d1d5db",
//                   borderRadius: "4px",
//                 }}
//               />
//             </div>
//             <div>
//               <label
//                 style={{
//                   display: "block",
//                   marginBottom: "0.5rem",
//                   fontWeight: "500",
//                 }}
//               >
//                 TVA
//               </label>
//               <input
//                 type="number"
//                 step="0.01"
//                 name="amount_tva"
//                 defaultValue={editingDoc?.amount_tva}
//                 required
//                 style={{
//                   width: "100%",
//                   padding: "0.5rem",
//                   border: "1px solid #d1d5db",
//                   borderRadius: "4px",
//                 }}
//               />
//             </div>
//             <div>
//               <label
//                 style={{
//                   display: "block",
//                   marginBottom: "0.5rem",
//                   fontWeight: "500",
//                 }}
//               >
//                 Montant TTC
//               </label>
//               <input
//                 type="number"
//                 step="0.01"
//                 name="amount_ttc"
//                 defaultValue={editingDoc?.amount_ttc}
//                 required
//                 style={{
//                   width: "100%",
//                   padding: "0.5rem",
//                   border: "1px solid #d1d5db",
//                   borderRadius: "4px",
//                 }}
//               />
//             </div>
//           </div>

//           <div
//             style={{
//               display: "grid",
//               gridTemplateColumns: "1fr 1fr",
//               gap: "1rem",
//             }}
//           >
//             <div>
//               <label
//                 style={{
//                   display: "block",
//                   marginBottom: "0.5rem",
//                   fontWeight: "500",
//                 }}
//               >
//                 Mode de paiement
//               </label>
//               <select
//                 name="payment_method"
//                 defaultValue={editingDoc?.payment_method}
//                 style={{
//                   width: "100%",
//                   padding: "0.5rem",
//                   border: "1px solid #d1d5db",
//                   borderRadius: "4px",
//                 }}
//               >
//                 <option value="">Sélectionner...</option>
//                 <option value="virement">Virement</option>
//                 <option value="prelevement">Prélèvement</option>
//                 <option value="cheque">Chèque</option>
//                 <option value="especes">Espèces</option>
//                 <option value="cb">Carte bancaire</option>
//                 <option value="autre">Autre</option>
//               </select>
//             </div>
//             <div>
//               <label
//                 style={{
//                   display: "block",
//                   marginBottom: "0.5rem",
//                   fontWeight: "500",
//                 }}
//               >
//                 Statut
//               </label>
//               <select
//                 name="status"
//                 defaultValue={editingDoc?.status || "pending"}
//                 style={{
//                   width: "100%",
//                   padding: "0.5rem",
//                   border: "1px solid #d1d5db",
//                   borderRadius: "4px",
//                 }}
//               >
//                 <option value="draft">Brouillon</option>
//                 <option value="pending">En attente</option>
//                 <option value="validated">Validé</option>
//                 <option value="partially_paid">Partiellement payé</option>
//                 <option value="paid">Payé</option>
//                 <option value="cancelled">Annulé</option>
//                 <option value="overdue">En retard</option>
//               </select>
//             </div>
//           </div>

//           <div>
//             <label
//               style={{
//                 display: "block",
//                 marginBottom: "0.5rem",
//                 fontWeight: "500",
//               }}
//             >
//               Notes
//             </label>
//             <textarea
//               name="notes"
//               defaultValue={editingDoc?.notes}
//               rows="3"
//               style={{
//                 width: "100%",
//                 padding: "0.5rem",
//                 border: "1px solid #d1d5db",
//                 borderRadius: "4px",
//               }}
//             />
//           </div>

//           <div
//             style={{
//               display: "flex",
//               gap: "1rem",
//               justifyContent: "flex-end",
//               marginTop: "1rem",
//             }}
//           >
//             <button
//               type="button"
//               onClick={closeModal}
//               className="btn"
//               style={{ background: "#6b7280" }}
//             >
//               Annuler
//             </button>
//             <button
//               type="submit"
//               disabled={isSubmitting}
//               className="btn btn-primary"
//             >
//               {isSubmitting
//                 ? "Enregistrement..."
//                 : editingDoc
//                 ? "Mettre à jour"
//                 : "Créer"}
//             </button>
//           </div>
//         </Form>
//       </Modal>

//       {/* Modal de confirmation de suppression */}
//       <Modal
//         isOpen={!!showDeleteConfirm}
//         onClose={() => setShowDeleteConfirm(null)}
//         title="Confirmer la suppression"
//       >
//         <p style={{ marginBottom: "1.5rem" }}>
//           Êtes-vous sûr de vouloir supprimer ce document ? Cette action est
//           irréversible.
//         </p>
//         <Form method="post">
//           <input type="hidden" name="intent" value="delete" />
//           <input type="hidden" name="id" value={showDeleteConfirm} />
//           <div
//             style={{ display: "flex", gap: "1rem", justifyContent: "flex-end" }}
//           >
//             <button
//               type="button"
//               onClick={() => setShowDeleteConfirm(null)}
//               className="btn"
//               style={{ background: "#6b7280" }}
//             >
//               Annuler
//             </button>
//             <button
//               type="submit"
//               className="btn"
//               style={{ background: "#ef4444", color: "#fff" }}
//             >
//               Supprimer
//             </button>
//           </div>
//         </Form>
//       </Modal>
//     </>
//   );
// }
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";

// Plan Comptable Général 2025 (extrait simplifié)
const PCG_2025 = {
  // Classe 1 - Comptes de capitaux
  101000: "Capital",
  106000: "Réserves",
  110000: "Report à nouveau",
  120000: "Résultat de l'exercice",
  164000: "Emprunts auprès des établissements de crédit",

  // Classe 2 - Comptes d'immobilisations
  205000: "Concessions et droits similaires",
  211000: "Terrains",
  213000: "Constructions",
  218000: "Autres immobilisations corporelles",
  280000: "Amortissements des immobilisations",

  // Classe 4 - Comptes de tiers
  401000: "Fournisseurs",
  404000: "Fournisseurs d'immobilisations",
  408000: "Fournisseurs - Factures non parvenues",
  411000: "Clients",
  416000: "Clients douteux",
  419000: "Clients créditeurs",
  421000: "Personnel - Rémunérations dues",
  428000: "Personnel - Charges à payer",
  431000: "Sécurité sociale",
  437000: "Autres organismes sociaux",
  445100: "TVA à décaisser",
  445200: "TVA déductible sur immobilisations",
  445620: "TVA déductible sur autres biens et services",
  445660: "TVA déductible (autre)",
  445710: "TVA collectée",
  451000: "Groupe",
  455000: "Associés - Comptes courants",

  // Classe 5 - Comptes financiers
  512000: "Banques",
  530000: "Caisse",

  // Classe 6 - Comptes de charges
  601000: "Achats stockés - Matières premières",
  606000: "Achats non stockés de matières et fournitures",
  607000: "Achats de marchandises",
  611000: "Sous-traitance générale",
  613000: "Locations",
  615000: "Entretien et réparations",
  616000: "Primes d'assurances",
  622600: "Honoraires",
  625000: "Déplacements, missions et réceptions",
  626000: "Frais postaux et de télécommunications",
  627000: "Services bancaires et assimilés",
  641000: "Rémunérations du personnel",
  645000: "Charges de sécurité sociale",
  661000: "Charges d'intérêts",
  681000: "Dotations aux amortissements",

  // Classe 7 - Comptes de produits
  701000: "Ventes de produits finis",
  706000: "Prestations de services",
  707000: "Ventes de marchandises",
  708000: "Produits des activités annexes",
  771000: "Produits exceptionnels sur opérations de gestion",
  775000: "Produits des cessions d'éléments d'actif",
};

const JOURNALS = [
  { code: "ACH", label: "Achats" },
  { code: "VEN", label: "Ventes" },
  { code: "BQ", label: "Banque" },
  { code: "CAIS", label: "Caisse" },
  { code: "OD", label: "Opérations Diverses" },
];

const MONTHS = [
  { value: "janv.24", label: "Janvier 2024" },
  { value: "févr.24", label: "Février 2024" },
  { value: "mars.24", label: "Mars 2024" },
  { value: "avr.24", label: "Avril 2024" },
  { value: "mai.24", label: "Mai 2024" },
  { value: "juin.24", label: "Juin 2024" },
  { value: "juil.24", label: "Juillet 2024" },
  { value: "août.24", label: "Août 2024" },
  { value: "sept.24", label: "Septembre 2024" },
  { value: "oct.24", label: "Octobre 2024" },
  { value: "nov.24", label: "Novembre 2024" },
  { value: "déc.24", label: "Décembre 2024" },
];

export default function JournalComptable() {
  const [showPeriodModal, setShowPeriodModal] = useState(true);
  const [selectedJournal, setSelectedJournal] = useState("");
  const [selectedPeriod, setSelectedPeriod] = useState("");
  const [entries, setEntries] = useState([]);
  const [currentEntry, setCurrentEntry] = useState({
    jour: "",
    numPiece: "",
    numFacture: "",
    compteGeneral: "",
    compteTiers: "",
    codeTaxe: "",
    libelleEcriture: "",
    modeReglement: "",
    dateEcheance: "",
    debit: "",
    credit: "",
    reference: "",
  });
  const [searchAccount, setSearchAccount] = useState("");
  const [filteredAccounts, setFilteredAccounts] = useState([]);
  const [showAccountSuggestions, setShowAccountSuggestions] = useState(false);

  useEffect(() => {
    if (searchAccount.length >= 2) {
      const filtered = Object.entries(PCG_2025)
        .filter(
          ([code, label]) =>
            code.includes(searchAccount) ||
            label.toLowerCase().includes(searchAccount.toLowerCase())
        )
        .slice(0, 10);
      setFilteredAccounts(filtered);
      setShowAccountSuggestions(true);
    } else {
      setFilteredAccounts([]);
      setShowAccountSuggestions(false);
    }
  }, [searchAccount]);

  const handlePeriodSubmit = () => {
    if (!selectedJournal || !selectedPeriod) {
      toast.error("Veuillez sélectionner un code journal et une période");
      return;
    }
    setShowPeriodModal(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentEntry((prev) => ({ ...prev, [name]: value }));

    if (name === "compteGeneral") {
      setSearchAccount(value);
    }
  };

  const selectAccount = (code, label) => {
    setCurrentEntry((prev) => ({ ...prev, compteGeneral: code }));
    setSearchAccount("");
    setShowAccountSuggestions(false);
  };

  const addEntry = () => {
    if (
      !currentEntry.compteGeneral ||
      (!currentEntry.debit && !currentEntry.credit)
    ) {
      toast.error(
        "Compte général et montant (débit ou crédit) sont obligatoires"
      );
      return;
    }

    setEntries([...entries, { ...currentEntry, id: Date.now() }]);
    setCurrentEntry({
      jour: "",
      numPiece: "",
      numFacture: "",
      compteGeneral: "",
      compteTiers: "",
      codeTaxe: "",
      libelleEcriture: "",
      modeReglement: "",
      dateEcheance: "",
      debit: "",
      credit: "",
      reference: "",
    });
  };

  const deleteEntry = (id) => {
    setEntries(entries.filter((entry) => entry.id !== id));
  };

  const calculateTotals = () => {
    const totalDebit = entries.reduce(
      (sum, entry) => sum + (parseFloat(entry.debit) || 0),
      0
    );
    const totalCredit = entries.reduce(
      (sum, entry) => sum + (parseFloat(entry.credit) || 0),
      0
    );
    const solde = totalCredit - totalDebit;
    return { totalDebit, totalCredit, solde };
  };

  const saveJournal = () => {
    const { totalDebit, totalCredit } = calculateTotals();
    if (Math.abs(totalDebit - totalCredit) > 0.01) {
      toast.error(
        "Le journal n'est pas équilibré ! Débit et Crédit doivent être égaux."
      );
      return;
    }
    toast.success("Journal enregistré avec succès !");
  };

  const totals = calculateTotals();

  return (
    <div
      style={{
        fontFamily: "Arial, sans-serif",
        padding: "20px",
        maxWidth: "1600px",
        margin: "0 auto",
        background: "#f5f5f5",
      }}
    >
      {/* Modal de sélection période */}
      {showPeriodModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              background: "white",
              padding: "20px",
              borderRadius: "8px",
              width: "400px",
              boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                marginBottom: "20px",
                color: "#4CAF50",
                fontSize: "16px",
                fontWeight: "bold",
              }}
            >
              <span>📖</span>
              <span>Ouvrir un journal/période</span>
              <button
                onClick={() => setShowPeriodModal(false)}
                style={{
                  marginLeft: "auto",
                  background: "none",
                  border: "none",
                  fontSize: "20px",
                  cursor: "pointer",
                  color: "#666",
                }}
              >
                ×
              </button>
            </div>

            <div style={{ marginBottom: "15px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "5px",
                  fontSize: "14px",
                }}
              >
                Code
              </label>
              <select
                value={selectedJournal}
                onChange={(e) => setSelectedJournal(e.target.value)}
                style={{
                  width: "100%",
                  padding: "8px",
                  borderRadius: "4px",
                  border: "1px solid #ccc",
                  fontSize: "14px",
                }}
              >
                <option value="">Sélectionner...</option>
                {JOURNALS.map((journal) => (
                  <option key={journal.code} value={journal.code}>
                    {journal.code} - {journal.label}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "5px",
                  fontSize: "14px",
                }}
              >
                Période
              </label>
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                style={{
                  width: "100%",
                  padding: "8px",
                  borderRadius: "4px",
                  border: "1px solid #ccc",
                  fontSize: "14px",
                }}
              >
                <option value="">Sélectionner...</option>
                {MONTHS.map((month) => (
                  <option key={month.value} value={month.value}>
                    {month.label}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: "flex", gap: "10px" }}>
              <button
                onClick={handlePeriodSubmit}
                style={{
                  flex: 1,
                  padding: "10px",
                  background: "#4CAF50",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontWeight: "bold",
                }}
              >
                OK
              </button>
              <button
                onClick={() => setShowPeriodModal(false)}
                style={{
                  flex: 1,
                  padding: "10px",
                  background: "#f5f5f5",
                  border: "1px solid #ccc",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {/* En-tête */}
      <div
        style={{
          background: "white",
          padding: "15px",
          marginBottom: "10px",
          borderRadius: "4px",
          display: "flex",
          alignItems: "center",
          gap: "15px",
        }}
      >
        <span style={{ fontWeight: "bold" }}>
          Journal: {selectedJournal || "—"}
        </span>
        <span>•</span>
        <span style={{ fontWeight: "bold" }}>
          Période: {selectedPeriod || "—"}
        </span>
        <button
          onClick={() => setShowPeriodModal(true)}
          style={{
            marginLeft: "auto",
            padding: "8px 16px",
            background: "#2196F3",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Changer période
        </button>
      </div>

      {/* Formulaire de saisie */}
      <div
        style={{
          background: "white",
          padding: "15px",
          marginBottom: "10px",
          borderRadius: "4px",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
            gap: "10px",
            marginBottom: "10px",
          }}
        >
          <div>
            <label
              style={{
                fontSize: "12px",
                color: "#666",
                display: "block",
                marginBottom: "4px",
              }}
            >
              N° pièce
            </label>
            <input
              type="text"
              name="numPiece"
              value={currentEntry.numPiece}
              onChange={handleInputChange}
              style={{
                width: "100%",
                padding: "6px",
                border: "1px solid #ccc",
                borderRadius: "3px",
              }}
            />
          </div>

          <div>
            <label
              style={{
                fontSize: "12px",
                color: "#666",
                display: "block",
                marginBottom: "4px",
              }}
            >
              N° facture
            </label>
            <input
              type="text"
              name="numFacture"
              value={currentEntry.numFacture}
              onChange={handleInputChange}
              style={{
                width: "100%",
                padding: "6px",
                border: "1px solid #ccc",
                borderRadius: "3px",
              }}
            />
          </div>

          <div style={{ position: "relative" }}>
            <label
              style={{
                fontSize: "12px",
                color: "#666",
                display: "block",
                marginBottom: "4px",
              }}
            >
              N° compte général *
            </label>
            <input
              type="text"
              name="compteGeneral"
              value={currentEntry.compteGeneral}
              onChange={handleInputChange}
              placeholder="Rechercher..."
              style={{
                width: "100%",
                padding: "6px",
                border: "1px solid #ccc",
                borderRadius: "3px",
              }}
            />
            {showAccountSuggestions && filteredAccounts.length > 0 && (
              <div
                style={{
                  position: "absolute",
                  top: "100%",
                  left: 0,
                  right: 0,
                  background: "white",
                  border: "1px solid #ccc",
                  borderRadius: "3px",
                  maxHeight: "200px",
                  overflowY: "auto",
                  zIndex: 100,
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                }}
              >
                {filteredAccounts.map(([code, label]) => (
                  <div
                    key={code}
                    onClick={() => selectAccount(code, label)}
                    style={{
                      padding: "8px",
                      cursor: "pointer",
                      borderBottom: "1px solid #eee",
                      fontSize: "13px",
                    }}
                    onMouseEnter={(e) =>
                      (e.target.style.background = "#f5f5f5")
                    }
                    onMouseLeave={(e) => (e.target.style.background = "white")}
                  >
                    <strong>{code}</strong> - {label}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <label
              style={{
                fontSize: "12px",
                color: "#666",
                display: "block",
                marginBottom: "4px",
              }}
            >
              N° compte tiers
            </label>
            <input
              type="text"
              name="compteTiers"
              value={currentEntry.compteTiers}
              onChange={handleInputChange}
              style={{
                width: "100%",
                padding: "6px",
                border: "1px solid #ccc",
                borderRadius: "3px",
              }}
            />
          </div>

          <div>
            <label
              style={{
                fontSize: "12px",
                color: "#666",
                display: "block",
                marginBottom: "4px",
              }}
            >
              Code taxe
            </label>
            <select
              name="codeTaxe"
              value={currentEntry.codeTaxe}
              onChange={handleInputChange}
              style={{
                width: "100%",
                padding: "6px",
                border: "1px solid #ccc",
                borderRadius: "3px",
              }}
            >
              <option value="">Aucun</option>
              <option value="TVA20">TVA 20%</option>
              <option value="TVA10">TVA 10%</option>
              <option value="TVA5.5">TVA 5.5%</option>
              <option value="TVA2.1">TVA 2.1%</option>
            </select>
          </div>

          <div style={{ gridColumn: "span 2" }}>
            <label
              style={{
                fontSize: "12px",
                color: "#666",
                display: "block",
                marginBottom: "4px",
              }}
            >
              Libellé écriture
            </label>
            <input
              type="text"
              name="libelleEcriture"
              value={currentEntry.libelleEcriture}
              onChange={handleInputChange}
              style={{
                width: "100%",
                padding: "6px",
                border: "1px solid #ccc",
                borderRadius: "3px",
              }}
            />
          </div>

          <div>
            <label
              style={{
                fontSize: "12px",
                color: "#666",
                display: "block",
                marginBottom: "4px",
              }}
            >
              Date éch.
            </label>
            <input
              type="date"
              name="dateEcheance"
              value={currentEntry.dateEcheance}
              onChange={handleInputChange}
              style={{
                width: "100%",
                padding: "6px",
                border: "1px solid #ccc",
                borderRadius: "3px",
              }}
            />
          </div>

          <div>
            <label
              style={{
                fontSize: "12px",
                color: "#666",
                display: "block",
                marginBottom: "4px",
              }}
            >
              Débit *
            </label>
            <input
              type="number"
              name="debit"
              value={currentEntry.debit}
              onChange={handleInputChange}
              step="0.01"
              style={{
                width: "100%",
                padding: "6px",
                border: "1px solid #ccc",
                borderRadius: "3px",
                background: "#e8f5e9",
              }}
            />
          </div>

          <div>
            <label
              style={{
                fontSize: "12px",
                color: "#666",
                display: "block",
                marginBottom: "4px",
              }}
            >
              Crédit *
            </label>
            <input
              type="number"
              name="credit"
              value={currentEntry.credit}
              onChange={handleInputChange}
              step="0.01"
              style={{
                width: "100%",
                padding: "6px",
                border: "1px solid #ccc",
                borderRadius: "3px",
                background: "#e8f5e9",
              }}
            />
          </div>

          <div>
            <label
              style={{
                fontSize: "12px",
                color: "#666",
                display: "block",
                marginBottom: "4px",
              }}
            >
              Référence
            </label>
            <input
              type="text"
              name="reference"
              value={currentEntry.reference}
              onChange={handleInputChange}
              style={{
                width: "100%",
                padding: "6px",
                border: "1px solid #ccc",
                borderRadius: "3px",
              }}
            />
          </div>
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <button
            onClick={addEntry}
            style={{
              padding: "10px 20px",
              background: "#4CAF50",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            ➕ Ajouter
          </button>
          <button
            onClick={() =>
              setCurrentEntry({
                jour: "",
                numPiece: "",
                numFacture: "",
                compteGeneral: "",
                compteTiers: "",
                codeTaxe: "",
                libelleEcriture: "",
                modeReglement: "",
                dateEcheance: "",
                debit: "",
                credit: "",
                reference: "",
              })
            }
            style={{
              padding: "10px 20px",
              background: "#f5f5f5",
              border: "1px solid #ccc",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            🗑️ Effacer
          </button>
        </div>
      </div>

      {/* Tableau des écritures */}
      <div
        style={{
          background: "white",
          borderRadius: "4px",
          overflow: "hidden",
          marginBottom: "10px",
        }}
      >
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: "13px",
          }}
        >
          <thead>
            <tr style={{ background: "#424242", color: "white" }}>
              <th style={{ padding: "10px", textAlign: "left" }}>Jour</th>
              <th style={{ padding: "10px", textAlign: "left" }}>N° pièce</th>
              <th style={{ padding: "10px", textAlign: "left" }}>N° facture</th>
              <th style={{ padding: "10px", textAlign: "left" }}>
                N° compte général
              </th>
              <th style={{ padding: "10px", textAlign: "left" }}>
                N° compte tiers
              </th>
              <th style={{ padding: "10px", textAlign: "left" }}>Code taxe</th>
              <th style={{ padding: "10px", textAlign: "left" }}>
                Libellé écriture
              </th>
              <th style={{ padding: "10px", textAlign: "left" }}>Mode règl.</th>
              <th style={{ padding: "10px", textAlign: "left" }}>
                Date échéance
              </th>
              <th
                style={{
                  padding: "10px",
                  textAlign: "right",
                  background: "#c8e6c9",
                }}
              >
                Débit
              </th>
              <th
                style={{
                  padding: "10px",
                  textAlign: "right",
                  background: "#c8e6c9",
                }}
              >
                Crédit
              </th>
              <th style={{ padding: "10px", textAlign: "left" }}>Référence</th>
              <th style={{ padding: "10px" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {entries.length === 0 ? (
              <tr>
                <td
                  colSpan="13"
                  style={{
                    padding: "40px",
                    textAlign: "center",
                    color: "#999",
                  }}
                >
                  Aucune écriture. Ajoutez-en une avec le formulaire ci-dessus.
                </td>
              </tr>
            ) : (
              entries.map((entry) => (
                <tr key={entry.id} style={{ borderBottom: "1px solid #eee" }}>
                  <td style={{ padding: "8px" }}>{entry.jour}</td>
                  <td style={{ padding: "8px" }}>{entry.numPiece}</td>
                  <td style={{ padding: "8px" }}>{entry.numFacture}</td>
                  <td style={{ padding: "8px" }}>
                    <strong>{entry.compteGeneral}</strong>
                    <div style={{ fontSize: "11px", color: "#666" }}>
                      {PCG_2025[entry.compteGeneral]}
                    </div>
                  </td>
                  <td style={{ padding: "8px" }}>{entry.compteTiers}</td>
                  <td style={{ padding: "8px" }}>{entry.codeTaxe}</td>
                  <td style={{ padding: "8px" }}>{entry.libelleEcriture}</td>
                  <td style={{ padding: "8px" }}>{entry.modeReglement}</td>
                  <td style={{ padding: "8px" }}>{entry.dateEcheance}</td>
                  <td
                    style={{
                      padding: "8px",
                      textAlign: "right",
                      background: "#f1f8e9",
                    }}
                  >
                    {entry.debit ? parseFloat(entry.debit).toFixed(2) : ""}
                  </td>
                  <td
                    style={{
                      padding: "8px",
                      textAlign: "right",
                      background: "#f1f8e9",
                    }}
                  >
                    {entry.credit ? parseFloat(entry.credit).toFixed(2) : ""}
                  </td>
                  <td style={{ padding: "8px" }}>{entry.reference}</td>
                  <td style={{ padding: "8px", textAlign: "center" }}>
                    <button
                      onClick={() => deleteEntry(entry.id)}
                      style={{
                        padding: "4px 8px",
                        background: "#f44336",
                        color: "white",
                        border: "none",
                        borderRadius: "3px",
                        cursor: "pointer",
                        fontSize: "12px",
                      }}
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Totaux */}
      <div
        style={{
          background: "white",
          padding: "15px",
          borderRadius: "4px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", gap: "30px", fontSize: "14px" }}>
          <div>
            <span style={{ color: "#666" }}>Compte : </span>
            <strong>{entries.length} écritures</strong>
          </div>
          <div>
            <span style={{ color: "#666" }}>Totaux journal : </span>
          </div>
          <div>
            <span style={{ color: "#666" }}>Solde à équilibrer : </span>
            <strong
              style={{
                color: Math.abs(totals.solde) < 0.01 ? "#4CAF50" : "#f44336",
                fontSize: "16px",
              }}
            >
              {totals.solde.toFixed(2)} €
            </strong>
          </div>
        </div>

        <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
          <div
            style={{
              padding: "10px 20px",
              background: "#e8f5e9",
              borderRadius: "4px",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: "12px", color: "#666" }}>Débit</div>
            <div
              style={{ fontSize: "18px", fontWeight: "bold", color: "#2e7d32" }}
            >
              {totals.totalDebit.toFixed(2)} €
            </div>
          </div>

          <div
            style={{
              padding: "10px 20px",
              background: "#e8f5e9",
              borderRadius: "4px",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: "12px", color: "#666" }}>Crédit</div>
            <div
              style={{ fontSize: "18px", fontWeight: "bold", color: "#2e7d32" }}
            >
              {totals.totalCredit.toFixed(2)} €
            </div>
          </div>

          <button
            onClick={saveJournal}
            style={{
              padding: "12px 24px",
              background: "#4CAF50",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontWeight: "bold",
              fontSize: "14px",
            }}
          >
            💾 Enregistrer
          </button>

          <button
            style={{
              padding: "12px 24px",
              background: "#f5f5f5",
              border: "1px solid #ccc",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "14px",
            }}
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}
