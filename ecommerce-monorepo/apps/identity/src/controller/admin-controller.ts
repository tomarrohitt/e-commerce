import { Request, Response } from "express";

import {
  validateAndThrow,
  sendSuccess,
  NotFoundError,
  BadRequestError,
  sendNoContent,
} from "@ecommerce/common";
import {
  AdminListUsersQuery,
  adminListUsersSchema,
  AdminUpdateUserInput,
  adminUpdateUserSchema,
} from "../lib/admin-validation-schema";
import { adminService } from "../service/admin-service";
import {
  AdminListAddressQuery,
  adminListAddressSchema,
  updateAddressSchema,
} from "../lib/address-validation-schema";

class AdminController {
  async listUsers(req: Request, res: Response) {
    const filters = validateAndThrow<AdminListUsersQuery>(
      adminListUsersSchema,
      req.query,
    );
    const result = await adminService.findAllUsers(filters);
    return sendSuccess(res, result);
  }

  async getUserById(req: Request, res: Response) {
    const user = await adminService.findUserById(req.params.id);

    if (!user) {
      throw new NotFoundError("User not found");
    }

    return sendSuccess(res, user);
  }

  async updateUser(req: Request, res: Response) {
    const data = validateAndThrow<AdminUpdateUserInput>(
      adminUpdateUserSchema,
      req.body,
    );

    if (req.params.id === req.user.id && data.role === "user") {
      throw new BadRequestError("You cannot demote yourself.");
    }

    const user = await adminService.updateUser(req.params.id, data);
    return sendSuccess(res, user, "User updated successfully");
  }

  async deleteUser(req: Request, res: Response) {
    if (req.params.id === req.user.id) {
      throw new BadRequestError("You cannot delete your own account.");
    }

    await adminService.deleteUser(req.params.id);
    return sendNoContent(res);
  }

  async listAllAddressesAdmin(req: Request, res: Response) {
    const filters = validateAndThrow<AdminListAddressQuery>(
      adminListAddressSchema,
      req.query,
    );
    const result = await adminService.findAllAddresses(filters);
    return sendSuccess(res, result);
  }

  async getAddressById(req: Request, res: Response) {
    const address = await adminService.findAddressById(req.params.id);

    if (!address) throw new NotFoundError("Address not found");
    return sendSuccess(res, address);
  }

  async deleteAddress(req: Request, res: Response) {
    await adminService.deleteAddress(req.params.id);
    return sendNoContent(res);
  }
  async updateAddress(req: Request, res: Response) {
    const data = validateAndThrow<AdminUpdateUserInput>(
      updateAddressSchema,
      req.body,
    );
    const updatedAddress = await adminService.updateAddress(
      req.params.id,
      data,
    );
    return sendSuccess(res, updatedAddress, "Address updated successfully");
  }
}

export const adminController = new AdminController();
