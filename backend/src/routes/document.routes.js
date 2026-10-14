import express from 'express'
import multer from 'multer'

import {
  uploadDocument,
  getMyDocuments,
  getDocumentUrl,
  deleteDocument,
} from '../controllers/document.controller.js'

import {
  requireAuth,
} from '../middleware/auth.middleware.js'

const router = express.Router()

// =====================================================
// MULTER CONFIGURATION
// =====================================================

const upload = multer({
  storage: multer.memoryStorage(),

  limits: {
    fileSize: 10 * 1024 * 1024,
  },

  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'application/pdf',
    ]

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(
        new Error(
          'Only JPG, PNG, WEBP and PDF files are allowed'
        )
      )
    }
  },
})

// =====================================================
// UPLOAD DOCUMENT
// POST /api/documents/upload
// =====================================================

router.post(
  '/upload',
  requireAuth,
  upload.single('file'),
  uploadDocument
)

// =====================================================
// GET MY DOCUMENTS
// GET /api/documents
// =====================================================

router.get(
  '/',
  requireAuth,
  getMyDocuments
)

// =====================================================
// GET SECURE DOCUMENT URL
// GET /api/documents/:id/url
// =====================================================

router.get(
  '/:id/url',
  requireAuth,
  getDocumentUrl
)

// =====================================================
// DELETE DOCUMENT
// DELETE /api/documents/:id
// =====================================================

router.delete(
  '/:id',
  requireAuth,
  deleteDocument
)

export default router