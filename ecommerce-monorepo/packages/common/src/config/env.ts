import { z } from "zod";
import { commonEnv, validateEnv } from "../utils/env-validator";

const schema = z.object({
  ...commonEnv,
});

export const env = validateEnv(schema);
