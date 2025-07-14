const express = require('express');
const router = express.Router();
const modController = require('../controllers/modController');

// GET /mod/status
router.get('/status', modController.getStatus);

// POST /mod/event
router.post('/event', modController.handleEvent);

module.exports = router; 