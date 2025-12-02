import { z } from "zod";
import { awsEnv, validateEnv } from "@ecommerce/common";

const schema = z.object({
  ...awsEnv,
});

export const env = validateEnv(schema);
