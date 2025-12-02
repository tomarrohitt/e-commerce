import { z } from "zod";
import { validateEnv, commonEnv, stripeEnv } from "@ecommerce/common";

const schema = z.object({
  ...commonEnv,
  ...stripeEnv,
});

export const env = validateEnv(schema);
