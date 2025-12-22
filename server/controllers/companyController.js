// ============================================
// FILE: controllers/companyController.js
// ============================================
import { Company } from "../models/index.js";
import { Op } from "sequelize";
import sequelize from "../config/db.js";
// @desc    Get all companies
// @route   GET /api/companies
export const getAllCompanies = async (req, res) => {
  try {
    const { status, search, limit = 50, offset = 0 } = req.query;

    const where = {};
    if (status) where.status = status;
    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { siret: { [Op.like]: `%${search}%` } },
      ];
    }

    const companies = await Company.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [["name", "ASC"]],
    });

    res.json({
      success: true,
      count: companies.count,
      data: companies.rows,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching companies",
      error: error.message,
    });
  }
};

// @desc    Get single company
// @route   GET /api/companies/:id
export const getCompany = async (req, res) => {
  try {
    const company = await Company.findByPk(req.params.id);

    if (!company) {
      return res.status(404).json({
        success: false,
        message: "Company not found",
      });
    }

    res.json({
      success: true,
      data: company,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching company",
      error: error.message,
    });
  }
};

// @desc    Create company
// @route   POST /api/companies
export const createCompany = async (req, res) => {
  try {
    // Extract SIREN from SIRET (first 9 digits)
    if (req.body.siret && !req.body.siren) {
      req.body.siren = req.body.siret.substring(0, 9);
    }

    const company = await Company.create(req.body);

    res.status(201).json({
      success: true,
      data: company,
    });
  } catch (error) {
    const payload = {
      success: false,
      message: "Error creating company",
    };
    if (
      error.name === "SequelizeValidationError" ||
      error.name === "SequelizeUniqueConstraintError"
    ) {
      payload.details = error.errors.map((e) => ({
        path: e.path,
        message: e.message,
      }));
    } else {
      payload.error = error.message;
    }
    res.status(400).json(payload);
  }
};

// @desc    Update company
// @route   PUT /api/companies/:id
export const updateCompany = async (req, res) => {
  try {
    const company = await Company.findByPk(req.params.id);

    if (!company) {
      return res.status(404).json({
        success: false,
        message: "Company not found",
      });
    }

    // Update SIREN if SIRET changed
    if (req.body.siret && req.body.siret !== company.siret) {
      req.body.siren = req.body.siret.substring(0, 9);
    }

    await company.update(req.body);

    res.json({
      success: true,
      data: company,
    });
  } catch (error) {
    const payload = {
      success: false,
      message: "Error updating company",
    };
    if (
      error.name === "SequelizeValidationError" ||
      error.name === "SequelizeUniqueConstraintError"
    ) {
      payload.details = error.errors.map((e) => ({
        path: e.path,
        message: e.message,
      }));
    } else {
      payload.error = error.message;
    }
    res.status(400).json(payload);
  }
};

// @desc    Delete company
// @route   DELETE /api/companies/:id
export const deleteCompany = async (req, res) => {
  try {
    const company = await Company.findByPk(req.params.id);

    if (!company) {
      return res.status(404).json({
        success: false,
        message: "Company not found",
      });
    }

    // Soft delete - set status to inactive instead of deleting
    await company.update({ status: "inactive" });

    res.json({
      success: true,
      message: "Company deactivated successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting company",
      error: error.message,
    });
  }
};

// @desc    Get company statistics
// @route   GET /api/companies/stats
export const getCompanyStats = async (req, res) => {
  try {
    const stats = await Company.findAll({
      attributes: [
        "status",
        [sequelize.fn("COUNT", sequelize.col("id")), "count"],
      ],
      group: ["status"],
    });

    const totalCompanies = await Company.count();
    const activeCompanies = await Company.count({
      where: { status: "active" },
    });

    res.json({
      success: true,
      data: {
        total: totalCompanies,
        active: activeCompanies,
        byStatus: stats,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching statistics",
      error: error.message,
    });
  }
};

// @desc    Validate SIRET
// @route   POST /api/companies/validate-siret
export const validateSIRET = async (req, res) => {
  try {
    const { siret } = req.body;

    // Check format
    if (!/^\d{14}$/.test(siret)) {
      return res.status(400).json({
        success: false,
        message: "SIRET must be 14 digits",
      });
    }

    // Check if already exists
    const existing = await Company.findOne({ where: { siret } });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: "SIRET already exists",
      });
    }

    // Luhn algorithm validation
    let sum = 0;
    for (let i = 0; i < 14; i++) {
      let digit = parseInt(siret[i]);
      if (i % 2 === 1) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }
      sum += digit;
    }

    const isValid = sum % 10 === 0;

    res.json({
      success: true,
      data: {
        siret,
        isValid,
        siren: siret.substring(0, 9),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error validating SIRET",
      error: error.message,
    });
  }
};
