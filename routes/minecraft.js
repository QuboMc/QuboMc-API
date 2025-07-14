const express = require('express');
const router = express.Router();
const minecraftController = require('../controllers/minecraftController');

router.get('/status', minecraftController.getStatus);
router.post('/command', minecraftController.sendCommand);
router.get('/players', minecraftController.listPlayers);

module.exports = router; 