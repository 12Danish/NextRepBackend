import { stat } from "fs";

import { Request, Response, NextFunction } from "express";

const errHandlerMiddleware = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const statusCode = err.statusCode || 500;
  res.status(statusCode);
  res.json({
    title: err.title,
    message: err.message,
  });
};

export default errHandlerMiddleware;
