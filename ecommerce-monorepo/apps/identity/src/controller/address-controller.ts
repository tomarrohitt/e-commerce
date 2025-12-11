import { Request, Response } from "express";

import {
  validateAndThrow,
  NotFoundError,
  sendSuccess,
  sendCreated,
  sendNoContent,
} from "@ecommerce/common";
import {
  CreateAddressInput,
  createAddressSchema,
  UpdateAddressInput,
  updateAddressSchema,
} from "../lib/address-validation-schema";
import { addressService } from "../service/address-service";
import { Address } from "@prisma/client";

class AddressController {
  async createAddress(req: Request, res: Response) {
    const data = validateAndThrow<CreateAddressInput>(
      createAddressSchema,
      req.body,
    );
    const userId = req.user.id;

    const address = await addressService.create(userId, data);

    return sendCreated(res, address);
  }

  async listAddresses(req: Request, res: Response) {
    const userId = req.user.id;
    const addresses = await addressService.findAll(userId);

    return sendSuccess(res, addresses);
  }

  async getDefaultAddress(req: Request, res: Response) {
    const userId = req.user.id;

    const addresses = await addressService.findAll(userId);
    if (addresses.length === 0) {
      throw new NotFoundError("No default address found");
    }
    const defaultAddress = addresses.find((a: Address) => a.isDefault);

    return sendSuccess(res, defaultAddress);
  }

  async getAddressById(req: Request, res: Response) {
    const userId = req.user.id;
    const address = await addressService.findOne(userId, req.params.id);
    return sendSuccess(res, address);
  }
  async updateAddress(req: Request, res: Response) {
    const data = validateAndThrow<UpdateAddressInput>(
      updateAddressSchema,
      req.body,
    );
    const userId = req.user.id;

    const address = await addressService.update(userId, req.params.id, data);

    return sendSuccess(res, address);
  }

  async deleteAddress(req: Request, res: Response) {
    const userId = req.user.id;
    const addressId = req.params.id;
    await addressService.delete(userId, addressId);

    return sendNoContent(res);
  }

  async setDefaultAddress(req: Request, res: Response) {
    const userId = req.user.id;
    const addressId = req.params.id;

    const address = await addressService.update(userId, addressId, {
      isDefault: true,
    });

    return sendSuccess(res, address);
  }
}

export const addressController = new AddressController();
