import { Router } from "express";
import { API_V1_PREFIX } from "../constants";
import { validationMiddleware } from "../middleware/validation.middleware";
import { CreateUserDto } from "../dto/create-user.dto";
import { UserController } from "../controllers/user.controller";

const UserRoute = Router();

UserRoute.get(
	`${API_V1_PREFIX}/register`,
	validationMiddleware(CreateUserDto),
	UserController.register
);

export default UserRoute;
