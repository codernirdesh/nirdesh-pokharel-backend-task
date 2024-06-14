import type { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import prisma from "../prisma.client";
import type { CreateTaskDto } from "../dto/create-task.dto";
import type { RequestWithUser } from "../types/request-user.type";
import { CustomError } from "../helpers/error.helper";
import { TaskStatus, type Task } from "@prisma/client";
import { ChangeStatusDto } from "../dto/change-status";

export class TaskController {
	public static async createTask(
		req: RequestWithUser,
		res: Response,
		next: NextFunction
	) {
		const { title, description, assignedId } = req.body as CreateTaskDto;
		const user = req.user!;
		try {
			const task = await prisma.task.create({
				data: {
					title,
					description,
					assignedId,
					creatorId: user.userId,
				},
			});

			return res.status(StatusCodes.CREATED).json({
				status: "success",
				data: task,
			});
		} catch (error) {
			next(error);
		}
	}

	public static async getTasks(
		req: Request,
		res: Response,
		next: NextFunction
	) {
		try {
			const tasks = await prisma.task.findMany();

			return res.status(StatusCodes.OK).json({
				status: "success",
				data: tasks,
			});
		} catch (error) {
			next(error);
		}
	}

	public static async getTaskById(
		req: RequestWithUser,
		res: Response,
		next: NextFunction
	) {
		const { id } = req.params;
		const user = req.user!;
		try {
			let task;

			if (user.role === "ADMIN") {
				task = await prisma.task.findUnique({
					where: {
						id,
					},
				});
			}
			if (user.role === "USER") {
				task = await prisma.task.findUnique({
					where: {
						id,
						assignedId: user.userId,
					},
				});
			}

			if (!task) {
				throw CustomError(StatusCodes.NOT_FOUND, "Task not found", null);
			}

			return res.status(StatusCodes.OK).json({
				status: "success",
				data: task,
			});
		} catch (error) {
			next(error);
		}
	}

	public static async updateTask(
		req: Request,
		res: Response,
		next: NextFunction
	) {
		const { id } = req.params;
		const { title, description } = req.body as Partial<CreateTaskDto>;
		try {
			const taskExists = await prisma.task.findUnique({
				where: {
					id,
				},
			});

			if (!taskExists) {
				throw CustomError(StatusCodes.NOT_FOUND, "Task not found", null);
			}

			const task = await prisma.task.update({
				where: {
					id,
				},
				data: {
					title,
					description,
				},
			});

			return res.status(StatusCodes.OK).json({
				status: "success",
				data: task,
			});
		} catch (error) {
			next(error);
		}
	}

	// Get my assigned tasks
	public static async getMyTasks(
		req: RequestWithUser,
		res: Response,
		next: NextFunction
	) {
		const user = req.user!;
		try {
			let tasks: Task[] = [];

			if (user.role === "ADMIN") {
				tasks = await prisma.task.findMany();
			}

			if (user.role === "USER") {
				tasks = await prisma.task.findMany({
					where: {
						assignedId: user.userId,
					},
				});
			}

			return res.status(StatusCodes.OK).json({
				status: "success",
				data: tasks,
			});
		} catch (error) {
			next(error);
		}
	}

	public static async assignTask(
		req: RequestWithUser,
		res: Response,
		next: NextFunction
	) {
		const { id } = req.params;
		const { assignedId } = req.body;
		try {
			const task = await prisma.task.update({
				where: {
					id,
				},
				data: {
					assignedId,
				},
			});

			return res.status(StatusCodes.OK).json({
				status: "success",
				data: task,
			});
		} catch (error) {
			next(error);
		}
	}

	public static async getTaskByUser(
		req: RequestWithUser,
		res: Response,
		next: NextFunction
	) {
		const userId = req.params.id;
		try {
			const tasks = await prisma.task.findMany({
				where: {
					assignedId: userId,
				},
			});

			return res.status(StatusCodes.OK).json({
				status: "success",
				data: tasks,
			});
		} catch (error) {
			next(error);
		}
	}

	public static async changeStatus(
		req: RequestWithUser,
		res: Response,
		next: NextFunction
	) {
		const { id } = req.params;
		const { status } = req.body as ChangeStatusDto;
		const user = req.user!;
		try {
			const taskExists = await prisma.task.findUnique({
				where: {
					id,
				},
			});

			if (!taskExists) {
				throw CustomError(StatusCodes.NOT_FOUND, "Task not found", null);
			}

			// User can only change status of tasks assigned to them
			// Admin can change status of any task
			if (user.role !== "ADMIN" && taskExists.assignedId !== user.userId) {
				throw CustomError(
					StatusCodes.FORBIDDEN,
					"Not authorized to change status of this task",
					null
				);
			}

			const task = await prisma.task.update({
				where: { id },
				data: {
					status: status as TaskStatus,
				},
			});

			return res.status(StatusCodes.OK).json({
				status: "success",
				data: task,
			});
		} catch (error) {
			next(error);
		}
	}
}
