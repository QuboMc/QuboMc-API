import express from 'express';
import { getHealth } from '../controllers/healthController';

const router = express.Router();

router.get('/', getHealth);

export default router; 