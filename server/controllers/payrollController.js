import { StatusCodes } from "http-status-codes";
import Payroll from "../models/Payroll.js";

export const listPayrolls = async (req, res) => {
  try {
    const { companyId } = req.params;
    const payrolls = await Payroll.findAll({
      where: { company_id: companyId },
      order: [["period", "DESC"]],
    });
    res.status(StatusCodes.OK).json({ payrolls });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ msg: "Erreur liste paie", error: error.message });
  }
};
