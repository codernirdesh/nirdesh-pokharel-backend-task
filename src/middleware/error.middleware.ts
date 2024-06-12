import { Request, Response, NextFunction } from "express";
import { IError } from "../types/error.type";

const errorMiddleware = (
	err: IError,
	req: Request,
	res: Response,
	next: NextFunction
) => {
	const statusCode = err.statusCode || 500;
	const errorMessage = err.message || "Something went wrong";
	const data = err.data || [];
	return res.status(statusCode).send({ message: errorMessage, data });
};

export default errorMiddleware;
