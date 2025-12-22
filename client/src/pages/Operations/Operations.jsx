import { useState } from "react";
import Card from "../../components/ui/Card";
import StatCard from "../../components/ui/StatCard";

export default function Operations() {
  const [ratios, setRatios] = useState({
    liquidityRatio: "-",
    debtRatio: "-",
    financialHealth: "-",
  });

  const [breakeven, setBreakeven] = useState("-");
  const [bfr, setBfr] = useState("-");

  const calculateRatios = () => {
    const ac = parseFloat(document.getElementById("ac")?.value) || 0;
    const pc = parseFloat(document.getElementById("pc")?.value) || 0;
    const dt = parseFloat(document.getElementById("dt")?.value) || 0;
    const tb = parseFloat(document.getElementById("tb")?.value) || 0;

    const lg = pc ? (ac / pc).toFixed(2) : "-";
    const debt = tb ? ((dt / tb) * 100).toFixed(2) + "%" : "-";
    const health = lg >= 1 && parseFloat(debt) <= 70 ? "Sain" : "À surveiller";

    setRatios({
      liquidityRatio: lg,
      debtRatio: debt,
      financialHealth: health,
    });
  };

  const calculateBreakeven = () => {
    const cf = parseFloat(document.getElementById("cf")?.value) || 0;
    const tmscv = parseFloat(document.getElementById("tmscv")?.value) || 0;

    const sr = tmscv > 0 ? cf / (tmscv / 100) : 0;
    setBreakeven(
      sr.toLocaleString("fr-FR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }) + " €"
    );
  };

  const calculateBFR = () => {
    const s = parseFloat(document.getElementById("stocks")?.value) || 0;
    const c = parseFloat(document.getElementById("creances")?.value) || 0;
    const d = parseFloat(document.getElementById("dettesF")?.value) || 0;

    const bfrValue = s + c - d;
    setBfr(
      bfrValue.toLocaleString("fr-FR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }) + " €"
    );
  };

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Centre Opérations</h1>
      </div>

      <Card title="Opérations Comptables & Fiscales">
        <div className="stats-grid">
          <StatCard label="Écritures & Banque" value="OK" variant="success" />
          <StatCard label="TVA & FEC" value="Actifs" variant="success" />
          <StatCard label="Paie" value="Mensuelle" />
          <StatCard
            label="Déclarations"
            value="1 en attente"
            variant="warning"
          />
        </div>

        <div className="card-header">
          <h3 className="card-title">Checklist Opérationnelle</h3>
        </div>

        <div className="checkbox-group">
          <input type="checkbox" id="check1" defaultChecked />
          <label htmlFor="check1">
            ✅ Enregistrer écritures comptables et bancaires
          </label>
        </div>
        <div className="checkbox-group">
          <input type="checkbox" id="check2" defaultChecked />
          <label htmlFor="check2">
            ✅ Lettrage comptes & rapprochement bancaire
          </label>
        </div>
        <div className="checkbox-group">
          <input type="checkbox" id="check3" />
          <label htmlFor="check3">
            Déclarations fiscales (TVA, IS, DES, DEB)
          </label>
        </div>
        <div className="checkbox-group">
          <input type="checkbox" id="check4" defaultChecked />
          <label htmlFor="check4">✅ Génération & contrôle FEC</label>
        </div>
        <div className="checkbox-group">
          <input type="checkbox" id="check5" defaultChecked />
          <label htmlFor="check5">✅ Digitaliser processus (OCR, flux)</label>
        </div>
        <div className="checkbox-group">
          <input type="checkbox" id="check6" />
          <label htmlFor="check6">Paie du mois en cours</label>
        </div>
      </Card>

      <Card title="Calcul des Ratios">
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="ac">Actif circulant (€)</label>
            <input type="number" id="ac" step="0.01" />
          </div>

          <div className="form-group">
            <label htmlFor="pc">Passif circulant (€)</label>
            <input type="number" id="pc" step="0.01" />
          </div>

          <div className="form-group">
            <label htmlFor="dt">Dettes totales (€)</label>
            <input type="number" id="dt" step="0.01" />
          </div>

          <div className="form-group">
            <label htmlFor="tb">Total bilan (€)</label>
            <input type="number" id="tb" step="0.01" />
          </div>
        </div>

        <button className="btn btn-primary" onClick={calculateRatios}>
          🧮 Calculer
        </button>

        <div className="stats-grid" style={{ marginTop: "1.5rem" }}>
          <StatCard label="Liquidité générale" value={ratios.liquidityRatio} />
          <StatCard label="Endettement" value={ratios.debtRatio} />
          <StatCard label="Santé financière" value={ratios.financialHealth} />
        </div>
      </Card>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "1.5rem",
        }}
      >
        <Card title="Seuil de Rentabilité">
          <div className="form-group">
            <label htmlFor="cf">Charges fixes (€)</label>
            <input type="number" id="cf" step="0.01" />
          </div>

          <div className="form-group">
            <label htmlFor="tmscv">Taux de MSCV (%)</label>
            <input type="number" id="tmscv" step="0.01" />
          </div>

          <button
            className="btn btn-primary btn-block"
            onClick={calculateBreakeven}
          >
            📈 Calculer
          </button>

          <div className="stat-card" style={{ marginTop: "1rem" }}>
            <div className="stat-label">Résultat</div>
            <div className="stat-value">{breakeven}</div>
          </div>
        </Card>

        <Card title="BFR (Besoin en Fonds de Roulement)">
          <div className="form-group">
            <label htmlFor="stocks">Stocks (€)</label>
            <input type="number" id="stocks" step="0.01" />
          </div>

          <div className="form-group">
            <label htmlFor="creances">Créances clients (€)</label>
            <input type="number" id="creances" step="0.01" />
          </div>

          <div className="form-group">
            <label htmlFor="dettesF">Dettes fournisseurs (€)</label>
            <input type="number" id="dettesF" step="0.01" />
          </div>

          <button className="btn btn-primary btn-block" onClick={calculateBFR}>
            🧮 Calculer
          </button>

          <div className="stat-card" style={{ marginTop: "1rem" }}>
            <div className="stat-label">Résultat</div>
            <div className="stat-value">{bfr}</div>
          </div>
        </Card>
      </div>
    </>
  );
}
