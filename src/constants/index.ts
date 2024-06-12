import { loadEnvFile } from "node:process";

loadEnvFile();

export const APP_PORT = parseInt(process.env.PORT ?? "3000", 10);
export const API_V1_PREFIX = "/api/v1";
export const JWT_SECRET = process.env.JWT_SECRET;
export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN;
