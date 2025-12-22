import { toast } from "react-toastify";
import Card from "../../components/ui/Card";
import StatCard from "../../components/ui/StatCard";
import Alert from "../../components/ui/Alert";

export default function Analysis() {
  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Analyse Financière</h1>
      </div>

      <div className="stats-grid">
        <StatCard
          label="Chiffre d'Affaires"
          value="125,000 €"
          variant="success"
        />
        <StatCard label="Charges" value="104,890 €" />
        <StatCard label="Résultat Net" value="20,110 €" variant="success" />
        <StatCard label="Marge Nette" value="16.1%" />
      </div>

      <Card title="Ratios Financiers">
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-label">Liquidité Générale</div>
            <div className="stat-value">1.85</div>
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: "85%", background: "var(--success)" }}
              ></div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-label">Solvabilité</div>
            <div className="stat-value">71.2%</div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: "71%" }}></div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-label">Rentabilité (ROE)</div>
            <div className="stat-value">28.5%</div>
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: "85%", background: "var(--success)" }}
              ></div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-label">Endettement</div>
            <div className="stat-value">28.8%</div>
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: "29%", background: "var(--success)" }}
              ></div>
            </div>
          </div>
        </div>
      </Card>

      <Card title="Analyse du Compte de Résultat">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Poste</th>
                <th style={{ textAlign: "right" }}>Montant</th>
                <th style={{ textAlign: "right" }}>% CA</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ background: "#f0f9ff" }}>
                <td>
                  <strong>Produits d'exploitation</strong>
                </td>
                <td style={{ textAlign: "right" }}>
                  <strong>125,000 €</strong>
                </td>
                <td style={{ textAlign: "right" }}>
                  <strong>100%</strong>
                </td>
              </tr>
              <tr>
                <td style={{ paddingLeft: "2rem" }}>Ventes de marchandises</td>
                <td style={{ textAlign: "right" }}>50,000 €</td>
                <td style={{ textAlign: "right" }}>40%</td>
              </tr>
              <tr>
                <td style={{ paddingLeft: "2rem" }}>Prestations de services</td>
                <td style={{ textAlign: "right" }}>75,000 €</td>
                <td style={{ textAlign: "right" }}>60%</td>
              </tr>
              <tr style={{ background: "#fef3c7" }}>
                <td>
                  <strong>Charges d'exploitation</strong>
                </td>
                <td style={{ textAlign: "right" }}>
                  <strong>-89,890 €</strong>
                </td>
                <td style={{ textAlign: "right" }}>
                  <strong>71.9%</strong>
                </td>
              </tr>
              <tr>
                <td style={{ paddingLeft: "2rem" }}>Achats</td>
                <td style={{ textAlign: "right" }}>-35,000 €</td>
                <td style={{ textAlign: "right" }}>28%</td>
              </tr>
              <tr>
                <td style={{ paddingLeft: "2rem" }}>Charges externes</td>
                <td style={{ textAlign: "right" }}>-22,000 €</td>
                <td style={{ textAlign: "right" }}>17.6%</td>
              </tr>
              <tr>
                <td style={{ paddingLeft: "2rem" }}>Charges de personnel</td>
                <td style={{ textAlign: "right" }}>-25,000 €</td>
                <td style={{ textAlign: "right" }}>20%</td>
              </tr>
              <tr>
                <td style={{ paddingLeft: "2rem" }}>Autres charges</td>
                <td style={{ textAlign: "right" }}>-7,890 €</td>
                <td style={{ textAlign: "right" }}>6.3%</td>
              </tr>
              <tr style={{ background: "#d1fae5" }}>
                <td>
                  <strong>Résultat d'exploitation</strong>
                </td>
                <td style={{ textAlign: "right" }}>
                  <strong>35,110 €</strong>
                </td>
                <td style={{ textAlign: "right" }}>
                  <strong>28.1%</strong>
                </td>
              </tr>
              <tr>
                <td>Résultat financier</td>
                <td style={{ textAlign: "right" }}>0 €</td>
                <td style={{ textAlign: "right" }}>0%</td>
              </tr>
              <tr>
                <td>Impôts sur les bénéfices</td>
                <td style={{ textAlign: "right" }}>-15,000 €</td>
                <td style={{ textAlign: "right" }}>12%</td>
              </tr>
              <tr
                style={{
                  background: "#bfdbfe",
                  fontWeight: 700,
                  fontSize: "1.1em",
                }}
              >
                <td>
                  <strong>RÉSULTAT NET</strong>
                </td>
                <td style={{ textAlign: "right" }}>
                  <strong>20,110 €</strong>
                </td>
                <td style={{ textAlign: "right" }}>
                  <strong>16.1%</strong>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>

      <Card title="Tableau de Bord">
        <Alert type="success">
          📈 <strong>Tendance:</strong> La rentabilité est en hausse de 12% par
          rapport à l'année précédente. La maîtrise des charges externes
          contribue positivement au résultat.
        </Alert>

        <div className="btn-group">
          <button
            className="btn btn-primary"
            onClick={() => toast.info("Exporter le Rapport")}
          >
            📊 Exporter le Rapport
          </button>
          <button
            className="btn btn-primary"
            onClick={() => toast.info("Envoyer par Email")}
          >
            📧 Envoyer par Email
          </button>
          <button
            className="btn btn-primary"
            onClick={() => toast.info("Imprimer")}
          >
            🖨️ Imprimer
          </button>
        </div>
      </Card>
    </>
  );
}
