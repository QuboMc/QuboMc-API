"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerWebhookSchema = void 0;
const zod_1 = require("zod");
exports.registerWebhookSchema = zod_1.z.object({
    body: zod_1.z.object({
        url: zod_1.z.string().url('Must be a valid URL'),
        event: zod_1.z.string().min(1, 'Event name is required'),
    }),
});
