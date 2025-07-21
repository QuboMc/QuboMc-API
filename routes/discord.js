const express = require('express');
const router = express.Router();
const discordController = require('../controllers/discordController');
import validate from '../middleware/validateResource';
import { sendMessageSchema } from '../schemas/discordSchema';

router.get('/status', discordController.getStatus);
router.post('/send-message', validate(sendMessageSchema), discordController.sendMessage);
router.get('/bot-info', discordController.botInfo);

module.exports = router; 