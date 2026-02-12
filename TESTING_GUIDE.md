# Frontend & Backend Integration Testing Guide

## Environment Setup

- **Backend**: Running on `http://localhost:5000`
- **Frontend**: Running on `http://localhost:5173`
- **Database**: PostgreSQL (Neon.tech) connected and populated with test data

## Test Data Available

7 accounting documents pre-populated for **Company ID 1**:

| Reference      | Type               | Amount (HT) | TVA       | Total (TTC) | Status    |
| -------------- | ------------------ | ----------- | --------- | ----------- | --------- |
| FA2025-001     | Invoice (Customer) | €5,000.00   | €1,000.00 | €6,000.00   | Validated |
| FA2025-002     | Invoice (Customer) | €8,500.00   | €1,700.00 | €10,200.00  | Validated |
| FA2025-003     | Invoice (Customer) | €3,200.00   | €640.00   | €3,840.00   | Validated |
| AV2025-001     | Credit Note        | €(500.00)   | €(100.00) | €(600.00)   | Validated |
| FOUR2025-001   | Invoice (Supplier) | €450.00     | €90.00    | €540.00     | Validated |
| COMPTA2025-001 | Invoice (Supplier) | €1,200.00   | €240.00   | €1,440.00   | Validated |
| EDF-JAN2025    | Invoice (Supplier) | €280.00     | €56.00    | €336.00     | Validated |

**All documents have 3 balanced accounting entries each (Debit = Credit per document)**

---

## Testing Checklist

### ✅ Phase 1: Basic Connectivity

- [ ] Open http://localhost:5173 - Frontend loads without errors
- [ ] Check browser console for CORS or network errors
- [ ] Verify API calls resolve (F12 DevTools → Network tab)

### ✅ Phase 2: Companies Page

**Path**: http://localhost:5173/companies

- [ ] Page loads and displays company list
- [ ] Company "ACME Corp" (ID 1) is visible
- [ ] Can click into company to navigate to its documents

### ✅ Phase 3: Documents Page

**Path**: http://localhost:5173/companies/1/documents

- [ ] Page loads and displays journal entry interface
- [ ] 7 test documents are listed or accessible
- [ ] Can view document details (reference, amount, type)
- [ ] Document status shows as "validated"
- [ ] Total amounts calculated correctly (€28,416.00 HT, €5,686.00 TVA)

### ✅ Phase 4: Accounting Entries Display

**Verify via API**: `GET /api/companies/1/accounting-entries`

```bash
# Should return all 21 entries (3 per document × 7 documents)
curl -s http://localhost:5000/api/companies/1/accounting-entries | head -200
```

Expected data per document:

- **Customer invoices (FA2025-0xx)**: Debit client (411), Credit revenue (706), Credit TVA (445)
- **Supplier invoices (FOUR/COMPTA/EDF)**: Debit expense (706), Debit TVA (445), Credit supplier (401)
- **Credit note (AV2025-001)**: Credit client (411), Debit revenue (706), Debit TVA (445) [reversed]

### ✅ Phase 5: Manual Entry Creation

**Path**: http://localhost:5173/companies/1/documents

- [ ] Click "New Entry" or equivalent button
- [ ] Fill in entry form with:
  - **Journal**: VE (Ventes) or AC (Achats)
  - **Period**: Janvier 2025 (or current)
  - **Account**: 411000 (Client)
  - **Debit**: €100
  - **Credit**: €100
- [ ] Submit and verify entry is created balanced (Debit = Credit)

### ✅ Phase 6: Accounting Page

**Path**: http://localhost:5173/companies/1/accounting

- [ ] Plan Comptable (Chart of Accounts) displays
- [ ] Can search/filter accounts
- [ ] Account balances shown (example: 411000 Clients should reflect invoices)

### ✅ Phase 7: Batch Entry Generation (Already tested via API)

**Endpoint**: `POST /api/companies/1/documents/generate-entries`

```bash
curl -X POST http://localhost:5000/api/documents/generate-entries?companyId=1
```

- Expected Response:

```json
{
  "msg": "Génération terminée",
  "processed": 0,
  "skipped": 7,
  "total": 7,
  "details": [
    {
      "id": 1,
      "reference": "FA2025-001",
      "status": "skipped",
      "reason": "entries_exist"
    },
    ...
  ]
}
```

---

## Backend API Endpoints to Verify

### Documents

- `GET /api/companies/1/documents` - List all documents
- `GET /api/companies/1/documents/:id` - Get single document
- `PUT /api/companies/1/documents/:id` - Update document
- `POST /api/companies/1/documents` - Create new document
- `POST /api/documents/generate-entries` - Batch generate entries (with companyId query param)

### Accounting Entries

- `GET /api/companies/1/accounting-entries` - List all entries
- `GET /api/accounting-entries/by-reference/:reference` - Get entries by document reference
- `POST /api/companies/1/accounting-entries` - Create new entry

### Third Parties (Clients/Suppliers)

- `GET /api/companies/1/third-parties` - List all third parties
- `GET /api/companies/1/third-parties/:id` - Get single third party

### Companies

- `GET /api/companies` - List all companies
- `GET /api/companies/:id` - Get company details

---

## Known Issues & Workarounds

### Issue 1: API Timeout on First Request

**Symptom**: First API call takes 5+ seconds
**Cause**: Cold start of Node.js server or database connection pooling
**Solution**: Wait for "Connexion à la base de données réussie" in backend terminal

### Issue 2: CORS Errors (if frontend on different domain)

**Symptom**: XMLHttpRequest blocked by CORS
**Cause**: Backend CORS configuration
**Solution**: Verify backend has `res.header("Access-Control-Allow-Origin", "*")` in middleware

### Issue 3: Frontend Shows Blank Pages

**Symptom**: Page loads but no data displayed
**Cause**: Loader/action failing silently
**Solution**: Open DevTools (F12) → Console tab → check for errors, Network tab to verify API calls

---

## Data Validation Rules (Implemented)

### Document Validation

✅ HT (amount_ht) + TVA (amount_tva) ≈ TTC (amount_ttc) [±€0.02 tolerance]

### Accounting Entry Balance

✅ For each `entry_number`, Σ Debit = Σ Credit (enforced per document)

Example for FA2025-001:

- Row 1: Debit €6,000 (client 411000) | Credit €0
- Row 2: Debit €0 | Credit €5,000 (revenue 706000)
- Row 3: Debit €0 | Credit €1,000 (TVA 445700)
- **Total: Debit €6,000 = Credit €6,000** ✓

### Credit Note Reversal Logic

✅ For credit_note type:

- Uses `Math.abs()` on negative amounts
- Reverses debit/credit sides vs. normal invoice
- Credit client account (reduce receivable)
- Debit revenue and TVA (return product)

---

## Performance Expectations

| Operation                  | Expected Time | Threshold |
| -------------------------- | ------------- | --------- |
| Load Documents page        | <1 second     | 3 seconds |
| Create new entry           | <500ms        | 2 seconds |
| Generate 7 entries (batch) | <200ms        | 1 second  |
| Page navigation            | <300ms        | 1 second  |

---

## Debugging Tips

### 1. Backend Logs

```bash
# Terminal where server is running
# Should show:
# [dotenv@17.2.3] injecting env (3) from .env.development
# Serveur démarré sur le port 5000
# Connexion à la base de données réussie.
```

### 2. Database Verification

```bash
# Check document count
cd server && node -e "require('dotenv').config({path:'.env.development'}); const {sequelize} = require('./config/db'); sequelize.sync(); sequelize.query('SELECT COUNT(*) FROM documents').then(r => console.log('Docs:', r[0][0]));"
```

### 3. Frontend Network Trace

- Open DevTools (F12)
- Go to Network tab
- Reload page
- Check each API request:
  - `GET /api/companies/1/documents` should return status 200 with JSON array
  - Look for red errors (4xx/5xx status codes)

### 4. Console Errors

- DevTools → Console tab
- Look for:
  - `CORS` errors → Backend needs CORS setup
  - `TypeError: Cannot read property 'data'` → API response format issue
  - `401 Unauthorized` → Authentication/token issue

---

## Success Criteria

Frontend testing is **COMPLETE** when:

1. ✅ Both frontend (5173) and backend (5000) servers are running
2. ✅ No 4xx/5xx errors in browser console Network tab
3. ✅ Companies page loads and displays company list
4. ✅ Documents page loads with 7 test documents visible
5. ✅ API calls successfully fetch data from backend
6. ✅ Can navigate between pages without errors
7. ✅ Document amounts are calculated and displayed correctly
8. ✅ All 21 accounting entries exist in database (verified via script)
9. ✅ Batch entry generation returns proper response (processed/skipped/total counts)
10. ✅ No unhandled promise rejections or uncaught exceptions

---

## Next Steps After Testing

1. **UI Enhancements**

   - Add form validation with user feedback
   - Implement pagination for large datasets
   - Add search/filter functionality on documents list

2. **Additional Features**

   - File upload for supporting documents (pièces justificatives)
   - Invoice scanning and OCR (already has scanner page)
   - Lettrage (reconciliation) of accounting entries
   - FEC export for tax authorities

3. **Testing & QA**

   - Unit tests for backend controllers
   - Integration tests for API endpoints
   - E2E tests for critical user workflows
   - Performance testing/optimization

4. **Deployment**
   - Configure production environment
   - Set up CI/CD pipeline
   - Deploy to Vercel (frontend) and Heroku/Railway (backend)

---

**Test Date**: December 30, 2025
**Testers**: Development Team
**Status**: Ready for manual testing
