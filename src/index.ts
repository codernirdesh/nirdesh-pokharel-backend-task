import express, { Request, Response } from "express";
import { APP_PORT } from "./constants";
import UserRoute from "./routes/user.route";
import errorMiddleware from "./middleware/error.middleware";
import TaskRoute from "./routes/task.route";
import { config } from "dotenv";
import path from "path";
import RenderRoute from "./routes/render.route";
import cookieParser from "cookie-parser";
import compression from "compression";
import { createClient, RedisClientType } from "redis";

const app = express();
app.use(cookieParser());

// Load environment variables
config();

// REDIS Config

export let redisClient: RedisClientType;
export const REDIS_Expiration = 60 * 60 * 24; // 24 hours
(async () => {
	// redis is inside docker with container name `redis`
	redisClient = createClient({
		name: "redis",
		url: "redis://nirdesh:123456@redis:6379",
	});
	redisClient.on("error", (error) => {
		console.error(error);
	});
	redisClient.on("connect", () => {
		console.log(`Connected to Redis server with name Email and Password`);
	});
	redisClient.connect();
})();

export async function getResultFromCache(
	key: string,
	fetchResult: () => Promise<any>
) {
	let result = await redisClient.get(key);
	if (!result) {
		result = await fetchResult();
		await redisClient.set(key, JSON.stringify(result), {
			EX: REDIS_Expiration,
		});
	} else {
		result = JSON.parse(result);
	}
	return result as Object;
}

export async function setResultInCache(
	key: string,
	setResult: () => Promise<any>,
	expiration: number = REDIS_Expiration
) {
	let result = await setResult();
	await redisClient.del(key);
	await redisClient.set(key, JSON.stringify(result), {
		EX: expiration,
	});
	return result;
}

// Using expresses built-in middleware to parse incoming requests with JSON payloads
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Set View Engine to EJS
app.set("view engine", "ejs");
app.set("views", path.resolve("./src/views"));

app.get("/status", (req: Request, res: Response) => {
	res.send("Hello World!");
});

// Serve static files
app.use(express.static(path.resolve(__dirname, "public")));

// Routes
app.use(UserRoute);
app.use(TaskRoute);
app.use(RenderRoute);

// Error handling middleware
app.use(errorMiddleware);
app.use(compression);

app.listen(APP_PORT, () => {
	console.log(`Server is running on port ${APP_PORT}`);
});
