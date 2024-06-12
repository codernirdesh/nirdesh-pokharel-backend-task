import { NextFunction, Request, Response } from "express";
import { CreateUserDto } from "../dto/create-user.dto";
import bcrypt from "bcryptjs";
import prisma from "../prisma.client";
import { Role } from "@prisma/client";
import { CustomError } from "../helpers/error.helper";
import { StatusCodes } from "http-status-codes";
import { JWTHelper } from "../helpers/jwt.helper";
import { LoginDto } from "../dto/login.dto";

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
}