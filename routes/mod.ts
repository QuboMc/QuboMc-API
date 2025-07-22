import express from 'express';
import { handleModEvent } from '../controllers/modController';
import validate from '../middleware/validateResource';
import { handleEventSchema } from '../schemas/modSchema';

const router = express.Router();

router.post('/event', validate(handleEventSchema), handleModEvent);

export default router;