"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerWebhook = registerWebhook;
exports.listWebhooks = listWebhooks;
exports.triggerWebhooks = triggerWebhooks;
const logger_1 = __importDefault(require("../utils/logger"));
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const webhooksFilePath = path_1.default.join(__dirname, '../../webhooks.json');
let webhooks = [];
async function loadWebhooks() {
    try {
        const data = await promises_1.default.readFile(webhooksFilePath, 'utf-8');
        webhooks = JSON.parse(data);
        logger_1.default.info(`Loaded ${webhooks.length} webhooks from file.`);
    }
    catch (error) {
        if (error.code === 'ENOENT') {
            logger_1.default.warn('webhooks.json not found. Starting with an empty list.');
            webhooks = [];
        }
        else {
            logger_1.default.error('Failed to load webhooks:', error);
        }
    }
}
async function saveWebhooks() {
    try {
        await promises_1.default.writeFile(webhooksFilePath, JSON.stringify(webhooks, null, 2));
    }
    catch (error) {
        logger_1.default.error('Failed to save webhooks:', error);
    }
}
async function registerWebhook(reg) {
    webhooks.push(reg);
    await saveWebhooks();
}
function listWebhooks() {
    return webhooks;
}
async function triggerWebhooks(event, data) {
    const fetch = (...args) => Promise.resolve().then(() => __importStar(require('node-fetch'))).then(({ default: fetch }) => fetch(...args));
    for (const wh of webhooks) {
        if (wh.event === event) {
            try {
                await fetch(wh.url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ event, data }),
                });
                logger_1.default.info(`Webhook sent to ${wh.url} for event ${event}`);
            }
            catch (err) {
                logger_1.default.error(`Failed to send webhook to ${wh.url}:`, err.message);
            }
        }
    }
}
// Load webhooks on service initialization
loadWebhooks();
