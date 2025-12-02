import { z } from "zod";
import { validateEnv, commonEnv, secretUrlEnv } from "@ecommerce/common";

const schema = z.object({
  ...commonEnv,
  ...secretUrlEnv,
});

export const env = validateEnv(schema);
