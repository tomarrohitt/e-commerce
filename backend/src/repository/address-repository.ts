import { Prisma } from "../../generated/prisma/client";
import { prisma } from "../config/prisma";
import {
  DatabaseError,
  safeQuery,
} from "../middleware/prisma-error-middleware";
import { ListAddressFilter } from "../types";

class AddressRepository {
  async create(userId: string, data: Omit<Prisma.AddressCreateInput, "user">) {
    return await safeQuery(
      () => {
        return prisma.address.create({
          data: {
            ...data,
            user: {
              connect: {
                id: userId,
              },
            },
          },
        });
      },
      { model: "Address", operation: "create" }
    );
  }

  async findById(id: string) {
    return await safeQuery(
      () =>
        prisma.address.findUnique({
          where: { id },
        }),
      { model: "Address", id, operation: "find" }
    );
  }

  async findByUserId(userId: string) {
    return await safeQuery(
      () =>
        prisma.address.findMany({
          where: { userId },
          orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
        }),
      { model: "Address", id: userId, operation: "find" }
    );
  }

  async list(filters: ListAddressFilter) {
    const { page = 1, limit = 20, search, zipCode, city, state } = filters;

    const skip = (page - 1) * limit;

    const where: Prisma.AddressWhereInput = {
      ...(zipCode && { zipCode }),
      ...(city && { city }),
      ...(state && { state }),

      ...(search && {
        OR: [
          { street: { contains: search, mode: "insensitive" } },
          { city: { contains: search, mode: "insensitive" } },
          { state: { contains: search, mode: "insensitive" } },
          { zipCode: { contains: search, mode: "insensitive" } },
        ],
      }),
    };

    const [addresses, total] = await Promise.all([
      prisma.address.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.address.count({ where }),
    ]);

    return {
      addresses,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async update(id: string, data: Prisma.AddressUpdateInput) {
    return await safeQuery(
      () => {
        const { isDefault, ...safeData } = data;

        if (isDefault !== undefined) {
          throw new DatabaseError(
            "Default address cannot be updated through this endpoint. Use /api/address/:id/default instead.",
            400,
            "INVALID_OPERATION"
          );
        }

        return prisma.address.update({
          where: { id },
          data: safeData,
        });
      },
      { model: "Address", id, operation: "update" }
    );
  }

  async delete(id: string) {
    return await safeQuery(
      () =>
        prisma.address.delete({
          where: { id },
        }),
      { model: "Address", id, operation: "delete" }
    );
  }

  async setAsDefaultAddress(userId: string, addressId: string) {
    return await safeQuery(
      async () => {
        return await prisma.$transaction(async (tx) => {
          await tx.address.updateMany({
            where: {
              userId,
            },
            data: {
              isDefault: false,
            },
          });

          await tx.address.update({
            where: { id: addressId },
            data: {
              isDefault: true,
            },
          });
        });
      },
      { model: "Address", id: addressId, operation: "setAsDefault" }
    );
  }

  async getDefaultAddress(userId: string) {
    return await safeQuery(
      () =>
        prisma.address.findFirst({
          where: {
            userId,
            isDefault: true,
          },
        }),
      { model: "Address", id: userId, operation: "getDefaultAddress" }
    );
  }

  async findFirst(userId: string) {
    return await safeQuery(
      () =>
        prisma.address.findMany({
          where: { userId },
        }),
      { model: "Address", id: userId, operation: "find" }
    );
  }
}

export default new AddressRepository();
