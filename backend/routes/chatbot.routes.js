import express from 'express';
import { getChatbotResponse, getInitialMessage } from '../controllers/chatbot.controller.js';

const router = express.Router();

// Get initial greeting message
router.get('/initial', getInitialMessage);

// Get chatbot response
router.post('/message', getChatbotResponse);

export default router;

