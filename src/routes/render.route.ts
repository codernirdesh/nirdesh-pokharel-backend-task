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

export default RenderRoute;
