import Card from "../../components/ui/Card";
import StatCard from "../../components/ui/StatCard";

export default function Digitalisation() {
  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Digitalisation</h1>
      </div>

      <Card
        title="Processus de Digitalisation"
        subtitle="Automatisez vos flux comptables avec l'OCR et l'IA"
      >
        <div className="stats-grid">
          <StatCard
            label="Taux d'Automatisation"
            value="85%"
            variant="success"
          />
          <StatCard label="Documents Traités" value="1,247" />
          <StatCard label="Temps Économisé" value="120h" />
        </div>
      </Card>

      <Card title="Configuration OCR">
        <div className="checkbox-group">
          <input type="checkbox" id="ocr1" defaultChecked />
          <label htmlFor="ocr1">Extraction automatique des factures</label>
        </div>
        <div className="checkbox-group">
          <input type="checkbox" id="ocr2" defaultChecked />
          <label htmlFor="ocr2">
            Reconnaissance des fournisseurs récurrents
          </label>
        </div>
        <div className="checkbox-group">
          <input type="checkbox" id="ocr3" />
          <label htmlFor="ocr3">Validation automatique sous seuil (500€)</label>
        </div>
        <div className="checkbox-group">
          <input type="checkbox" id="ocr4" defaultChecked />
          <label htmlFor="ocr4">
            Génération automatique des écritures comptables
          </label>
        </div>
      </Card>

      <Card title="Flux Automatisés">
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="emailIn">Email entrant</label>
            <input
              type="email"
              id="emailIn"
              defaultValue="factures@entreprise.com"
              readOnly
            />
          </div>

          <div className="form-group">
            <label htmlFor="apiKey">Clé API</label>
            <input
              type="text"
              id="apiKey"
              defaultValue="sk_live_************************"
              readOnly
            />
          </div>
        </div>

        <button className="btn btn-primary">🔄 Synchroniser les flux</button>
      </Card>
    </>
  );
}
