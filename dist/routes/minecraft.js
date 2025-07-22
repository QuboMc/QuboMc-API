"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const minecraftController_1 = require("../controllers/minecraftController");
const validateResource_1 = __importDefault(require("../middleware/validateResource"));
const minecraftSchema_1 = require("../schemas/minecraftSchema");
const router = express_1.default.Router();
router.get('/status', minecraftController_1.getStatus);
router.post('/command', (0, validateResource_1.default)(minecraftSchema_1.sendCommandSchema), minecraftController_1.sendCommand);
router.get('/players', minecraftController_1.listPlayers);
exports.default = router;
//# sourceMappingURL=minecraft.js.map