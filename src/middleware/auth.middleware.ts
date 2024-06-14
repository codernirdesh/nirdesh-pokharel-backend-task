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
	const bearerToken = req.header("authorization")?.split(" ")[1];
	const cookieToken = req.cookies.token;
	const token = bearerToken || cookieToken;

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

export function authenticatedUI(
	req: RequestWithUser,
	res: Response,
	next: NextFunction
) {
	const bearerToken = req.header("authorization")?.split(" ")[1];
	const cookieToken = req.cookies.token;
	const token = bearerToken || cookieToken;

	if (!token) {
		return res.redirect("/login");
	}

	// Verify token using JWtHelper
	const decoded = JWTHelper.verifyToken(token);
	if (!decoded) {
		return res.redirect("/login");
	}

	req.user = decoded;
	next(); // Call next middleware
}
