import { toast } from "react-toastify";
import Card from "../../components/ui/Card";
import Alert from "../../components/ui/Alert";

export default function Closing() {
  const handleClosure = () => {
    toast.warning("Clôture en cours...");
  };

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Clôture & Bilan</h1>
      </div>

      <Card title="Processus de Clôture">
        <div className="form-group">
          <label htmlFor="closingYear">Exercice à Clôturer</label>
          <select id="closingYear">
            <option value="2024">2024</option>
            <option value="2023">2023</option>
          </select>
        </div>

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
          <input type="checkbox" id="close2" defaultChecked />
          <label htmlFor="close2">✅ Rapprochement bancaire effectué</label>
        </div>
        <div className="checkbox-group">
          <input type="checkbox" id="close3" defaultChecked />
          <label htmlFor="close3">
            ✅ Lettrage des comptes clients/fournisseurs
          </label>
        </div>
        <div className="checkbox-group">
          <input type="checkbox" id="close4" />
          <label htmlFor="close4">Inventaire des stocks réalisé</label>
        </div>
        <div className="checkbox-group">
          <input type="checkbox" id="close5" />
          <label htmlFor="close5">Amortissements calculés</label>
        </div>
        <div className="checkbox-group">
          <input type="checkbox" id="close6" />
          <label htmlFor="close6">Provisions comptabilisées</label>
        </div>
        <div className="checkbox-group">
          <input type="checkbox" id="close7" />
          <label htmlFor="close7">Charges et produits constatés d'avance</label>
        </div>

        <button
          className="btn btn-warning btn-large btn-block"
          style={{ marginTop: "1.5rem" }}
          onClick={handleClosure}
        >
          ⚖️ Procéder à la Clôture
        </button>
      </Card>

      <Card title="Documents de Synthèse">
        <div className="btn-group">
          <button className="btn btn-primary">📊 Bilan Comptable</button>
          <button className="btn btn-primary">💰 Compte de Résultat</button>
          <button className="btn btn-primary">📋 Annexes</button>
          <button className="btn btn-primary">📈 Liasse Fiscale</button>
        </div>
      </Card>

      <Card title="Aperçu du Bilan">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "2rem",
          }}
        >
          <div>
            <h3
              style={{
                fontSize: "1.1rem",
                fontWeight: 600,
                marginBottom: "1rem",
                color: "var(--primary)",
              }}
            >
              ACTIF
            </h3>
            <table style={{ width: "100%", fontSize: "0.875rem" }}>
              <tbody>
                <tr>
                  <td>Immobilisations</td>
                  <td style={{ textAlign: "right", fontWeight: 600 }}>
                    45,000 €
                  </td>
                </tr>
                <tr>
                  <td>Stocks</td>
                  <td style={{ textAlign: "right", fontWeight: 600 }}>
                    12,500 €
                  </td>
                </tr>
                <tr>
                  <td>Créances clients</td>
                  <td style={{ textAlign: "right", fontWeight: 600 }}>
                    15,430 €
                  </td>
                </tr>
                <tr>
                  <td>Trésorerie</td>
                  <td style={{ textAlign: "right", fontWeight: 600 }}>
                    25,430 €
                  </td>
                </tr>
                <tr
                  style={{
                    borderTop: "2px solid var(--primary)",
                    fontWeight: 700,
                  }}
                >
                  <td>TOTAL ACTIF</td>
                  <td style={{ textAlign: "right" }}>98,360 €</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div>
            <h3
              style={{
                fontSize: "1.1rem",
                fontWeight: 600,
                marginBottom: "1rem",
                color: "var(--primary)",
              }}
            >
              PASSIF
            </h3>
            <table style={{ width: "100%", fontSize: "0.875rem" }}>
              <tbody>
                <tr>
                  <td>Capital social</td>
                  <td style={{ textAlign: "right", fontWeight: 600 }}>
                    50,000 €
                  </td>
                </tr>
                <tr>
                  <td>Résultat</td>
                  <td style={{ textAlign: "right", fontWeight: 600 }}>
                    20,110 €
                  </td>
                </tr>
                <tr>
                  <td>Dettes fournisseurs</td>
                  <td style={{ textAlign: "right", fontWeight: 600 }}>
                    8,250 €
                  </td>
                </tr>
                <tr>
                  <td>Dettes fiscales</td>
                  <td style={{ textAlign: "right", fontWeight: 600 }}>
                    20,000 €
                  </td>
                </tr>
                <tr
                  style={{
                    borderTop: "2px solid var(--primary)",
                    fontWeight: 700,
                  }}
                >
                  <td>TOTAL PASSIF</td>
                  <td style={{ textAlign: "right" }}>98,360 €</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </Card>
    </>
  );
}
