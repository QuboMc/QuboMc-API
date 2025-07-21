import express from 'express';
import { registerWebhookHandler, listWebhooksHandler } from '../controllers/webhookController';
import validate from '../middleware/validateResource';
import { registerWebhookSchema } from '../schemas/webhookSchema';

const router = express.Router();

router.post('/', validate(registerWebhookSchema), registerWebhookHandler);
router.get('/', listWebhooksHandler);

export default router; 