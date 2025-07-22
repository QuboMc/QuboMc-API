import express from 'express';
import { getStatus, sendMessage, botInfo } from '../controllers/discordController';
import validate from '../middleware/validateResource';
import { sendMessageSchema } from '../schemas/discordSchema';

const router = express.Router();

router.get('/status', getStatus);
router.post('/message', validate(sendMessageSchema), sendMessage);
router.get('/info', botInfo);

export default router;