import { useState } from "react";
import { toast } from "react-toastify";
import Card from "../../components/ui/Card";
import StatCard from "../../components/ui/StatCard";

export default function TVA() {
  const [period, setPeriod] = useState("2024-10");
  const [regime, setRegime] = useState("normal");

  const calculateTVA = () => {
    toast.success("Calcul de la TVA effectué pour la période sélectionnée");
  };

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Gestion de la TVA</h1>
      </div>

      <div className="stats-grid">
        <StatCard label="TVA Collectée (mois)" value="8,450 €" />
        <StatCard label="TVA Déductible (mois)" value="3,200 €" />
        <StatCard label="TVA à Payer" value="5,250 €" variant="success" />
        <StatCard label="Prochaine Échéance" value="15 Nov" variant="warning" />
      </div>

      <Card title="Calcul de la TVA">
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="tvaPeriod">Période</label>
            <input
              type="month"
              id="tvaPeriod"
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="tvaRegime">Régime</label>
            <select
              id="tvaRegime"
              value={regime}
              onChange={(e) => setRegime(e.target.value)}
            >
              <option value="normal">Régime Normal</option>
              <option value="simplifie">Régime Simplifié</option>
              <option value="reel">Régime Réel</option>
            </select>
          </div>
        </div>

        <button className="btn btn-primary" onClick={calculateTVA}>
          🧮 Calculer la TVA
        </button>
      </Card>

      <Card title="Détail des Taux">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Taux</th>
                <th>Base HT</th>
                <th>TVA Collectée</th>
                <th>TVA Déductible</th>
                <th>Net</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>20%</td>
                <td>35,000 €</td>
                <td>7,000 €</td>
                <td>2,500 €</td>
                <td>4,500 €</td>
              </tr>
              <tr>
                <td>10%</td>
                <td>12,000 €</td>
                <td>1,200 €</td>
                <td>600 €</td>
                <td>600 €</td>
              </tr>
              <tr>
                <td>5.5%</td>
                <td>3,000 €</td>
                <td>165 €</td>
                <td>50 €</td>
                <td>115 €</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>

      <Card title="Déclaration CA3">
        <button
          className="btn btn-success btn-large btn-block"
          onClick={() => toast.info("Générer CA3")}
        >
          📄 Générer la Déclaration CA3
        </button>
      </Card>
    </>
  );
}
