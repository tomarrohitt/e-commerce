"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const zod_1 = require("zod");
const common_1 = require("@ecommerce/common");
const schema = zod_1.z.object({
    ...common_1.commonEnv,
    ...common_1.emailEnv,
});
exports.env = (0, common_1.validateEnv)(schema);
