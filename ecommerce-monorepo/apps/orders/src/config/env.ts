import { z } from "zod";
import {
  validateEnv,
  commonEnv,
  stripeEnv,
  taxRateEnv,
} from "@ecommerce/common";
import "dotenv/config";

const schema = z.object({
  ...commonEnv,
  ...stripeEnv,
  ...taxRateEnv,
});

export const env = validateEnv(schema);
