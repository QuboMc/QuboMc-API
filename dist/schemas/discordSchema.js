"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendMessageSchema = void 0;
const zod_1 = require("zod");
exports.sendMessageSchema = zod_1.z.object({
    body: zod_1.z.object({
        channelId: zod_1.z.string({ required_error: 'channelId is required' }),
        message: zod_1.z.string({ required_error: 'message is required' }).min(1, 'Message cannot be empty'),
    }),
});
//# sourceMappingURL=discordSchema.js.map