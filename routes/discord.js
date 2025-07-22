const express = require('express');
const router = express.Router();
const discordController = require('../controllers/discordController');
const validate = require('../middleware/validateResource').default || require('../middleware/validateResource');
const { sendMessageSchema } = require('../schemas/discordSchema');

router.get('/status', discordController.getStatus);
router.post('/send-message', validate(sendMessageSchema), discordController.sendMessage);
router.get('/bot-info', discordController.botInfo);

module.exports = router; 