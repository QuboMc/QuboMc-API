"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerWebhookHandler = registerWebhookHandler;
exports.listWebhooksHandler = listWebhooksHandler;
const webhookService_1 = require("../services/webhookService");
const logger_1 = __importDefault(require("../utils/logger"));
async function registerWebhookHandler(req, res) {
    try {
        const { url, event } = req.body;
        (0, webhookService_1.registerWebhook)({ url, event });
        logger_1.default.info(`Webhook registered for event '${event}' at URL: ${url}`);
        res.status(201).json({ success: true, registered: { url, event } });
    }
    catch (err) {
        logger_1.default.error('Failed to register webhook:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}
async function listWebhooksHandler(req, res) {
    try {
        const webhooks = (0, webhookService_1.listWebhooks)();
        res.json(webhooks);
    }
    catch (err) {
        logger_1.default.error('Failed to list webhooks:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}
//# sourceMappingURL=webhookController.js.map