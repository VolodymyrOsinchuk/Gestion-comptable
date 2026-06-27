import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import AccountAutocomplete from "../../components/ui/AccountAutocomplete";

const API = import.meta.env.VITE_API_URL || "/api/v1";

export default function Accounting() {
  const { companyId } = useParams();
  const [accounts, setAccounts] = useState([]);
  const [journals, setJournals] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [entryKey, setEntryKey] = useState(0);

  const debitAmountRef = useRef(null);
  const creditAmtRef = useRef(null);
  const creditAccountRef = useRef(null);
  const labelRef = useRef(null);

  const [form, setForm] = useState({
    entryDate: new Date().toISOString().slice(0, 10),
    journalId: "",
    debitAccount: null,
    debitAmount: "",
    creditAccount: null,
    creditAmount: "",
    label: "",
    tvaRate: "",
  });

  const tvaSide = useMemo(() => {
    if (form.creditAccount?.tva_applicable && form.creditAccount?.account_number?.charAt(0) === "7") return "credit";
    if (form.debitAccount?.tva_applicable) return "debit";
    return null;
  }, [form.debitAccount, form.creditAccount]);

  const tvaAppliedAmount = useMemo(() => {
    if (!form.tvaRate || !tvaSide) return 0;
    const base = tvaSide === "debit" ? form.debitAmount : form.creditAmount;
    if (!base) return 0;
    return Math.round(Number(base) * Number(form.tvaRate) * 100) / 10000;
  }, [form.tvaRate, tvaSide, form.debitAmount, form.creditAmount]);

  const ttcAmount = useMemo(() => {
    if (tvaAppliedAmount <= 0) return 0;
    if (tvaSide === "debit") {
      return Math.round((Number(form.debitAmount) + tvaAppliedAmount) * 100) / 100;
    }
    return Math.round((Number(form.creditAmount) + tvaAppliedAmount) * 100) / 100;
  }, [tvaAppliedAmount, tvaSide, form.debitAmount, form.creditAmount]);

  const getTvaAccount = useCallback(() => {
    if (!form.tvaRate) return null;
    const prefix = form.debitAccount?.account_number?.charAt(0);
    let search = "";
    if (prefix === "6") search = "445660";
    else if (prefix === "2") search = "445670";
    else if (form.creditAccount?.account_number?.charAt(0) === "7") search = "445710";
    else search = "445660";
    return accounts.find((a) => a.account_number === search) || null;
  }, [form.tvaRate, form.debitAccount, form.creditAccount, accounts]);

  const showTva = form.debitAccount?.tva_applicable || form.creditAccount?.tva_applicable;

  useEffect(() => {
    if (!companyId) return;
    Promise.all([
      fetch(`${API}/chart-of-accounts/${companyId}?autocomplete=true&active=true`).then((r) =>
        r.json()
      ),
      fetch(`${API}/journals/${companyId}`).then((r) => r.json()),
    ])
      .then(([accountsData, journalsData]) => {
        setAccounts(accountsData.accounts || accountsData.rows || []);
        setJournals(journalsData.journals || journalsData.rows || journalsData || []);
      })
      .catch(() => toast.error("Erreur chargement des données"));
  }, [companyId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.debitAccount || !form.creditAccount) {
      toast.error("Sélectionnez un compte débit et un compte crédit");
      return;
    }
    if (!form.debitAmount || !form.creditAmount) {
      toast.error("Saisissez les montants");
      return;
    }
    const totalDebit = Number(form.debitAmount) + (tvaSide === "debit" && tvaAppliedAmount > 0 ? tvaAppliedAmount : 0);
    const totalCredit = Number(form.creditAmount) + (tvaSide === "credit" && tvaAppliedAmount > 0 ? tvaAppliedAmount : 0);
    if (Math.abs(totalDebit - totalCredit) > 0.01) {
      toast.error(`Écriture non équilibrée : débit ${totalDebit.toFixed(2)} ≠ crédit ${totalCredit.toFixed(2)}`);
      return;
    }
    if (!form.journalId) {
      toast.error("Sélectionnez un journal");
      return;
    }
    if (!form.label) {
      toast.error("Saisissez un libellé");
      return;
    }

    const lines = [
      {
        account_number: form.debitAccount.account_number,
        debit: Number(form.debitAmount),
        credit: 0,
      },
      {
        account_number: form.creditAccount.account_number,
        debit: 0,
        credit: Number(form.creditAmount),
      },
    ];

    const tvaAcc = getTvaAccount();
    if (tvaAppliedAmount > 0 && tvaAcc) {
      lines.push({
        account_number: tvaAcc.account_number,
        debit: tvaSide === "debit" ? tvaAppliedAmount : 0,
        credit: tvaSide === "credit" ? tvaAppliedAmount : 0,
      });
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${API}/accounting/${companyId}/entries`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entry_date: form.entryDate,
          journal_id: Number(form.journalId),
          label: form.label,
          lines,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Erreur lors de la création");
      }
      const result = await res.json();
      const tvaMsg = tvaAppliedAmount > 0 ? ` (TVA ${form.tvaRate}% : ${tvaAppliedAmount.toFixed(2)}€)` : "";
      toast.success(`Écriture ${result.entry_number} enregistrée${tvaMsg}`);
      setForm({
        entryDate: new Date().toISOString().slice(0, 10),
        journalId: form.journalId,
        debitAccount: null,
        debitAmount: "",
        creditAccount: null,
        creditAmount: "",
        label: "",
        tvaRate: "",
      });
      setEntryKey((k) => k + 1);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDebitSelect = () => {
    setTimeout(() => debitAmountRef.current?.focus(), 0);
  };

  const handleCreditSelect = () => {
    setTimeout(() => creditAmtRef.current?.focus(), 0);
  };

  const accountTypes = accounts.reduce((acc, a) => {
    const type = a.account_type || "other";
    if (!acc[type]) acc[type] = { label: getTypeLabel(type), count: 0 };
    acc[type].count++;
    return acc;
  }, {});

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Comptabilité</h1>
        <p className="page-subtitle">
          {accounts.length} comptes actifs · {journals.length} journaux
        </p>
      </div>

      <div className="stats-grid">
        {Object.entries(accountTypes).map(([key, val]) => (
          <div key={key} className="stat-card">
            <div className="stat-label">{val.label}</div>
            <div className="stat-value">{val.count}</div>
          </div>
        ))}
      </div>

      <Card title="Saisie d'Écriture Comptable">
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="entryDate">Date</label>
              <input
                type="date"
                id="entryDate"
                value={form.entryDate}
                onChange={(e) => setForm({ ...form, entryDate: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label htmlFor="entryJournal">Journal</label>
              <select
                id="entryJournal"
                value={form.journalId}
                onChange={(e) => setForm({ ...form, journalId: e.target.value })}
              >
                <option value="">Sélectionner...</option>
                {journals.map((j) => (
                  <option key={j.id} value={j.id}>
                    {j.code} - {j.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="entry-lines">
            <div className="entry-line-header">
              <span className="el-cell el-cell-wide">Compte</span>
              <span className="el-cell el-cell-amount">Débit (€)</span>
              <span className="el-cell el-cell-amount">Crédit (€)</span>
            </div>

            <div className="entry-line">
              <div className="el-cell el-cell-wide">
                <AccountAutocomplete
                  key={`debit-${entryKey}`}
                  accounts={accounts}
                  value={form.debitAccount}
                  onChange={(acc) => setForm({ ...form, debitAccount: acc })}
                  onSelect={handleDebitSelect}
                  placeholder="Compte de débit..."
                />
              </div>
              <div className="el-cell el-cell-amount">
                <input
                  ref={debitAmountRef}
                  type="number"
                  step="0.01"
                  min="0"
                  value={tvaSide === "credit" && form.tvaRate ? ttcAmount.toFixed(2) : form.debitAmount}
                  onChange={(e) => setForm({ ...form, debitAmount: e.target.value })}
                  placeholder="0.00"
                  readOnly={tvaSide === "credit" && !!form.tvaRate}
                  className={tvaSide === "credit" && form.tvaRate ? "input-readonly" : ""}
                />
              </div>
              <div className="el-cell el-cell-amount el-cell-muted">—</div>
            </div>

            <div className="entry-line">
              <div className="el-cell el-cell-wide" ref={creditAccountRef}>
                <AccountAutocomplete
                  key={`credit-${entryKey}`}
                  accounts={accounts}
                  value={form.creditAccount}
                  onChange={(acc) => setForm({ ...form, creditAccount: acc })}
                  onSelect={handleCreditSelect}
                  placeholder="Compte de crédit..."
                />
              </div>
              <div className="el-cell el-cell-amount el-cell-muted">—</div>
              <div className="el-cell el-cell-amount">
                <input
                  ref={creditAmtRef}
                  type="number"
                  step="0.01"
                  min="0"
                  value={tvaSide === "debit" && form.tvaRate ? ttcAmount.toFixed(2) : form.creditAmount}
                  onChange={(e) => setForm({ ...form, creditAmount: e.target.value })}
                  placeholder="0.00"
                  readOnly={tvaSide === "debit" && !!form.tvaRate}
                  className={tvaSide === "debit" && form.tvaRate ? "input-readonly" : ""}
                />
              </div>
            </div>
          </div>

          {showTva && (
            <div className="tva-section">
              <div className="tva-line">
                <div className="form-group tva-rate-group">
                  <label>TVA</label>
                  <select
                    value={form.tvaRate}
                    onChange={(e) => setForm({ ...form, tvaRate: e.target.value })}
                  >
                    <option value="">Sans TVA</option>
                    <option value="2.1">2,1 %</option>
                    <option value="5.5">5,5 %</option>
                    <option value="10">10 %</option>
                    <option value="20">20 %</option>
                  </select>
                </div>
                {form.tvaRate && (
                  <>
                    <div className="form-group tva-amount-group">
                      <label>Montant TVA</label>
                      <input type="number" value={tvaAppliedAmount.toFixed(2)} readOnly className="input-readonly" />
                    </div>
                    <div className="form-group tva-account-group">
                      <label>Compte TVA</label>
                      <input
                        type="text"
                        value={getTvaAccount() ? `${getTvaAccount().account_number} - ${getTvaAccount().account_label}` : ""}
                        readOnly
                        className="input-readonly"
                      />
                    </div>
                    <div className="form-group tva-ttc-group">
                      <label>Base TTC</label>
                      <input type="number" value={ttcAmount.toFixed(2)} readOnly className="input-readonly ttc-amount" />
                    </div>
                    <div className="form-group tva-side-group">
                      <label>Sens TVA</label>
                      <input
                        type="text"
                        value={tvaSide === "debit" ? "TVA en débit (achat)" : "TVA en crédit (vente)"}
                        readOnly
                        className="input-readonly"
                      />
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          <div className="form-group" style={{ marginTop: "1rem" }}>
            <label htmlFor="entryLabel">Libellé de l'écriture</label>
            <input
              ref={labelRef}
              type="text"
              id="entryLabel"
              value={form.label}
              onChange={(e) => setForm({ ...form, label: e.target.value })}
              placeholder="Ex: Règlement fournisseur facture F2025-001"
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-large btn-block"
            disabled={submitting}
            style={{ marginTop: "1.5rem" }}
          >
            {submitting ? "Enregistrement..." : "Enregistrer l'écriture"}
          </button>
        </form>
      </Card>

      <Card title="Plan Comptable">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Compte</th>
                <th>Libellé</th>
                <th>Classe</th>
                <th>Type</th>
                <th>Utilisations</th>
              </tr>
            </thead>
            <tbody>
              {accounts.map((account) => (
                <tr key={account.account_number}>
                  <td className="td-mono">{account.account_number}</td>
                  <td>{account.account_label}</td>
                  <td>{classes[account.account_class] || `Classe ${account.account_class}`}</td>
                  <td>
                    <Badge
                      variant={
                        account.account_type === "revenue" || account.account_type === "asset"
                          ? "success"
                          : account.account_type === "liability"
                          ? "warning"
                          : "info"
                      }
                    >
                      {getTypeLabel(account.account_type)}
                    </Badge>
                  </td>
                  <td>{account.usage_count || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}

const classes = {
  1: "Capitaux",
  2: "Immobilisations",
  3: "Stocks",
  4: "Tiers",
  5: "Financiers",
  6: "Charges",
  7: "Produits",
  8: "Spéciaux",
};

function getTypeLabel(type) {
  const labels = {
    asset: "Actif",
    liability: "Passif",
    equity: "Capitaux propres",
    revenue: "Produits",
    expense: "Charges",
    special: "Spéciaux",
  };
  return labels[type] || type;
}
