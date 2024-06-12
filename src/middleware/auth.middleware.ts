import { Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { CustomError } from "../helpers/error.helper";
import { JWTHelper } from "../helpers/jwt.helper";
import { RequestWithUser } from "../types/request-user.type";

export function authenticated(
	req: RequestWithUser,
	res: Response,
	next: NextFunction
) {
	const token = req.headers.get("authorization")?.split(" ")[1];
	if (!token) {
		throw CustomError(StatusCodes.UNAUTHORIZED, "Unauthorized", null);
	}

	// Verify token using JWtHelper
	const decoded = JWTHelper.verifyToken(token);
	if (!decoded) {
		throw CustomError(StatusCodes.UNAUTHORIZED, "Unauthorized", null);
	}

	req.user = decoded;
	next(); // Call next middleware
}
