const express = require('express');
const router = express.Router();
const discordController = require('../controllers/discordController');

router.get('/status', discordController.getStatus);
router.post('/send-message', discordController.sendMessage);
router.get('/bot-info', discordController.botInfo);

module.exports = router; 