import express from 'express'
import multer from 'multer'

import {
  getMyApplications,
  createApplication,
  getApplicationById,
  updateApplication,
  validateApplication,
  preparePayment,
  confirmPayment,
  approveApplication,
  submitApplication,
  getApplicationDocuments,
  attachDocumentToApplication,
  removeApplicationDocument,
} from '../controllers/application.controller.js'

import {
  uploadFinalFile,
  getCurrentFinalFile,
  getFinalFileVersions,
} from '../controllers/finalFile.controller.js'

import {
  getApplicationMessages,
  sendApplicationMessage,
  markMessageAsRead,
} from '../controllers/chat.controller.js'

import { requireAuth } from '../middleware/auth.middleware.js'

const router = express.Router()

// =====================================================
// FINAL PDF SCREENSHOT UPLOAD
// =====================================================

const screenshotUpload = multer({
  storage: multer.memoryStorage(),

  limits: {
    files: 4,
    fileSize: 10 * 1024 * 1024,
  },

  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'image/jpeg',
      'image/png',
    ]

    if (
      allowedTypes.includes(
        file.mimetype
      )
    ) {
      cb(null, true)
    } else {
      cb(
        new Error(
          'Only JPG and PNG screenshots are allowed'
        )
      )
    }
  },
})

// =====================================================
// APPLICATION ROUTES
// =====================================================

// Get all my applications
router.get(
  '/',
  requireAuth,
  getMyApplications
)

// Create application
router.post(
  '/',
  requireAuth,
  createApplication
)

// Get single application
router.get(
  '/:id',
  requireAuth,
  getApplicationById
)

// Update application
router.patch(
  '/:id',
  requireAuth,
  updateApplication
)

// Validate application
router.post(
  '/:id/validate',
  requireAuth,
  validateApplication
)

// Prepare payment
router.post(
  '/:id/prepare-payment',
  requireAuth,
  preparePayment
)

// Confirm payment
router.post(
  '/:id/confirm-payment',
  requireAuth,
  confirmPayment
)

// Approve final application
router.post(
  '/:id/approve',
  requireAuth,
  approveApplication
)

// Submit application to government portal
router.post(
  '/:id/submit',
  requireAuth,
  submitApplication
)

// =====================================================
// APPLICATION DOCUMENTS
// =====================================================

// Get application documents
router.get(
  '/:id/documents',
  requireAuth,
  getApplicationDocuments
)

// Attach document
router.post(
  '/:id/documents',
  requireAuth,
  attachDocumentToApplication
)

// Remove application document
router.delete(
  '/:id/documents/:documentId',
  requireAuth,
  removeApplicationDocument
)

// =====================================================
// FINAL APPLICATION PDF
// =====================================================

// Upload screenshots and generate final PDF
router.post(
  '/:id/final-files',
  requireAuth,
  screenshotUpload.array(
    'screenshots',
    4
  ),
  uploadFinalFile
)

// Get current final PDF
router.get(
  '/:id/final-files/current',
  requireAuth,
  getCurrentFinalFile
)

// Get all final PDF versions
router.get(
  '/:id/final-files',
  requireAuth,
  getFinalFileVersions
)

// =====================================================
// APPLICATION CHAT
// =====================================================

// Get chat messages
router.get(
  '/:id/messages',
  requireAuth,
  getApplicationMessages
)

// Send chat message
router.post(
  '/:id/messages',
  requireAuth,
  sendApplicationMessage
)

// Mark chat message as read
router.patch(
  '/:id/messages/:messageId/read',
  requireAuth,
  markMessageAsRead
)

// =====================================================

export default router