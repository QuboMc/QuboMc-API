const express = require('express');
const router = express.Router();
const modController = require('../controllers/modController');
import validate from '../middleware/validateResource';
import { handleEventSchema } from '../schemas/modSchema';

router.get('/status', modController.getStatus);
router.post('/event', validate(handleEventSchema), modController.handleEvent);

module.exports = router; 