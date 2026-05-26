import { z } from "zod";
import {
  validateEnv,
  commonEnv,
  stripeEnv,
  taxRateEnv,
} from "@ecommerce/common";

const schema = z.object({
  ...commonEnv,
  ...stripeEnv,
  ...taxRateEnv,
});

export const env = validateEnv(schema);
