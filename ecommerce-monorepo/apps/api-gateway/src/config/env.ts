import { z } from "zod";
import {
  validateEnv,
  commonEnv,
  servicesUrlEnv,
  secretUrlEnv,
} from "@ecommerce/common";

const schema = z.object({
  ...commonEnv,
  ...servicesUrlEnv,
  ...secretUrlEnv,
});

export const env = validateEnv(schema);
