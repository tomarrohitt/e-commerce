import { z } from "zod";
import { validateEnv, commonEnv, awsEnv } from "@ecommerce/common";

const schema = z.object({
  ...commonEnv,
  ...awsEnv,
});

export const env = validateEnv(schema);
