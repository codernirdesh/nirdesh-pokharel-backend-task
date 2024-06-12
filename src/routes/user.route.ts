import { Router } from "express";
import { API_V1_PREFIX } from "../constants";
import { validationMiddleware } from "../middleware/validation.middleware";
import { CreateUserDto } from "../dto/create-user.dto";
import { UserController } from "../controllers/user.controller";
import { LoginDto } from "../dto/login.dto";
import { authenticated } from "../middleware/auth.middleware";

const UserRoute = Router();

UserRoute.post(
	`${API_V1_PREFIX}/register`,
	validationMiddleware(CreateUserDto),
	UserController.register
);
UserRoute.post(
	`${API_V1_PREFIX}/login`,
	validationMiddleware(LoginDto),
	UserController.login
);
UserRoute.get(`${API_V1_PREFIX}/user/me`, authenticated, UserController.me);

export default UserRoute;
