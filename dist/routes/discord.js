"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const discordController_1 = require("../controllers/discordController");
const validateResource_1 = __importDefault(require("../middleware/validateResource"));
const discordSchema_1 = require("../schemas/discordSchema");
const router = express_1.default.Router();
router.get('/status', discordController_1.getStatus);
router.post('/message', (0, validateResource_1.default)(discordSchema_1.sendMessageSchema), discordController_1.sendMessage);
router.get('/info', discordController_1.botInfo);
exports.default = router;
//# sourceMappingURL=discord.js.map