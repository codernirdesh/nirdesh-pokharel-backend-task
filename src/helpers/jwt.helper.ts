import { JWT_EXPIRES_IN, JWT_SECRET } from "../constants";
import { JWTPayload } from "../types/jwt.payload";
import jwt from "jsonwebtoken";
import { CustomError } from "./error.helper";
import { StatusCodes } from "http-status-codes";

export class JWTHelper {
	/**
	 * Generates a JWT token with the specified payload.
	 *
	 * @param {JWTPayload} payload - The payload to be included in the JWT token.
	 * @return {string} The generated JWT token.
	 */
	public static generateToken(payload: JWTPayload): string {
		// If the JWT secret or expires in is not defined, throw an error
		if (!JWT_SECRET || !JWT_EXPIRES_IN) {
			console.log("🚀 ~ JWTHelper ~ generateToken ~ JWT_SECRET:", JWT_SECRET);
			console.log(
				"🚀 ~ JWTHelper ~ generateToken ~ JWT_EXPIRES_IN:",
				JWT_EXPIRES_IN
			);

			console.error(`JWT_SECRET or JWT_EXPIRES_IN is not defined.`);
			throw CustomError(
				StatusCodes.INTERNAL_SERVER_ERROR,
				"Something went wrong. Please try again later.",
				null
			);
		}
		// Generate the JWT token
		return jwt.sign(payload, JWT_SECRET, {
			expiresIn: JWT_EXPIRES_IN,
			algorithm: "HS256",
		});
	}

	/**
	 * Verifies the specified JWT token.
	 *
	 * @param {string} token - The JWT token to be verified.
	 * @return {any} The payload of the verified JWT token.
	 */
	public static verifyToken(token: string): any {
		// If the JWT secret is not defined, throw an error
		if (!JWT_SECRET) {
			console.error(`JWT_SECRET is not defined.`);
			throw CustomError(
				StatusCodes.INTERNAL_SERVER_ERROR,
				"Something went wrong. Please try again later.",
				null
			);
		}
		// Verify the JWT token
		return jwt.verify(token, JWT_SECRET);
	}
}
