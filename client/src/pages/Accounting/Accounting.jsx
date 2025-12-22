import { toast } from "react-toastify";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";

export default function Accounting() {
  const accounts = [
    {
      number: "101000",
      label: "Capital",
      type: "Capitaux",
      balance: "50,000.00 €",
    },
    {
      number: "411000",
      label: "Clients",
      type: "Actif",
      balance: "15,430.50 €",
    },
    {
      number: "401000",
      label: "Fournisseurs",
      type: "Passif",
      balance: "8,250.00 €",
    },
    {
      number: "512000",
      label: "Banque",
      type: "Trésorerie",
      balance: "25,430.50 €",
    },
    {
      number: "706000",
      label: "Prestations de services",
      type: "Produit",
      balance: "125,000.00 €",
    },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    toast.success("Écriture enregistrée");
  };

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Comptabilité</h1>
      </div>

      <Card title="Plan Comptable">
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="accountSearch">Rechercher un compte</label>
            <input
              type="text"
              id="accountSearch"
              placeholder="Numéro ou libellé..."
            />
          </div>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Compte</th>
                <th>Libellé</th>
                <th>Type</th>
                <th>Solde</th>
              </tr>
            </thead>
            <tbody>
              {accounts.map((account) => (
                <tr key={account.number}>
                  <td>{account.number}</td>
                  <td>{account.label}</td>
                  <td>
                    <Badge
                      variant={
                        account.type === "Produit" ||
                        account.type === "Trésorerie"
                          ? "success"
                          : account.type === "Passif"
                          ? "warning"
                          : "info"
                      }
                    >
                      {account.type}
                    </Badge>
                  </td>
                  <td>{account.balance}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card title="Saisie d'Écriture Comptable">
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="entryDate">Date</label>
              <input type="date" id="entryDate" />
            </div>

            <div className="form-group">
              <label htmlFor="entryJournal">Journal</label>
              <select id="entryJournal">
                <option value="AC">Achats</option>
                <option value="VE">Ventes</option>
                <option value="BQ">Banque</option>
                <option value="OD">Opérations Diverses</option>
              </select>
            </div>
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="debitAccount">Compte Débit</label>
              <input type="text" id="debitAccount" placeholder="Ex: 411000" />
            </div>

            <div className="form-group">
              <label htmlFor="debitAmount">Montant Débit (€)</label>
              <input type="number" id="debitAmount" step="0.01" />
            </div>
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="creditAccount">Compte Crédit</label>
              <input type="text" id="creditAccount" placeholder="Ex: 706000" />
            </div>

            <div className="form-group">
              <label htmlFor="creditAmount">Montant Crédit (€)</label>
              <input type="number" id="creditAmount" step="0.01" />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="entryLabel">Libellé</label>
            <input type="text" id="entryLabel" />
          </div>

          <button type="submit" className="btn btn-primary btn-large btn-block">
            💾 Enregistrer l'écriture
          </button>
        </form>
      </Card>

      <Card title="Balance Comptable">
        <button
          className="btn btn-primary"
          onClick={() => toast.info("Générer balance")}
        >
          📊 Générer la Balance
        </button>
      </Card>
    </>
  );
}
