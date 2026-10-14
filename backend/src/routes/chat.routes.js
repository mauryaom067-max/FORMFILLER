import express from 'express'

import {
  getApplicationMessages,
  sendApplicationMessage,
  markMessageAsRead,
} from '../controllers/chat.controller.js'

import {
  requireAuth,
} from '../middleware/auth.middleware.js'


const router = express.Router()


// =====================================================
// GET CHAT MESSAGES
// GET /api/applications/:id/messages
// =====================================================

router.get(
  '/:id/messages',
  requireAuth,
  getApplicationMessages
)


// =====================================================
// SEND CHAT MESSAGE
// POST /api/applications/:id/messages
// =====================================================

router.post(
  '/:id/messages',
  requireAuth,
  sendApplicationMessage
)


// =====================================================
// MARK MESSAGE AS READ
// PATCH /api/applications/:id/messages/:messageId/read
// =====================================================

router.patch(
  '/:id/messages/:messageId/read',
  requireAuth,
  markMessageAsRead
)


export default router