"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.eventBus = void 0;
const common_1 = require("@ecommerce/common");
const env_1 = require("./env");
exports.eventBus = new common_1.EventBusService({
    serviceName: "orders-service",
    url: env_1.env.RABBITMQ_URL,
});
