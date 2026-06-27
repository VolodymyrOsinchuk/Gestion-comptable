import TVAReport from "../models/TVAReport.js";
import { TVAItem } from "../models/index.js";
import sequelize from "../config/db.js";

/**
 * Create a new TVA report with optional items
 * body: { period, regime, due_date, notes, items: [{ rate, base_ht, tva_collected, tva_deductible }] }
 */
export const createReport = async (req, res) => {
  const { period, regime, due_date, notes, items = [] } = req.body;
  try {
    const result = await sequelize.transaction(async (t) => {
      const report = await TVAReport.create(
        { period, regime, due_date, notes },
        { transaction: t }
      );

      if (items.length) {
        const itemsToCreate = items.map((it) => ({
          ...it,
          net: Math.round(
            (parseFloat(it.tva_collected || 0) -
              parseFloat(it.tva_deductible || 0)) * 100
          ) / 100,
          tva_report_id: report.id,
        }));
        await TVAItem.bulkCreate(itemsToCreate, { transaction: t });
      }

      return report;
    });

    return res.status(201).json({ message: "Report created", report: result });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Unable to create report" });
  }
};

export const listReports = async (req, res) => {
  try {
    const reports = await TVAReport.findAll({
      include: [{ model: TVAItem, as: "items" }],
      order: [["period", "DESC"]],
    });
    return res.json(reports);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Unable to fetch reports" });
  }
};

export const getReport = async (req, res) => {
  const { id } = req.params;
  try {
    const report = await TVAReport.findByPk(id, {
      include: [{ model: TVAItem, as: "items" }],
    });
    if (!report) return res.status(404).json({ error: "Report not found" });
    return res.json(report);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Unable to fetch report" });
  }
};

/**
 * Calculate totals for a report from its items.
 * If items are provided in body, they will replace existing items before calculation.
 * body: { items?: [...] }
 */
export const calculateReport = async (req, res) => {
  const { id } = req.params;
  const { items } = req.body;
  try {
    const result = await sequelize.transaction(async (t) => {
      const report = await TVAReport.findByPk(id, { transaction: t });
      if (!report) throw new Error("Report not found");

      if (Array.isArray(items)) {
        // replace items
        await TVAItem.destroy({ where: { tva_report_id: id }, transaction: t });
        const itemsToCreate = items.map((it) => ({
          ...it,
          net: Math.round(
            (parseFloat(it.tva_collected || 0) -
              parseFloat(it.tva_deductible || 0)) * 100
          ) / 100,
          tva_report_id: id,
        }));
        await TVAItem.bulkCreate(itemsToCreate, { transaction: t });
      }

      const savedItems = await TVAItem.findAll({
        where: { tva_report_id: id },
        transaction: t,
      });

      const totals = savedItems.reduce(
        (acc, it) => {
          acc.total_collected += parseFloat(it.tva_collected || 0);
          acc.total_deductible += parseFloat(it.tva_deductible || 0);
          return acc;
        },
        { total_collected: 0, total_deductible: 0 }
      );

      const net = totals.total_collected - totals.total_deductible;

      report.total_collected = Number(totals.total_collected.toFixed(2));
      report.total_deductible = Number(totals.total_deductible.toFixed(2));
      report.net = Number(net.toFixed(2));
      report.status = "calculated";

      await report.save({ transaction: t });

      return { report, items: savedItems };
    });

    return res.json({
      message: "Calcul effectué",
      report: result.report,
      items: result.items,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message || "Calculation failed" });
  }
};

/**
 * Placeholder to "generate" CA3 declaration.
 * In a real app this would build the CA3 payload and export PDF or send to external API.
 */
export const generateCA3 = async (req, res) => {
  const { id } = req.params;
  try {
    const report = await TVAReport.findByPk(id, {
      include: [{ model: TVAItem, as: "items" }],
    });
    if (!report) return res.status(404).json({ error: "Report not found" });

    // Build a minimal CA3 payload
    const payload = {
      period: report.period,
      regime: report.regime,
      total_collected: report.total_collected,
      total_deductible: report.total_deductible,
      net: report.net,
      items: report.items.map((it) => ({
        rate: it.rate,
        base_ht: it.base_ht,
        tva_collected: it.tva_collected,
        tva_deductible: it.tva_deductible,
        net: it.net,
      })),
    };

    // mark as declared (example)
    report.status = "declared";
    await report.save();

    return res.json({ message: "CA3 generated (payload)", payload });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Unable to generate CA3" });
  }
};
