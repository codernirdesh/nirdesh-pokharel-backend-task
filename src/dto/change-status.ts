import { TaskStatus } from "@prisma/client";
import { IsNotEmpty, IsEnum } from "class-validator";

export class ChangeStatusDto {
	@IsNotEmpty({ message: "Status is required" })
	@IsEnum(TaskStatus, { message: "Status must be a valid status" })
	status: TaskStatus;
}
