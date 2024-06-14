import { Response, NextFunction } from "express";
import { RequestWithUser } from "../types/request-user.type";
import { CustomError } from "../helpers/error.helper";
import { StatusCodes } from "http-status-codes";
import { Role } from "@prisma/client";

export function role(role: Role) {
	return function (req: RequestWithUser, res: Response, next: NextFunction) {
		if (!req.user || req.user?.role !== role) {
			throw CustomError(StatusCodes.FORBIDDEN, "Forbidden", null);
		}

		next();
	};
}

export function roleUi(role: Role) {
	return function (req: RequestWithUser, res: Response, next: NextFunction) {
		if (!req.user || req.user?.role !== role) {
			return res.render("errors/401", {
				message: "You are not authorized to view this page",
				role: role,
			});
		}

		next();
	};
}
