import { Router } from "express";
import { API_V1_PREFIX } from "../constants";
import { validationMiddleware } from "../middleware/validation.middleware";
import { CreateUserDto } from "../dto/create-user.dto";
import { UserController } from "../controllers/user.controller";
import { LoginDto } from "../dto/login.dto";
import { authenticated } from "../middleware/auth.middleware";
import { role } from "../middleware/role.middleware";
import { Role } from "@prisma/client";
import { ChangeRoleDto } from "../dto/change-role.dto";
import { TaskController } from "../controllers/task.controller";

const UserRoute = Router();

UserRoute.post(
	`${API_V1_PREFIX}/register`,
	validationMiddleware(CreateUserDto),
	UserController.register
);
UserRoute.post(
	`${API_V1_PREFIX}/user/register`,
	validationMiddleware(CreateUserDto),
	authenticated,
	role(Role.ADMIN),
	UserController.registerByAdmin
);
UserRoute.post(
	`${API_V1_PREFIX}/login`,
	validationMiddleware(LoginDto),
	UserController.login
);
UserRoute.get(`${API_V1_PREFIX}/user/me`, authenticated, UserController.me);
UserRoute.get(
	`${API_V1_PREFIX}/user/all`,
	authenticated,
	role(Role.ADMIN),
	UserController.getAllUsers
);
UserRoute.get(
	`${API_V1_PREFIX}/user/:id`,
	authenticated,
	role(Role.ADMIN),
	UserController.getUserById
);
UserRoute.get(
	`${API_V1_PREFIX}/user/:id/tasks`,
	authenticated,
	role(Role.ADMIN),
	TaskController.getTaskByUser
);
UserRoute.patch(
	`${API_V1_PREFIX}/user/change-role`,
	authenticated,
	role(Role.ADMIN),
	validationMiddleware(ChangeRoleDto),
	UserController.changeRole
);

export default UserRoute;
