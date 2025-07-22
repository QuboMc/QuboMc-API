"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const modController_1 = require("../controllers/modController");
const validateResource_1 = __importDefault(require("../middleware/validateResource"));
const modSchema_1 = require("../schemas/modSchema");
const router = express_1.default.Router();
router.post('/event', (0, validateResource_1.default)(modSchema_1.handleEventSchema), modController_1.handleModEvent);
exports.default = router;
//# sourceMappingURL=mod.js.map