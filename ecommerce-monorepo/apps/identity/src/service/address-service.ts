import { prisma } from "../config/prisma";
import { safeQuery, NotFoundError } from "@ecommerce/common";
import {
  CreateAddressInput,
  UpdateAddressInput,
} from "../lib/address-validation-schema";

class AddressService {
  async create(userId: string, data: CreateAddressInput) {
    return await safeQuery(
      async () => {
        const existingCount = await prisma.address.count({ where: { userId } });

        let finalName = data.name;
        if (!finalName) {
          finalName = existingCount === 0 ? "Home" : data.street;
        }

        const shouldBeDefault = data.isDefault || existingCount === 0;
        return await prisma.$transaction(async (tx) => {
          if (shouldBeDefault && existingCount > 0) {
            await tx.address.updateMany({
              where: { userId, isDefault: true },
              data: { isDefault: false },
            });
          }

          return await tx.address.create({
            data: {
              ...data,
              userId,
              name: finalName,
              isDefault: shouldBeDefault,
            },
          });
        });
      },
      { model: "Address", operation: "create" }
    );
  }

  async findAll(userId: string) {
    return await safeQuery(
      () =>
        prisma.address.findMany({
          where: { userId },
          orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
        }),
      { model: "Address", operation: "findAll" }
    );
  }

  async findOne(userId: string, addressId: string) {
    const address = await safeQuery(
      () =>
        prisma.address.findFirst({
          where: { id: addressId, userId },
        }),
      { model: "Address", operation: "findOne" }
    );

    if (!address) {
      throw new NotFoundError("Address not found");
    }
    return address;
  }

  async update(userId: string, addressId: string, data: UpdateAddressInput) {
    return await safeQuery(
      async () => {
        await this.findOne(userId, addressId);

        return await prisma.$transaction(async (tx) => {
          if (data.isDefault) {
            await tx.address.updateMany({
              where: { userId, isDefault: true, id: { not: addressId } },
              data: { isDefault: false },
            });
          }

          return await tx.address.update({
            where: { id: addressId },
            data,
          });
        });
      },
      { model: "Address", operation: "update" }
    );
  }

  async delete(userId: string, addressId: string) {
    return await safeQuery(
      async () => {
        const address = await this.findOne(userId, addressId);

        await prisma.$transaction(async (tx) => {
          await tx.address.delete({
            where: { id: addressId },
          });

          if (address.isDefault) {
            const newDefault = await tx.address.findFirst({
              where: { userId },
              orderBy: { createdAt: "desc" },
            });

            if (newDefault) {
              await tx.address.update({
                where: { id: newDefault.id },
                data: { isDefault: true },
              });
            }
          }
        });
      },
      { model: "Address", operation: "delete" }
    );
  }
}

export const addressService = new AddressService();
