import { JWTPayload } from "./jwt.payload";

export type RequestWithUser = Request & { user: JWTPayload };
