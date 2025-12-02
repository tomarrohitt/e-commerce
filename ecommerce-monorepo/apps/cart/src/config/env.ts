import { z } from "zod";
import { validateEnv, commonEnv } from "@ecommerce/common";

const schema = z.object({
  ...commonEnv,
  SERVICE_MODE: z.enum(["ALL", "WORKER", "API"]).default("ALL"),
});

export const env = validateEnv(schema);
