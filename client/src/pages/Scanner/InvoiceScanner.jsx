import { useState } from "react";
import { toast } from "react-toastify";
import Card from "../../components/ui/Card";
import Alert from "../../components/ui/Alert";
import customFetch from "../../utils/customFetch.js";

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
  const [processing, setProcessing] = useState(false);
  const [originalFile, setOriginalFile] = useState(null);
  const [extractedData, setExtractedData] = useState(null);
  const [confidence, setConfidence] = useState(null);

  const resetForm = () => {
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
    setOriginalFile(null);
    setExtractedData(null);
    setConfidence(null);
    setProcessing(false);
  };

  const applyExtraction = (data) => {
    // Map incoming keys to form fields defensively
    const mapped = {
      reference: data.numeroFacture || data.numero || data.reference || "",
      date: data.dateFacture || data.date || "",
      type: data.type || "facture",
      supplier: data.fournisseur || data.supplier || "",
      amountHT:
        data.montantHT != null
          ? String(data.montantHT)
          : data.montant_ht != null
            ? String(data.montant_ht)
            : "",
      amountTVA:
        data.montantTVA != null
          ? String(data.montantTVA)
          : data.montant_tva != null
            ? String(data.montant_tva)
            : "",
      amountTTC:
        data.montantTTC != null
          ? String(data.montantTTC)
          : data.montant_ttc != null
            ? String(data.montant_ttc)
            : "",
      notes: data.notes || "",
    };
    // If date is in ISO-ish with time, keep only date
    if (mapped.date && mapped.date.indexOf("T") !== -1)
      mapped.date = mapped.date.split("T")[0];
    setFormData(mapped);
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    setOriginalFile(file);
    setProcessing(true);
    toast.info("⏳ Traitement en cours...");

    // Try to send to backend endpoint that performs extraction
    try {
      const form = new FormData();
      form.append("file", file);

      // Endpoint expected: POST /documents/scan -> { data: { ...extracted }, confidence }
      const resp = await customFetch.post("/documents/scan", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const payload = resp.data || {};
      const data = payload.data || payload.extracted || payload;
      const conf = payload.confidence || payload.score || null;

      setExtractedData(data);
      setConfidence(conf);
      applyExtraction(data || {});
      setProcessing(false);
      toast.success("✅ Extraction terminée — vérifiez les champs.");
    } catch (err) {
      // Fallback: simulated extraction (useful when backend isn't available)
      console.warn(
        "Extraction API failed, falling back to simulated OCR:",
        err.message || err,
      );
      toast.warn(
        "Extraction distante indisponible — utilisation du mode simulé.",
      );
      // Simulate extraction
      setTimeout(() => {
        const simulated = {
          fournisseur: "Fournisseur Simulé SA",
          dateFacture: new Date().toISOString().split("T")[0],
          numeroFacture: "SIM-" + Math.floor(Math.random() * 10000),
          montantHT: (Math.random() * 500 + 50).toFixed(2),
          montantTVA: (Math.random() * 50 + 10).toFixed(2),
          montantTTC: null,
        };
        simulated.montantTTC = (
          parseFloat(simulated.montantHT) + parseFloat(simulated.montantTVA)
        ).toFixed(2);
        setExtractedData(simulated);
        setConfidence(null);
        applyExtraction({
          fournisseur: simulated.fournisseur,
          dateFacture: simulated.dateFacture,
          numeroFacture: simulated.numeroFacture,
          montantHT: simulated.montantHT,
          montantTVA: simulated.montantTVA,
          montantTTC: simulated.montantTTC,
        });
        setProcessing(false);
        toast.success("✅ Extraction simulée prête — vérifiez les champs.");
      }, 1000);
    }
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

  const handleSave = async (e) => {
    e.preventDefault();
    // Basic validation
    if (!formData.reference || !formData.date || !formData.supplier) {
      toast.error(
        "⚠️ Complétez au moins la référence, la date et le fournisseur",
      );
      return;
    }

    try {
      // Persist extracted data; backend should accept this shape
      const payload = {
        reference: formData.reference,
        date: formData.date,
        type: formData.type,
        supplier: formData.supplier,
        amount_ht: parseFloat(formData.amountHT) || 0,
        amount_tva: parseFloat(formData.amountTVA) || 0,
        amount_ttc: parseFloat(formData.amountTTC) || 0,
        notes: formData.notes || "",
        // Optionally attach extracted raw data and confidence
        extracted: extractedData || null,
        confidence: confidence || null,
      };

      // If original file exists, send it in multipart along with JSON
      if (originalFile) {
        const fd = new FormData();
        fd.append("file", originalFile);
        fd.append("metadata", JSON.stringify(payload));
        await customFetch.post("/documents", fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        await customFetch.post("/documents", payload);
      }

      toast.success("✅ Document enregistré");
      resetForm();
    } catch (err) {
      console.error("Save failed:", err);
      toast.error("Erreur lors de l'enregistrement");
    }
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
          disabled={processing}
        >
          {processing ? "Traitement..." : "📸 Scanner & Extraire"}
        </button>

        {processing && (
          <Alert type="info" style={{ marginTop: "1rem" }}>
            Lecture et extraction en cours...
          </Alert>
        )}

        {extractedData && (
          <Alert type="success" style={{ marginTop: "1rem" }}>
            Extraction prête{confidence ? ` (confiance: ${confidence})` : ""} —
            vérifiez les champs.
          </Alert>
        )}
      </Card>

      <Card title="Détails du Document">
        <form onSubmit={handleSave}>
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

          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button
              type="submit"
              className="btn btn-primary btn-large btn-block"
              disabled={processing}
            >
              Enregistrer le document
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={resetForm}
              disabled={processing}
            >
              Réinitialiser
            </button>
          </div>
        </form>
      </Card>
    </>
  );
}
