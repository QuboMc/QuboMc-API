"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.apiKeyAuth = apiKeyAuth;
const API_KEY = process.env.API_KEY;
function apiKeyAuth(req, res, next) {
    const key = req.headers['x-api-key'];
    if (!API_KEY || key !== API_KEY) {
        res.status(401).json({ error: 'Invalid or missing API key' });
        return;
    }
    next();
}
//# sourceMappingURL=auth.js.map