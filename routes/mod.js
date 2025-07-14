const express = require('express');
const router = express.Router();
const modController = require('../controllers/modController');

router.get('/status', modController.getStatus);
router.post('/event', modController.handleEvent);

module.exports = router; 