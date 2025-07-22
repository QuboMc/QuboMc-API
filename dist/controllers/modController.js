"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStatus = getStatus;
exports.handleModEvent = handleModEvent;
const logger_1 = __importDefault(require("../utils/logger"));
const modSecret = process.env.MOD_SECRET;
async function getStatus(req, res) {
    res.json({ status: 'Mod API ready' });
}
async function handleModEvent(req, res) {
    const { secret, event, data } = req.body;
    if (!secret || secret !== modSecret) {
        res.status(401).json({ error: 'Invalid or missing secret' });
        return;
    }
    if (!event) {
        res.status(400).json({ error: 'Missing event type' });
        return;
    }
    logger_1.default.info(`[Mod] Event received: ${event}`, data);
    if (global.triggerWebhooks) {
        global.triggerWebhooks('mod_event', { event, data });
    }
    res.json({ received: { event, data } });
}
//# sourceMappingURL=modController.js.map