const express = require('express');
const router = express.Router();
const discordController = require('../controllers/discordController');

// GET /discord/status
router.get('/status', discordController.getStatus);

// POST /discord/send-message
router.post('/send-message', discordController.sendMessage);

// GET /discord/bot-info
router.get('/bot-info', discordController.botInfo);

module.exports = router; 