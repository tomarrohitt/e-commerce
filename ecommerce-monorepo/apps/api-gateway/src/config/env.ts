import { z } from "zod";
import { validateEnv, commonEnv, servicesUrlEnv } from "@ecommerce/common";

const schema = z.object({
  ...commonEnv,
  ...servicesUrlEnv,
});

export const env = validateEnv(schema);
