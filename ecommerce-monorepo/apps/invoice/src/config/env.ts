import { z } from "zod";
import { validateEnv, awsEnv, commonEnv } from "@ecommerce/common";

const schema = z.object({
  ...commonEnv,
  ...awsEnv,
});

export const env = validateEnv(schema);
