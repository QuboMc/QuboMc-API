const express = require('express');
const router = express.Router();
const minecraftController = require('../controllers/minecraftController');
import validate from '../middleware/validateResource';
import { sendCommandSchema } from '../schemas/minecraftSchema';

router.get('/status', minecraftController.getStatus);
router.post('/command', validate(sendCommandSchema), minecraftController.sendCommand);
router.get('/players', minecraftController.listPlayers);

module.exports = router; 