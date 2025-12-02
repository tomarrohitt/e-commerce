import { z } from "zod";
import { validateEnv, commonEnv, emailEnv } from "@ecommerce/common";

const schema = z.object({
  ...commonEnv,
  ...emailEnv,
});

export const env = validateEnv(schema);
