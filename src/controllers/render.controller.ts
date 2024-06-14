import { Request, Response } from "express";
import prisma from "../prisma.client";
import { RequestWithUser } from "../types/request-user.type";
import { Prisma } from "@prisma/client";

export class RenderController {
	public static async homepage(req: RequestWithUser, res: Response) {
		const user = req.user!;
		const whereClause =
			user.role === "ADMIN" ? {} : { assignedId: user.userId };

		const orderBy: Prisma.TaskOrderByWithRelationInput = {
			updatedAt: "asc",
		};

		const include: Prisma.TaskInclude = {
			creator: {
				select: {
					id: true,
					name: true,
				},
			},
			assigned: {
				select: {
					id: true,
					name: true,
				},
			},
		};

		const open = await prisma.task.findMany({
			where: {
				...whereClause,
				status: "OPEN",
			},
			orderBy,
			include,
		});
		const pending = await prisma.task.findMany({
			where: {
				...whereClause,
				status: "IN_PROGRESS",
			},
			orderBy,
			include,
		});
		const done = await prisma.task.findMany({
			where: {
				...whereClause,
				status: "DONE",
			},
			orderBy,
			include,
		});
		const me = await prisma.user.findUnique({
			where: {
				id: user.userId,
			},
			omit: {
				password: true,
			},
		});
		res.render("index", {
			title: "Homepage",
			open: open.map((task) => {
				return {
					...task,
					createdAt: task.createdAt.toISOString().split("T")[0],
				};
			}),
			pending: pending.map((task) => {
				return {
					...task,
					createdAt: task.createdAt.toISOString().split("T")[0],
				};
			}),
			done: done.map((task) => {
				return {
					...task,
					createdAt: task.createdAt.toISOString().split("T")[0],
				};
			}),
			me,
		});
	}
	public static loginpage(req: Request, res: Response) {
		res.render("login", { title: "Login - Task Management" });
	}
	public static registerPage(req: Request, res: Response) {
		res.render("register", { title: "Register - Task Management" });
	}

	public static logout(req: Request, res: Response) {
		// Clear cookie
		res.clearCookie("token").render("logout");
	}

	public static async addTaskPage(req: RequestWithUser, res: Response) {
		const user = req.user!;
		const users = await prisma.user.findMany();
		res.render("add-task", { title: "Add Task", users, me: user });
	}
	public static async editTaskPage(req: RequestWithUser, res: Response) {
		const user = req.user!;
		const { id } = req.params;
		const task = await prisma.task.findUnique({
			where: {
				id: id,
			},
		});
		if (!task) {
			res.status(404).render("errors/404", {
				message: "The task you are looking for does not exist.",
			});
			return;
		}
		const users = await prisma.user.findMany();
		res.render("edit-task", { title: "Edit Task", users, me: user, task });
	}

	public static async userManagementPage(req: RequestWithUser, res: Response) {
		const user = req.user!;
		const users = await prisma.user.findMany({
			omit: {
				password: true,
			},
			orderBy: {
				createdAt: "asc",
			}
		});

		const me = await prisma.user.findUnique({
			where: {
				id: user.userId,
			},
			omit: {
				password: true,
			},
		});
		res.render("user-management", {
			title: "User Management",
			users: users.map((user) => {
				return {
					...user,
					createdAt: user.createdAt.toISOString().split("T")[0],
				};
			}),
			me,
		});
	}

	public static async addUserPage(req: RequestWithUser, res: Response) {
		const user = req.user!;
		const me = await prisma.user.findUnique({
			where: {
				id: user.userId,
			},
			omit: {
				password: true,
			},
		});
		res.render("add-user", { title: "Add User", me });
	}
	public static async editUserPage(req: RequestWithUser, res: Response) {
		const user = req.user!;
		const { id } = req.params;
		const userToEdit = await prisma.user.findUnique({
			where: {
				id: id,
			},
			omit: {
				password: true,
			},
		});

		if (!userToEdit) {
			res.status(404).render("errors/404", {
				message: "The user you are looking for does not exist.",
			});
			return;
		}

		const me = await prisma.user.findUnique({
			where: {
				id: user.userId,
			},
			omit: {
				password: true,
			},
		});
		res.render("edit-user", { title: "Edit User", me, user: userToEdit });
	}
}
