import { StatusCodes } from "http-status-codes";

const authenticate = (req, res, next) => {
  next();
};

const authorize = (...roles) => {
  return (req, res, next) => {
    next();
  };
};

export { authenticate, authorize };
