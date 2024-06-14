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
const app = express();
app.use(cookieParser());

// Load environment variables
config();

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
