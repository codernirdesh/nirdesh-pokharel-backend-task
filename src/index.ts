import express, { Request, Response } from "express";
import { APP_PORT } from "./constants";
import UserRoute from "./routes/user.route";
import errorMiddleware from "./middleware/error.middleware";
import { loadEnvFile } from "node:process";
const app = express();

// Load environment variables
loadEnvFile();

// Using expresses built-in middleware to parse incoming requests with JSON payloads
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req: Request, res: Response) => {
	res.send("Hello World!");
});

// Routes
app.use(UserRoute);

// Error handling middleware
app.use(errorMiddleware);

app.listen(APP_PORT, () => {
	console.log(`Server is running on port ${APP_PORT}`);
});
