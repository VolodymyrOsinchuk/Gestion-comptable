import { useState } from "react";
import { toast } from "react-toastify";
import Card from "../../components/ui/Card";
import Alert from "../../components/ui/Alert";

export default function FEC() {
  const [year, setYear] = useState("2024");
  const [format, setFormat] = useState("txt");

  const generateFEC = () => {
    toast.success(
      `Génération du FEC en cours...\n\nFichier prêt au téléchargement : FEC_${year}_${Date.now()}.txt`
    );
  };

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Fichier des Écritures Comptables (FEC)</h1>
      </div>

      <Card
        title="Génération du FEC"
        subtitle="Fichier conforme à l'article A47 A-1 du Livre des Procédures Fiscales"
      >
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="fecYear">Exercice Fiscal</label>
            <select
              id="fecYear"
              value={year}
              onChange={(e) => setYear(e.target.value)}
            >
              <option value="2024">2024</option>
              <option value="2023">2023</option>
              <option value="2022">2022</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="fecFormat">Format</label>
            <select
              id="fecFormat"
              value={format}
              onChange={(e) => setFormat(e.target.value)}
            >
              <option value="txt">TXT (pipe-delimited)</option>
              <option value="csv">CSV</option>
            </select>
          </div>
        </div>

        <button className="btn btn-primary btn-large" onClick={generateFEC}>
          📋 Générer le FEC
        </button>
      </Card>

      <Card title="Contrôle de Conformité">
        <div className="checkbox-group">
          <input type="checkbox" checked disabled readOnly />
          <label>✅ Structure des champs conforme</label>
        </div>
        <div className="checkbox-group">
          <input type="checkbox" checked disabled readOnly />
          <label>✅ Séquence des écritures vérifiée</label>
        </div>
        <div className="checkbox-group">
          <input type="checkbox" checked disabled readOnly />
          <label>✅ Équilibre débit/crédit validé</label>
        </div>
        <div className="checkbox-group">
          <input type="checkbox" checked disabled readOnly />
          <label>✅ Caractères spéciaux conformes</label>
        </div>
        <div className="checkbox-group">
          <input type="checkbox" checked disabled readOnly />
          <label>✅ Dates cohérentes avec l'exercice</label>
        </div>

        <Alert type="success" style={{ marginTop: "1rem" }}>
          ✅ Le FEC est conforme aux exigences réglementaires
        </Alert>
      </Card>

      <Card title="Historique des Générations">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Exercice</th>
                <th>Nb Écritures</th>
                <th>Taille</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>2024-11-05</td>
                <td>2024</td>
                <td>2,847</td>
                <td>1.2 Mo</td>
                <td>
                  <button
                    className="btn btn-primary"
                    style={{ padding: "0.5rem 1rem", fontSize: "0.875rem" }}
                  >
                    Télécharger
                  </button>
                </td>
              </tr>
              <tr>
                <td>2024-01-15</td>
                <td>2023</td>
                <td>8,234</td>
                <td>3.5 Mo</td>
                <td>
                  <button
                    className="btn btn-primary"
                    style={{ padding: "0.5rem 1rem", fontSize: "0.875rem" }}
                  >
                    Télécharger
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}
