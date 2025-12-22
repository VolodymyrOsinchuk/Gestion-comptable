import { useState } from "react";
import { toast } from "react-toastify";
import Card from "../../components/ui/Card";
import Alert from "../../components/ui/Alert";

export default function InvoiceScanner() {
  const [formData, setFormData] = useState({
    reference: "",
    date: "",
    type: "",
    supplier: "",
    amountHT: "",
    amountTVA: "",
    amountTTC: "",
    notes: "",
  });
  const [uploadStatus, setUploadStatus] = useState("");

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploadStatus("processing");
    toast.info("⏳ Traitement OCR en cours...");

    setTimeout(() => {
      const simulatedData = {
        reference: "INV-" + Math.floor(Math.random() * 10000),
        date: new Date().toISOString().split("T")[0],
        type: "facture",
        supplier: "Fournisseur Simulé SA",
        amountHT: (Math.random() * 500 + 50).toFixed(2),
        amountTVA: (Math.random() * 50 + 10).toFixed(2),
        notes: "Données extraites par OCR simulé.",
      };

      setFormData((prev) => ({
        ...prev,
        ...simulatedData,
        amountTTC: (
          parseFloat(simulatedData.amountHT) +
          parseFloat(simulatedData.amountTVA)
        ).toFixed(2),
      }));

      setUploadStatus("success");
      toast.success("✅ Extraction réussie ! Vérifiez et enregistrez.");
    }, 2000);
  };

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => {
      const updated = { ...prev, [id]: value };

      if (id === "amountHT" || id === "amountTVA") {
        const ht = parseFloat(updated.amountHT) || 0;
        const tva = parseFloat(updated.amountTVA) || 0;
        updated.amountTTC = (ht + tva).toFixed(2);
      }

      return updated;
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (
      !formData.reference ||
      !formData.date ||
      !formData.type ||
      !formData.supplier ||
      !formData.amountHT ||
      !formData.amountTVA
    ) {
      toast.error("⚠️ Veuillez remplir tous les champs obligatoires");
      return;
    }

    console.log("Document saved:", formData);
    toast.success("✅ Document enregistré avec succès !");

    setFormData({
      reference: "",
      date: "",
      type: "",
      supplier: "",
      amountHT: "",
      amountTVA: "",
      amountTTC: "",
      notes: "",
    });
    setUploadStatus("");
  };

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Scanner de Factures</h1>
      </div>

      <Card
        title="Nouveau Document"
        subtitle="Scannez ou téléchargez une facture pour extraire automatiquement les données."
      >
        <input
          type="file"
          id="fileUpload"
          accept=".pdf,.jpg,.jpeg,.png"
          style={{ display: "none" }}
          onChange={handleFileUpload}
        />
        <button
          className="btn btn-primary btn-large"
          onClick={() => document.getElementById("fileUpload").click()}
        >
          📸 Scanner & Extraire
        </button>

        {uploadStatus === "success" && (
          <Alert type="success" style={{ marginTop: "1rem" }}>
            ✅ Extraction réussie ! Vérifiez et enregistrez.
          </Alert>
        )}
      </Card>

      <Card title="Détails du Document">
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="reference">Référence du document *</label>
              <input
                type="text"
                id="reference"
                value={formData.reference}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="date">Date *</label>
              <input
                type="date"
                id="date"
                value={formData.date}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="type">Type de document *</label>
              <select
                id="type"
                value={formData.type}
                onChange={handleInputChange}
                required
              >
                <option value="">Sélectionner le type</option>
                <option value="facture">Facture</option>
                <option value="avoir">Avoir</option>
                <option value="recu">Reçu</option>
                <option value="note">Note de frais</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="supplier">Fournisseur *</label>
              <input
                type="text"
                id="supplier"
                value={formData.supplier}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="amountHT">Montant HT (€) *</label>
              <input
                type="number"
                id="amountHT"
                step="0.01"
                value={formData.amountHT}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="amountTVA">Montant TVA (€) *</label>
              <input
                type="number"
                id="amountTVA"
                step="0.01"
                value={formData.amountTVA}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="amountTTC">Montant TTC (€) *</label>
              <input
                type="number"
                id="amountTTC"
                step="0.01"
                value={formData.amountTTC}
                readOnly
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="notes">Notes additionnelles</label>
            <textarea
              id="notes"
              value={formData.notes}
              onChange={handleInputChange}
            />
          </div>

          <button type="submit" className="btn btn-primary btn-large btn-block">
            Enregistrer le document
          </button>
        </form>
      </Card>
    </>
  );
}
