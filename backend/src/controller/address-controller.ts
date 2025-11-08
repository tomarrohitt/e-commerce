import { Request, Response } from "express";
import {
  createAddressSchema,
  updateAddressSchema,
  listAddressSchema,
} from "../lib/address-validation-schema";
import addressRepository from "../repository/address-repository";
import { getSecureWhere } from "../utils/get-where";

class AddressController {
  async createAddress(req: Request, res: Response) {
    try {
      const { error, value } = createAddressSchema.validate(req.body, {
        abortEarly: false,
        stripUnknown: true,
      });

      if (error) {
        return res.status(400).json({
          error: error.details.map((detail) => ({
            field: detail.path[0],
            message: detail.message,
          })),
        });
      }
      const userAddress = await addressRepository.findFirst(req.user.id);

      let newData = { ...value };
      if (!userAddress) {
        newData = {
          ...value,
          isDefault: true,
        };
      }

      const address = await addressRepository.create(req.user.id, newData);
      res.status(201).json(address);
    } catch (error) {
      if (error instanceof Error) {
        return res.status(500).json({ error: error.message });
      }
      res.status(500).json({ error, message: "Internal server error" });
    }
  }

  async updateAddress(req: Request, res: Response) {
    try {
      const { error, value } = updateAddressSchema.validate(req.body, {
        abortEarly: false,
        stripUnknown: true,
      });

      if (error) {
        return res.status(400).json({
          error: error.details.map((detail) => ({
            field: detail.path[0],
            message: detail.message,
          })),
        });
      }

      const where = getSecureWhere(req.params.id, {
        id: req.user.id,
        role: req.user.role!,
      });

      const address = await addressRepository.update(where, value);
      res.status(201).json({
        message: `Address with addressID:${req.params.id} has been updated successfully.`,
        address,
      });
    } catch (error) {
      if (error instanceof Error) {
        return res.status(500).json({ error: error.message });
      }
      res.status(500).json({ error, message: "Internal server error" });
    }
  }

  async deleteAddress(req: Request, res: Response) {
    try {
      const addresses = await addressRepository.findByUserId(req.user.id);

      if (addresses.length === 1 && addresses[0].id === req.params.id) {
        return res.status(401).json({
          message:
            "You cannot delete your only address. At least one address must always exist.",
        });
      }

      const defaultAddress = await addressRepository.getDefaultAddress(
        req.user.id
      );

      if (defaultAddress?.id === req.params.id) {
        return res.status(401).json({
          message:
            "Default address cannot be deleted. Set another address as default first.",
        });
      }

      const where = getSecureWhere(req.params.id, {
        id: req.user.id,
        role: req.user.role!,
      });

      await addressRepository.delete(where);
      res.status(201).json({
        message: `Address with addressID:${req.params.id} has been deleted successfully.`,
      });
    } catch (error) {
      if (error instanceof Error) {
        return res.status(500).json({ error: error.message });
      }
      res.status(500).json({ error, message: "Internal server error" });
    }
  }

  async setDefaultAddress(req: Request, res: Response) {
    try {
      await addressRepository.setAsDefaultAddress(req.user.id, req.params.id);

      res.status(201).json({
        message: `Address with addressID:${req.params.id} has been set as default successfully.`,
        isDefault: true,
      });
    } catch (error) {
      if (error instanceof Error) {
        return res.status(500).json({ error: error.message });
      }
      res.status(500).json({ error, message: "Internal server error" });
    }
  }
  async setDefaultAddressForUser(req: Request, res: Response) {
    try {
      const { userId, addressId } = req.params;
      const address = await addressRepository.setAsDefaultAddress(
        userId,
        addressId
      );

      res.status(200).json({
        message: `Address ${addressId} has been set as default for user ${userId}.`,
        address: address,
      });
    } catch (error) {
      if (error instanceof Error) {
        return res.status(500).json({ error: error.message });
      }
      res.status(500).json({ error, message: "Internal server error" });
    }
  }

  async getDefaultAddress(req: Request, res: Response) {
    try {
      const address = await addressRepository.getDefaultAddress(req.user.id);
      if (!address) {
        return res.status(404).json({ message: "Address not found" });
      }
      res.status(200).json({ address });
    } catch (error) {
      if (error instanceof Error) {
        return res.status(500).json({ error: error.message });
      }
      res.status(500).json({ error, message: "Internal server error" });
    }
  }

  // List All address of a user
  async findByUserId(req: Request, res: Response) {
    try {
      const addresses = await addressRepository.findByUserId(req.user.id);
      if (!addresses) {
        return res
          .status(400)
          .json({ message: `Addresses not found with user` });
      }
      res.status(200).json({ addresses });
    } catch (error) {
      if (error instanceof Error) {
        return res.status(500).json({ error: error.message });
      }
      res.status(500).json({ error, message: "Internal server error" });
    }
  }
  async findByUserIdAdmin(req: Request, res: Response) {
    try {
      const addresses = await addressRepository.findByUserId(req.params.userId);
      if (!addresses) {
        return res.status(400).json({
          message: `Addresses not found with userId: ${req.body.userId}`,
        });
      }
      res.status(200).json({ addresses });
    } catch (error) {
      if (error instanceof Error) {
        return res.status(500).json({ error: error.message });
      }
      res.status(500).json({ error, message: "Internal server error" });
    }
  }

  async getAddressById(req: Request, res: Response) {
    try {
      const where = getSecureWhere(req.params.id, {
        id: req.user.id,
        role: req.user.role!,
      });

      const address = await addressRepository.findById(where);
      if (!address) {
        return res.status(400).json({
          message: `Addresses not found with AddressID: ${req.params.id}`,
        });
      }
      res.status(200).json(address);
    } catch (error) {
      if (error instanceof Error) {
        return res.status(500).json({ error: error.message });
      }
      res.status(500).json({ error, message: "Internal server error" });
    }
  }

  async listAllAddresses(req: Request, res: Response) {
    try {
      const { error, value } = listAddressSchema.validate(req.query, {
        abortEarly: false,
        stripUnknown: true,
      });

      if (error) {
        return res.status(400).json({
          error: error.details.map((detail) => ({
            field: detail.path[0],
            message: detail.message,
          })),
        });
      }
      const addresses = await addressRepository.list(value);

      if (addresses.pagination.total === 0) {
        return res.status(400).json({
          message: `No addresses found for filters`,
          filters: value,
        });
      }
      res.status(201).json(addresses);
    } catch (error) {
      if (error instanceof Error) {
        return res.status(500).json({ error: error.message });
      }
      res.status(500).json({ error, message: "Internal server error" });
    }
  }

  async getAddressCount(req: Request, res: Response) {
    try {
      const count = await addressRepository.addressCount(req.user.id);
      res.status(200).json({ count });
    } catch (error) {
      if (error instanceof Error) {
        return res.status(500).json({ error: error.message });
      }
      res.status(500).json({ error, message: "Internal server error" });
    }
  }
}

export default new AddressController();
