import type { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import prisma from "../prisma.client";
import type { CreateTaskDto } from "../dto/create-task.dto";
import type { RequestWithUser } from "../types/request-user.type";
import { CustomError } from "../helpers/error.helper";
import { TaskStatus, type Task } from "@prisma/client";
import { ChangeStatusDto } from "../dto/change-status";
import { getResultFromCache, redisClient, setResultInCache } from "..";

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
			setResultInCache(`task:${task.id}`, async () => {
				return task;
			});
			redisClient.del("tasks");

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
			let tasks;
			tasks = await getResultFromCache("tasks", async () => {
				return await prisma.task.findMany();
			});

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
				task = await getResultFromCache(`task:${id}`, async () => {
					return await prisma.task.findUnique({
						where: {
							id,
						},
					});
				});
			}
			if (user.role === "USER") {
				task = await getResultFromCache(
					`task:${id}:user:${user.userId}`,
					async () => {
						return await prisma.task.findFirst({
							where: {
								id,
								assignedId: user.userId,
							},
						});
					}
				);
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
		req: RequestWithUser,
		res: Response,
		next: NextFunction
	) {
		const user = req.user!;
		const { id } = req.params;
		const { title, description, status, assignedId } =
			req.body as Partial<CreateTaskDto>;
		try {
			let taskExists = (await getResultFromCache(`task:${id}`, async () => {
				return await prisma.task.findUnique({
					where: {
						id,
					},
				});
			})) as Task | null;

			if (!taskExists) {
				throw CustomError(StatusCodes.NOT_FOUND, "Task not found", null);
			}
			const task = await prisma.task.update({
				where: {
					id,
				},
				data: {
					title,
					status: (status ? status : taskExists.status) as TaskStatus,
					assignedId,
					description,
				},
			});

			// If the task is assigned to the user, update the cache
			if (taskExists.assignedId === assignedId) {
				setResultInCache(`task:${id}:user:${assignedId}`, async () => {
					return task;
				});
			}

			// Clear cache and set new value
			if (user.role === "USER") {
				setResultInCache(`tasks:user:${user.userId}`, async () => {
					return await prisma.task.findMany({
						where: {
							assignedId: user.userId,
						},
					});
				});
			}
			setResultInCache(`task:${id}`, async () => {
				return task;
			});
			setResultInCache(`tasks`, async () => {
				return await prisma.task.findMany();
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
				tasks = (await getResultFromCache("tasks", async () => {
					return await prisma.task.findMany();
				})) as Task[];
			}

			if (user.role === "USER") {
				tasks = (await getResultFromCache(
					`tasks:user:${user.userId}`,
					async () => {
						return await prisma.task.findMany({
							where: {
								assignedId: user.userId,
							},
						});
					}
				)) as Task[];
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
		const user = req.user!;
		const { id } = req.params;
		const { assignedId } = req.body;
		try {
			const taskExists = (await getResultFromCache(`task:${id}`, async () => {
				return await prisma.task.findUnique({
					where: {
						id,
					},
				});
			})) as Task | null;

			if (!taskExists) {
				throw CustomError(StatusCodes.NOT_FOUND, "Task not found", null);
			}
			const task = await prisma.task.update({
				where: {
					id,
				},
				data: {
					assignedId,
				},
			});

			if (taskExists.assignedId === assignedId) {
				setResultInCache(`task:${id}:user:${assignedId}`, async () => {
					return task;
				});
			}

			// Clear cache and set new value
			if (user.role === "USER") {
				setResultInCache(`tasks:user:${user.userId}`, async () => {
					return await prisma.task.findMany({
						where: {
							assignedId: user.userId,
						},
					});
				});
			}
			setResultInCache(`task:${id}`, async () => {
				return task;
			});
			setResultInCache(`tasks`, async () => {
				return await prisma.task.findMany();
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
			const tasks = await getResultFromCache(
				`tasks:user:${userId}`,
				async () => {
					return await prisma.task.findMany({
						where: {
							assignedId: userId,
						},
					});
				}
			);

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
			const taskExists = (await getResultFromCache(`task:${id}`, async () => {
				return await prisma.task.findUnique({
					where: {
						id,
					},
				});
			})) as Task | null;

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

			const task = await setResultInCache(`task:${id}`, async () => {
				return await prisma.task.update({
					where: { id },
					data: {
						status: status as TaskStatus,
					},
				});
			});

			return res.status(StatusCodes.OK).json({
				status: "success",
				data: task,
			});
		} catch (error) {
			next(error);
		}
	}

	public static async deleteTask(
		req: Request,
		res: Response,
		next: NextFunction
	) {
		const { id } = req.params;
		try {
			const taskExists = await prisma.task.findUnique({
				where: {
					id,
				},
			});

			if (!taskExists) {
				throw CustomError(StatusCodes.NOT_FOUND, "Task not found", null);
			}

			await prisma.task.delete({
				where: {
					id,
				},
			});
			await redisClient.del(`task:${id}`);
			// Clear cache and set new value
			await redisClient.del(`task:${id}`);
			await redisClient.del(`task:${id}:user:${taskExists.assignedId}`);
			await redisClient.del(`tasks:user:${taskExists.assignedId}`);

			return res.status(StatusCodes.OK).json({
				status: "success",
				data: null,
			});
		} catch (error) {
			next(error);
		}
	}
}
