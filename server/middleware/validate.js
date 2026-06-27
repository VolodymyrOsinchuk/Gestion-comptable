import { z } from "zod";
import { StatusCodes } from "http-status-codes";

const validate = (schema) => (req, res, next) => {
  try {
    schema.parse(req.body);
    next();
  } catch (error) {
    const errors = error.errors.map((e) => ({
      field: e.path.join("."),
      message: e.message,
    }));
    res.status(StatusCodes.BAD_REQUEST).json({ msg: "Erreur de validation", errors });
  }
};

const companySchema = z.object({
  name: z.string().min(1, "Le nom est requis"),
  siren: z.string().length(9, "Le SIREN doit faire 9 caractères").optional(),
  siret: z.string().length(14, "Le SIRET doit faire 14 caractères").optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  postal_code: z.string().optional(),
  email: z.string().email("Email invalide").optional().or(z.literal("")),
  phone: z.string().optional(),
  vat_number: z.string().optional(),
  legal_form: z.string().optional(),
  capital: z.number().optional(),
});

const documentSchema = z.object({
  reference: z.string().min(1, "La référence est requise"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date invalide (format YYYY-MM-DD)"),
  due_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date invalide").optional().or(z.literal("")),
  type: z.enum(["invoice", "credit_note", "payment", "expense", "other"], { message: "Type invalide" }).optional(),
  supplier: z.string().optional(),
  amount_ht: z.number().optional(),
  amount_tva: z.number().optional(),
  amount_ttc: z.number().optional(),
  payment_method: z.string().optional(),
  status: z.enum(["pending", "validated", "cancelled", "brouillon"]).optional(),
  notes: z.string().optional(),
});

const chartAccountSchema = z.object({
  account_number: z.string().min(1, "Le numéro de compte est requis").max(20),
  account_label: z.string().min(1, "Le libellé est requis"),
  account_type: z.enum(["asset", "liability", "equity", "revenue", "expense", "special"]),
  account_class: z.number().int().min(1).max(9),
  parent_account: z.string().max(20).optional().or(z.literal("")),
  is_active: z.boolean().optional(),
  can_reconcile: z.boolean().optional(),
  requires_third_party: z.boolean().optional(),
  tva_applicable: z.boolean().optional(),
  default_tva_rate: z.number().optional().nullable(),
  notes: z.string().optional().or(z.literal("")),
});

export { validate, companySchema, documentSchema, chartAccountSchema };
