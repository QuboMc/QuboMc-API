const express = require('express');
const router = express.Router();
const modController = require('../controllers/modController');
const validate = require('../middleware/validateResource').default || require('../middleware/validateResource');
const { handleEventSchema } = require('../schemas/modSchema');

router.get('/status', modController.getStatus);
router.post('/event', validate(handleEventSchema), modController.handleEvent);

module.exports = router; 