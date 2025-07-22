"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendCommandSchema = void 0;
const zod_1 = require("zod");
exports.sendCommandSchema = zod_1.z.object({
    body: zod_1.z.object({
        command: zod_1.z.string({
            required_error: 'Command is required',
        }).min(1, 'Command cannot be empty'),
    }),
});
//# sourceMappingURL=minecraftSchema.js.map