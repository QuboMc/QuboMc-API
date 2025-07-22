"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const webhookController_1 = require("../controllers/webhookController");
const validateResource_1 = __importDefault(require("../middleware/validateResource"));
const webhookSchema_1 = require("../schemas/webhookSchema");
const router = express_1.default.Router();
router.post('/', (0, validateResource_1.default)(webhookSchema_1.registerWebhookSchema), webhookController_1.registerWebhookHandler);
router.get('/', webhookController_1.listWebhooksHandler);
exports.default = router;
