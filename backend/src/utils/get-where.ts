import { Role } from "../../generated/prisma/enums";
import { ValidateUser } from "../types";

export type WhereReturnType = { id: string; userId?: string };

export function getSecureWhere(id: string, user: ValidateUser) {
  const where: { id: string; userId?: string } = { id };

  // If the user is NOT an admin, enforce ownership
  if (user.role !== Role.admin) {
    where.userId = user.id;
  }

  return where;
}
