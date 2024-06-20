import { NextFunction, Request, Response } from "express";
import { CreateUserDto, UpdateUserDto } from "../dto/create-user.dto";
import bcrypt from "bcryptjs";
import prisma from "../prisma.client";
import { Role, user } from "@prisma/client";
import { CustomError } from "../helpers/error.helper";
import { StatusCodes } from "http-status-codes";
import { JWTHelper } from "../helpers/jwt.helper";
import { LoginDto } from "../dto/login.dto";
import { RequestWithUser } from "../types/request-user.type";
import { ChangeRoleDto } from "../dto/change-role.dto";
import { getResultFromCache, redisClient, setResultInCache } from "..";

export class UserController {
	public static async register(
		req: Request,
		res: Response,
		next: NextFunction
	) {
		const { name, email, password } = req.body as CreateUserDto;
		try {
			const totalUserCount = await prisma.user.count();
			let userRole: Role = Role.USER;

			// If the total user count is 0, set the first user as an admin
			if (totalUserCount === 0) {
				userRole = Role.ADMIN;
			} else {
				// Check if the user already exists or not.
				const userExists = await prisma.user.findUnique({
					where: {
						email,
					},
				});

				if (userExists) {
					throw CustomError(StatusCodes.CONFLICT, "User already exists", null);
				}
			}

			// Hash password
			const generatedSalt = await bcrypt.genSalt(10);
			const hashedPassword = await bcrypt.hash(password, generatedSalt);

			const token = await prisma.$transaction(async (tx) => {
				// Save user to database
				let user = await prisma.user.create({
					data: {
						name,
						email,
						password: hashedPassword,
						role: userRole,
					},
				});

				return JWTHelper.generateToken({
					userId: user.id,
					email: user.email,
					role: user.role,
				});
			});

			if (!token) {
				throw CustomError(
					StatusCodes.INTERNAL_SERVER_ERROR,
					"Something went wrong. Please try again later.",
					null
				);
			}

			return res.status(StatusCodes.CREATED).json({
				status: "success",
				message: "User registered successfully",
				data: {
					token,
				},
			});
		} catch (error) {
			next(error);
		}
	}
	public static async registerByAdmin(
		req: Request,
		res: Response,
		next: NextFunction
	) {
		const { name, email, password, role } = req.body as CreateUserDto;
		try {
			// Check if the user already exists or not.
			const userExists = await prisma.user.findUnique({
				where: {
					email,
				},
			});

			if (userExists) {
				throw CustomError(StatusCodes.CONFLICT, "User already exists", null);
			}

			// Hash password
			const generatedSalt = await bcrypt.genSalt(10);
			const hashedPassword = await bcrypt.hash(password, generatedSalt);

			const user = await prisma.$transaction(async (tx) => {
				// Save user to database
				let user = await prisma.user.create({
					data: {
						name,
						email,
						password: hashedPassword,
						role: role || Role.USER,
					},
					select: {
						id: true,
						name: true,
						email: true,
					},
				});
				return user;
			});

			if (!user) {
				throw CustomError(
					StatusCodes.INTERNAL_SERVER_ERROR,
					"Something went wrong. Please try again later.",
					null
				);
			}

			return res.status(StatusCodes.CREATED).json({
				status: "success",
				message: "User registered successfully",
				data: user,
			});
		} catch (error) {
			next(error);
		}
	}

	public static async login(req: Request, res: Response, next: NextFunction) {
		const { email, password } = req.body as LoginDto;
		try {
			const user = await prisma.user.findUnique({
				where: {
					email,
				},
			});

			if (!user) {
				throw CustomError(StatusCodes.NOT_FOUND, "User not found", null);
			}

			const isPasswordMatched = await bcrypt.compare(password, user.password);

			if (!isPasswordMatched) {
				throw CustomError(
					StatusCodes.UNAUTHORIZED,
					"Invalid credentials",
					null
				);
			}

			const token = JWTHelper.generateToken({
				userId: user.id,
				email: user.email,
				role: user.role,
			});

			res.cookie("token", token, {
				httpOnly: true,
				expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
				maxAge: 24 * 60 * 60 * 1000, // 24 hours
				sameSite: "strict", // CSRF protection
			});

			return res.status(StatusCodes.OK).json({
				status: "success",
				message: "User logged in successfully",
				data: {
					token,
				},
			});
		} catch (error) {
			next(error);
		}
	}

	public static async me(
		req: RequestWithUser,
		res: Response,
		next: NextFunction
	) {
		const user = req.user;
		try {
			const result = (await getResultFromCache(
				`user:${user!.userId}`,
				async () => {
					return await prisma.user.findUnique({
						where: {
							id: user!.userId,
						},
						omit: {
							password: true,
						},
					});
				}
			)) as user;
			return res.status(StatusCodes.OK).json({
				status: "success",
				message: "User details",
				data: result,
			});
		} catch (error) {
			next(error);
		}
	}

	public static async getAllUsers(
		req: RequestWithUser,
		res: Response,
		next: NextFunction
	) {
		try {
			let users;
			users = (await getResultFromCache("users", async () => {
				return await prisma.user.findMany({
					omit: {
						password: true,
					},
				});
			})) as user[];

			return res.status(StatusCodes.OK).json({
				status: "success",
				data: users,
			});
		} catch (error) {
			next(error);
		}
	}

	public static async getUserById(
		req: RequestWithUser,
		res: Response,
		next: NextFunction
	) {
		const { id } = req.params;
		try {
			let user;
			user = (await getResultFromCache(`user:${id}`, async () => {
				return await prisma.user.findUnique({
					where: {
						id,
					},
					omit: {
						password: true,
					},
				});
			})) as user;

			return res.status(StatusCodes.OK).json({
				status: "success",
				data: user,
			});
		} catch (error) {
			next(error);
		}
	}

	public static async changeRole(
		req: RequestWithUser,
		res: Response,
		next: NextFunction
	) {
		const { id, role } = req.body as ChangeRoleDto;
		try {
			const updatedUser = await prisma.user.update({
				where: {
					id,
				},
				data: {
					role,
				},
				omit: {
					password: true,
				},
			});

			await redisClient.del(`user:${id}`);

			return res.status(StatusCodes.OK).json({
				status: "success",
				data: updatedUser,
			});
		} catch (error) {
			next(error);
		}
	}

	public static async deleteUser(
		req: RequestWithUser,
		res: Response,
		next: NextFunction
	) {
		const { id } = req.params;
		const user = req.user!;
		try {
			// usercannot remove self
			if (id === user.userId) {
				throw CustomError(
					StatusCodes.FORBIDDEN,
					"You cannot delete yourself",
					null
				);
			}
			// check if the user exists or not.
			const userExists = await prisma.user.findUnique({
				where: {
					id,
				},
				omit: { password: true },
			});
			if (!userExists) {
				throw CustomError(StatusCodes.NOT_FOUND, "User not found", null);
			}
			await prisma.$transaction(async (tx) => {
				// assign all tasks to current user
				await tx.task.updateMany({
					where: {
						assignedId: id,
					},
					data: {
						assignedId: user.userId,
					},
				});

				await tx.user.delete({
					where: {
						id,
					},
				});
			});

			await redisClient.del(`user:${id}`);

			return res.status(StatusCodes.OK).json({
				status: "success",
				data: userExists,
			});
		} catch (error) {
			next(error);
		}
	}

	public static async updateUser(
		req: RequestWithUser,
		res: Response,
		next: NextFunction
	) {
		const { id } = req.params;
		const { name, email, role, password } = req.body as UpdateUserDto;
		try {
			const userExists = await prisma.user.findUnique({
				where: {
					id,
				},
			});

			if (!userExists) {
				throw CustomError(StatusCodes.NOT_FOUND, "User not found", null);
			}

			// Hash password
			let hashedPassword: string;
			if (password) {
				const generatedSalt = await bcrypt.genSalt(10);
				hashedPassword = await bcrypt.hash(password, generatedSalt);
			}

			const user = await setResultInCache(`user:${id}`, async () => {
				return await prisma.user.update({
					where: {
						id,
					},
					data: {
						name,
						email,
						role,
						password: hashedPassword,
					},
					omit: {
						password: true,
					},
				});
			});

			return res.status(StatusCodes.OK).json({
				status: "success",
				data: user,
			});
		} catch (error) {
			next(error);
		}
	}
}
