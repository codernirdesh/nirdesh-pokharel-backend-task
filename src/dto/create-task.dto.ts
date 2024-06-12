import { TaskStatus } from "@prisma/client";
import {
	IsUUID,
	IsString,
	IsOptional,
	IsEnum,
	IsDateString,
	IsNotEmpty,
	MinLength,
} from "class-validator";

export class CreateTaskDto {
	@IsString({
		message: "Title must be a string",
	})
	@IsNotEmpty({
		message: "Title is required",
	})
	@MinLength(3, {
		message: "Title must be at least 3 characters long",
	})
	title: string;

	@IsString({
		message: "Description must be a string",
	})
	@IsOptional()
	description?: string;

	@IsEnum(TaskStatus)
	@IsOptional()
	status: TaskStatus = TaskStatus.OPEN;

	@IsUUID(4, {
		message: "Assigned ID must be a valid UUID",
	})
	@IsString()
	assignedId: string;
}
