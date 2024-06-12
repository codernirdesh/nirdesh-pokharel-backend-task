import { NextFunction, Request, Response } from "express";
import { CreateUserDto } from "../dto/create-user.dto";
import bcrypt from "bcryptjs";
import prisma from "../prisma.client";
import { Role } from "@prisma/client";
import { CustomError } from "../helpers/error.helper";
import { StatusCodes } from "http-status-codes";
import { JWTHelper } from "../helpers/jwt.helper";

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
}
