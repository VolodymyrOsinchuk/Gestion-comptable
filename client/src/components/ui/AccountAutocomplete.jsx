import { useState, useEffect, useRef, useMemo, useCallback } from "react";

function highlightText(text, query) {
  if (!query) return text;
  const parts = text.split(new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi"));
  return parts.map((part, i) =>
    part.toLowerCase() === query.toLowerCase() ? <mark key={i}>{part}</mark> : part
  );
}

function getAccountIcon(account) {
  const num = account.account_number;
  const type = account.account_type;

  if (num.startsWith("512") || num.startsWith("514") || num.startsWith("516") || num.startsWith("517") || num.startsWith("518") || num.startsWith("519"))
    return { icon: "bank", label: "Banque" };
  if (num.startsWith("411") || num.startsWith("413") || num.startsWith("416") || num.startsWith("418") || num.startsWith("419"))
    return { icon: "client", label: "Client" };
  if (num.startsWith("401") || num.startsWith("403") || num.startsWith("404") || num.startsWith("408") || num.startsWith("409"))
    return { icon: "supplier", label: "Fournisseur" };
  if (num.startsWith("445"))
    return { icon: "tva", label: "TVA" };
  if (type === "expense")
    return { icon: "expense", label: "Charge" };
  if (type === "revenue")
    return { icon: "revenue", label: "Produit" };
  if (num.startsWith("2"))
    return { icon: "asset", label: "Immobilisation" };
  if (num.startsWith("5"))
    return { icon: "financial", label: "Financier" };

  return { icon: "default", label: type };
}

function AccountIcon({ icon }) {
  const s = { width: 18, height: 18, flexShrink: 0 };
  switch (icon) {
    case "bank":
      return (
        <svg style={s} viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <line x1="7" y1="11" x2="7" y2="22" />
          <line x1="12" y1="11" x2="12" y2="22" />
          <line x1="17" y1="11" x2="17" y2="22" />
          <polyline points="3,11 12,2 21,11" />
        </svg>
      );
    case "client":
      return (
        <svg style={s} viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      );
    case "supplier":
      return (
        <svg style={s} viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      );
    case "tva":
      return (
        <svg style={s} viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
        </svg>
      );
    case "expense":
      return (
        <svg style={s} viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="1" x2="12" y2="23" />
          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
      );
    case "revenue":
      return (
        <svg style={s} viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="1" x2="12" y2="23" />
          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
      );
    case "asset":
      return (
        <svg style={s} viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="7" />
          <rect x="14" y="3" width="7" height="7" />
          <rect x="3" y="14" width="7" height="7" />
          <rect x="14" y="14" width="7" height="7" />
        </svg>
      );
    case "financial":
      return (
        <svg style={s} viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
      );
    default:
      return (
        <svg style={s} viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      );
  }
}

export default function AccountAutocomplete({
  accounts = [],
  value,
  onChange,
  onSelect,
  placeholder = "Rechercher un compte...",
  disabled = false,
}) {
  const [query, setQuery] = useState(
    value ? `${value.account_number} - ${value.account_label}` : ""
  );
  const [open, setOpen] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(0);
  const ref = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim();
    if (!q) {
      return accounts
        .filter((a) => a.is_active !== false && a.can_post !== false)
        .sort((a, b) => {
          if ((b.usage_count || 0) !== (a.usage_count || 0))
            return (b.usage_count || 0) - (a.usage_count || 0);
          return a.account_number.localeCompare(b.account_number);
        })
        .slice(0, 50);
    }

    const lower = q.toLowerCase();
    return accounts
      .filter((a) => {
        if (a.is_active === false || a.can_post === false) return false;
        const num = a.account_number.toLowerCase();
        const label = a.account_label.toLowerCase();
        return num.includes(lower) || label.includes(lower);
      })
      .sort((a, b) => {
        const aNum = a.account_number.toLowerCase();
        const bNum = b.account_number.toLowerCase();
        const aLabel = a.account_label.toLowerCase();
        const bLabel = b.account_label.toLowerCase();

        const aExactNum = aNum === lower ? 0 : 1;
        const bExactNum = bNum === lower ? 0 : 1;
        if (aExactNum !== bExactNum) return aExactNum - bExactNum;

        const aStartsNum = aNum.startsWith(lower) ? 0 : 1;
        const bStartsNum = bNum.startsWith(lower) ? 0 : 1;
        if (aStartsNum !== bStartsNum) return aStartsNum - bStartsNum;

        const aStartsLabel = aLabel.startsWith(lower) ? 0 : 1;
        const bStartsLabel = bLabel.startsWith(lower) ? 0 : 1;
        if (aStartsLabel !== bStartsLabel) return aStartsLabel - bStartsLabel;

        if ((b.usage_count || 0) !== (a.usage_count || 0))
          return (b.usage_count || 0) - (a.usage_count || 0);

        return a.account_number.localeCompare(b.account_number);
      })
      .slice(0, 50);
  }, [accounts, query]);

  const select = useCallback(
    (account) => {
      setQuery(`${account.account_number} - ${account.account_label}`);
      onChange(account);
      setOpen(false);
      if (onSelect) onSelect(account);
    },
    [onChange, onSelect]
  );

  const handleInputChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    setOpen(true);
    setHighlightIndex(0);
    if (val === "") {
      onChange(null);
    } else if (value) {
      onChange(null);
    }
  };

  const handleFocus = () => {
    setOpen(true);
    setHighlightIndex(0);
  };

  const handleKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightIndex((i) => (i < filtered.length - 1 ? i + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightIndex((i) => (i > 0 ? i - 1 : filtered.length - 1));
    } else if (e.key === "Enter" && filtered[highlightIndex]) {
      e.preventDefault();
      select(filtered[highlightIndex]);
    } else if (e.key === "Tab" && open && filtered[highlightIndex]) {
      e.preventDefault();
      select(filtered[highlightIndex]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  const displayResults = open && filtered.length > 0;

  return (
    <div className="autocomplete-wrapper" ref={ref}>
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={handleInputChange}
        onFocus={handleFocus}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        autoComplete="off"
        disabled={disabled}
      />
      {displayResults && (
        <ul className="autocomplete-list">
          {filtered.map((acc, i) => {
            const { icon } = getAccountIcon(acc);
            return (
              <li
                key={acc.id || acc.account_number}
                className={`autocomplete-item ${i === highlightIndex ? "highlighted" : ""}`}
                onMouseDown={() => select(acc)}
                onMouseEnter={() => setHighlightIndex(i)}
              >
                <span className="ac-icon">
                  <AccountIcon icon={icon} />
                </span>
                <span className="ac-number">{highlightText(acc.account_number, query.trim())}</span>
                <span className="ac-label">{highlightText(acc.account_label, query.trim())}</span>
                {acc.usage_count > 0 && (
                  <span className="ac-usage">{acc.usage_count}</span>
                )}
              </li>
            );
          })}
        </ul>
      )}
      {open && query.trim().length > 0 && filtered.length === 0 && (
        <ul className="autocomplete-list">
          <li className="autocomplete-item empty">Aucun compte trouvé</li>
        </ul>
      )}
    </div>
  );
}
