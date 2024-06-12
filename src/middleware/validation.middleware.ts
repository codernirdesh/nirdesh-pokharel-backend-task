import { plainToInstance } from "class-transformer";
import { validate, ValidationError } from "class-validator";
import { Request, Response, NextFunction } from "express";
import { CustomError } from "../helpers/error.helper";
import { StatusCodes } from "http-status-codes";

export function validationMiddleware<T>(
	type: any
): (req: Request, res: Response, next: NextFunction) => void {
	return (req: Request, res: Response, next: NextFunction) => {
		const dto = plainToInstance(type, req.body);
		validate(dto).then((errors: ValidationError[]) => {
			if (errors.length > 0) {
				const message = errors
					.map((error) => Object.values(error.constraints || {}).join(", "))
					.join(", ");
				res.send(
					CustomError(StatusCodes.BAD_REQUEST, "Validation Error", message)
				);
			} else {
				req.body = dto as T;
				next();
			}
		});
	};
}
