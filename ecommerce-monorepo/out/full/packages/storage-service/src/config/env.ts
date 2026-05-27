import { awsEnv, validateEnv } from "@ecommerce/common";
import { z } from "zod";

const schema = z.object({
  ...awsEnv,
});

export const env = validateEnv(schema);
