"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = __importDefault(require("../utils/logger"));
const validate = (schema) => (req, res, next) => {
    try {
        schema.parse({
            body: req.body,
            query: req.query,
            params: req.params,
        });
        next();
    }
    catch (e) {
        logger_1.default.error(`Validation Error: ${e.errors.map((err) => err.message).join(', ')}`);
        res.status(400).send(e.errors);
        return;
    }
};
exports.default = validate;
//# sourceMappingURL=validateResource.js.map