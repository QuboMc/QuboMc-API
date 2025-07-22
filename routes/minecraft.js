const express = require('express');
const router = express.Router();
const minecraftController = require('../controllers/minecraftController');
const validate = require('../middleware/validateResource').default || require('../middleware/validateResource');
const { sendCommandSchema } = require('../schemas/minecraftSchema');

router.get('/status', minecraftController.getStatus);
router.post('/command', validate(sendCommandSchema), minecraftController.sendCommand);
router.get('/players', minecraftController.listPlayers);

module.exports = router; 