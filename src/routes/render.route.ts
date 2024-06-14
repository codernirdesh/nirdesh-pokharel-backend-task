import { Router } from "express";
import { RenderController } from "../controllers/render.controller";
import {
	authenticatedUI,
	onlyUnAuthenticated,
} from "../middleware/auth.middleware";
import { roleUi } from "../middleware/role.middleware";

const RenderRoute = Router();

RenderRoute.get("/", authenticatedUI, RenderController.homepage);
RenderRoute.get("/login", onlyUnAuthenticated, RenderController.loginpage);
RenderRoute.get(
	"/register",
	onlyUnAuthenticated,
	RenderController.registerPage
);
RenderRoute.get("/logout", authenticatedUI, RenderController.logout);
RenderRoute.get(
	"/add-task",
	authenticatedUI,
	roleUi("ADMIN"),
	RenderController.addTaskPage
);
RenderRoute.get(
	"/edit-task/:id",
	authenticatedUI,
	roleUi("ADMIN"),
	RenderController.editTaskPage
);
RenderRoute.get(
	"/users",
	authenticatedUI,
	roleUi("ADMIN"),
	RenderController.userManagementPage
);
RenderRoute.get(
	"/add-user",
	authenticatedUI,
	roleUi("ADMIN"),
	RenderController.addUserPage
);
RenderRoute.get(
	"/edit-user/:id",
	authenticatedUI,
	roleUi("ADMIN"),
	RenderController.editUserPage
);

export default RenderRoute;
