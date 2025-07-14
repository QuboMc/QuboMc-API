const express = require('express');
const router = express.Router();
const minecraftController = require('../controllers/minecraftController');

// GET /minecraft/status
router.get('/status', minecraftController.getStatus);

// POST /minecraft/command
router.post('/command', minecraftController.sendCommand);

// GET /minecraft/players
router.get('/players', minecraftController.listPlayers);

module.exports = router; 