import { z } from "zod";
import { validateEnv, commonEnv, emailEnv } from "@ecommerce/common";
import "dotenv/config";

const schema = z.object({
  ...commonEnv,
  ...emailEnv,
});

export const env = validateEnv(schema);
