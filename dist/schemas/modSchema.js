"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleEventSchema = void 0;
const zod_1 = require("zod");
exports.handleEventSchema = zod_1.z.object({
    body: zod_1.z.object({
        secret: zod_1.z.string({ required_error: 'secret is required' }),
        event: zod_1.z.string({ required_error: 'event is required' }),
        data: zod_1.z.any().optional(),
    }),
});
//# sourceMappingURL=modSchema.js.map