import { StatusCodes } from "http-status-codes";

export interface IError {
	statusCode?: StatusCodes;
	data?: any[];
	message?: string;
}
