import { Router } from "express";
import { RenderController } from "../controllers/render.controller";
import { authenticatedUI } from "../middleware/auth.middleware";
import { roleUi } from "../middleware/role.middleware";

const RenderRoute = Router();

RenderRoute.get("/", authenticatedUI, RenderController.homepage);
RenderRoute.get("/login", RenderController.loginpage);
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
