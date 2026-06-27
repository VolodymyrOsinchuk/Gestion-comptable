import { StatusCodes } from "http-status-codes";
import { executeClosure, getClosureStatus, getBalanceSheet } from "../services/clotureService.js";

export const closeFiscalYear = async (req, res) => {
  try {
    const { companyId } = req.params;
    const { year } = req.body;

    if (!year) {
      return res.status(StatusCodes.BAD_REQUEST).json({ msg: "L'année est requise." });
    }

    const result = await executeClosure(Number(companyId), Number(year));
    res.status(StatusCodes.OK).json({
      msg: `Clôture de l'exercice ${year} réussie.`,
      ...result,
    });
  } catch (error) {
    res.status(StatusCodes.BAD_REQUEST).json({
      msg: "Erreur lors de la clôture",
      error: error.message,
    });
  }
};

export const getStatus = async (req, res) => {
  try {
    const { companyId, year } = req.params;
    const status = await getClosureStatus(Number(companyId), Number(year));
    res.status(StatusCodes.OK).json(status);
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      msg: "Erreur lors de la récupération du statut",
      error: error.message,
    });
  }
};

export const getBilan = async (req, res) => {
  try {
    const { companyId, year } = req.params;
    const bilan = await getBalanceSheet(Number(companyId), Number(year));
    res.status(StatusCodes.OK).json(bilan);
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      msg: "Erreur lors de la récupération du bilan",
      error: error.message,
    });
  }
};
