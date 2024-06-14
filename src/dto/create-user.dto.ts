import { Role } from "@prisma/client";
import {
	IsEmail,
	IsEnum,
	IsNotEmpty,
	IsOptional,
	MinLength,
} from "class-validator";

export class CreateUserDto {
	@IsNotEmpty()
	@IsEmail()
	email: string;

	@IsNotEmpty()
	@MinLength(6)
	name: string;

	@IsOptional()
	@IsEnum(Role)
	role?: Role = Role.USER;

	@IsNotEmpty()
	// @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/, {
	// 	message:
	// 		"Password must be at least 8 characters long and contain at least one lowercase, uppercase letter, and number.",
	// })
	password: string;
}

export class UpdateUserDto {
	@IsOptional()
	@IsEmail()
	email?: string;

	@IsOptional()
	@MinLength(6)
	name?: string;

	@IsOptional()
	@IsEnum(Role)
	role?: Role;

	@IsOptional()
	// @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/, {
	// 	message:
	// 		"Password must be at least 8 characters long and contain at least one lowercase, uppercase letter, and number.",
	// })
	password?: string;
}
