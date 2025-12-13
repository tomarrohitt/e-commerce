import { z } from "zod";
import { validateEnv, commonEnv, taxRateEnv } from "@ecommerce/common";

const schema = z.object({
  ...commonEnv,
  ...taxRateEnv,
  SERVICE_MODE: z.enum(["ALL", "WORKER", "API"]).default("ALL"),
});

export const env = validateEnv(schema);
