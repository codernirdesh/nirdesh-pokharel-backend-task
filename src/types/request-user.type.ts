import { JWTPayload } from "./jwt.payload";
import { Request } from "express";

export interface RequestWithUser extends Request {
	user?: JWTPayload;
}
