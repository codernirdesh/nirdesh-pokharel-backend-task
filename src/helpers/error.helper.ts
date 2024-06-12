import { StatusCodes } from "http-status-codes";
import { IError } from "../types/error.type";

/**
 * Creates an error object with the specified status code, message, and data.
 *
 * @param {number} statusCode - The status code of the error.
 * @param {string} message - The message describing the error.
 * @param {any} data - Additional data related to the error.
 * @return {IError} The created error object.
 */
export function CustomError(
	statusCode: StatusCodes,
	message: string,
	data: any
): IError {
	const error: IError = new Error();
	error.statusCode = statusCode;
	error.message = message;
	error.data = data;
	return error;
}
