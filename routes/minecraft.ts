import express from 'express';
import { getStatus, sendCommand, listPlayers } from '../controllers/minecraftController';
import validate from '../middleware/validateResource';
import { sendCommandSchema } from '../schemas/minecraftSchema';

const router = express.Router();

router.get('/status', getStatus);
router.post('/command', validate(sendCommandSchema), sendCommand);
router.get('/players', listPlayers);

export default router;