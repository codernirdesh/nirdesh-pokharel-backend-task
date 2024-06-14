import { Router } from "express";
import { TaskController } from "../controllers/task.controller";
import { authenticated } from "../middleware/auth.middleware";
import { role } from "../middleware/role.middleware";
import { Role } from "@prisma/client";
import { API_V1_PREFIX } from "../constants";
import { validationMiddleware } from "../middleware/validation.middleware";
import { ChangeStatusDto } from "../dto/change-status";

const TaskRoute = Router();

TaskRoute.post(
	`${API_V1_PREFIX}/task/`,
	authenticated,
	role(Role.ADMIN),
	TaskController.createTask
);
TaskRoute.get(
	`${API_V1_PREFIX}/task/all`,
	authenticated,
	role(Role.ADMIN),
	TaskController.getTasks
);
TaskRoute.get(
	`${API_V1_PREFIX}/task/my-tasks`,
	authenticated,
	TaskController.getMyTasks
);
TaskRoute.get(
	`${API_V1_PREFIX}/task/:id`,
	authenticated,
	TaskController.getTaskById
);
TaskRoute.put(
	`${API_V1_PREFIX}/task/:id`,
	validationMiddleware(ChangeStatusDto),
	authenticated,
	TaskController.changeStatus
);

export default TaskRoute;
