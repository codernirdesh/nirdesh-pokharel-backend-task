import { Role } from "@prisma/client";
import { IsString, IsNotEmpty, IsEnum, IsUUID, IsIn } from "class-validator";

export class ChangeRoleDto {
	@IsNotEmpty({
		message: "ID is required",
	})
	@IsString({
		message: "ID must be a string",
	})
	@IsUUID(4, {
		message: "ID must be a valid UUID",
	})
	id: string;

	@IsString({
		message: "Role must be a string",
	})
	@IsNotEmpty({
		message: "Role is required",
	})
	@IsEnum(Role, {
		message: "Role must be a valid role",
	})
	role: Role;
}
