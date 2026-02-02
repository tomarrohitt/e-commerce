import { Prisma } from ".prisma/client";
import { prisma } from "../config/prisma";
import { NotFoundError, safeQuery } from "@ecommerce/common";
import {
  AdminListUsersQuery,
  AdminUpdateUserInput,
} from "../lib/admin-validation-schema";
import {
  AdminListAddressQuery,
  AdminUpdateAddressInput,
} from "../lib/address-validation-schema";

class AdminService {
  async findAllUsers(filters: AdminListUsersQuery) {
    return await safeQuery(
      async () => {
        const { page, limit, search, role, emailVerified, sortBy, sortOrder } =
          filters;
        const skip = (page - 1) * limit;
        const where: Prisma.UserWhereInput = {
          ...(role && { role }),
          ...(emailVerified !== undefined && { emailVerified }),
          ...(search && {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { email: { contains: search, mode: "insensitive" } },
              { id: { equals: search } },
            ],
          }),
        };

        const [users, total] = await Promise.all([
          prisma.user.findMany({
            where,
            skip,
            take: limit,
            orderBy: { [sortBy]: sortOrder },
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
              emailVerified: true,
              image: true,
              createdAt: true,
              _count: {
                select: { addresses: true },
              },
            },
          }),
          prisma.user.count({ where }),
        ]);

        return {
          data: users,
          pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
          },
        };
      },
      { model: "User", operation: "findAllAdmin" },
    );
  }

  async findUserById(id: string) {
    return await safeQuery(
      async () => {
        const user = await prisma.user.findUnique({
          where: { id },
          include: {
            _count: { select: { addresses: true } },
          },
        });

        return user;
      },
      { model: "User", operation: "findById" },
    );
  }

  async updateUser(id: string, data: AdminUpdateUserInput) {
    return await safeQuery(
      async () => {
        const exists = await prisma.user.findUnique({ where: { id } });
        if (!exists) throw new NotFoundError("User not found");

        return await prisma.user.update({
          where: { id },
          data,
        });
      },
      { model: "User", operation: "update" },
    );
  }

  async deleteUser(id: string) {
    return await safeQuery(
      async () => {
        const exists = await prisma.user.findUnique({ where: { id } });
        if (!exists) throw new NotFoundError("User not found");

        await prisma.user.delete({
          where: { id },
        });
      },
      { model: "User", operation: "delete" },
    );
  }

  async findAllAddresses(filters: AdminListAddressQuery) {
    return await safeQuery(
      async () => {
        const { page, limit, search, userId, city, state, zipCode, isDefault } =
          filters;
        const skip = (page - 1) * limit;

        const where: Prisma.AddressWhereInput = {
          ...(userId && { userId }),
          ...(city && { city: { contains: city, mode: "insensitive" } }),
          ...(state && { state: { contains: state, mode: "insensitive" } }),
          ...(zipCode && { zipCode: { contains: zipCode } }),
          ...(isDefault !== undefined && { isDefault }),
          ...(search && {
            OR: [
              { street: { contains: search, mode: "insensitive" } },
              { city: { contains: search, mode: "insensitive" } },
              { zipCode: { contains: search, mode: "insensitive" } },
              { name: { contains: search, mode: "insensitive" } },
            ],
          }),
        };

        const [addresses, total] = await Promise.all([
          prisma.address.findMany({
            where,
            skip,
            take: limit,
            orderBy: { createdAt: "desc" },
            include: {
              user: {
                select: { email: true, name: true },
              },
            },
          }),
          prisma.address.count({ where }),
        ]);

        return {
          data: addresses,
          pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
          },
        };
      },
      { model: "Address", operation: "findAllAdmin" },
    );
  }

  async findAddressById(addressId: string) {
    const address = await safeQuery(
      () =>
        prisma.address.findFirst({
          where: { id: addressId },
        }),
      { model: "Address", operation: "findAddeessById" },
    );

    if (!address) {
      throw new NotFoundError("Address not found");
    }
    return address;
  }

  async deleteAddress(addressId: string) {
    return await safeQuery(
      async () => {
        const address = await this.findAddressById(addressId);
        return await prisma.$transaction(
          async (tx: Prisma.TransactionClient) => {
            await tx.address.delete({
              where: { id: addressId },
            });

            if (address.isDefault) {
              const newDefault = await tx.address.findFirst({
                where: { userId: address.userId },
                orderBy: { createdAt: "desc" },
              });

              if (newDefault) {
                await tx.address.update({
                  where: { id: newDefault.id },
                  data: { isDefault: true },
                });
              }
            }
          },
        );
      },
      { model: "Address", operation: "delete" },
    );
  }

  async updateAddress(addressId: string, data: AdminUpdateAddressInput) {
    return await safeQuery(
      async () => {
        const address = await this.findAddressById(addressId);
        return await prisma.$transaction(
          async (tx: Prisma.TransactionClient) => {
            if (data.isDefault) {
              await tx.address.updateMany({
                where: {
                  userId: address.userId,
                  isDefault: true,
                  id: { not: addressId },
                },
                data: { isDefault: false },
              });
            }

            return await tx.address.update({
              where: { id: addressId },
              data,
            });
          },
        );
      },
      { model: "Address", operation: "update" },
    );
  }
}

export const adminService = new AdminService();
