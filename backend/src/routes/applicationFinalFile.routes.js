import express from 'express'

import {
  uploadFinalFile,
  getCurrentFinalFile,
  getFinalFileVersions,
} from '../controllers/applicationFinalFile.controller.js'

import {
  requireAuth,
} from '../middleware/auth.middleware.js'

import multer from 'multer'

const router = express.Router()

const upload = multer({
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

    if (allowedTypes.includes(file.mimetype)) {
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

/*
 * Upload 2-4 screenshots
 * and generate one final PDF
 *
 * POST
 * /api/applications/:id/final-files
 */
router.post(
  '/:id/final-files',
  requireAuth,
  upload.array('screenshots', 4),
  uploadFinalFile
)

/*
 * Get latest/current PDF
 *
 * GET
 * /api/applications/:id/final-files/current
 */
router.get(
  '/:id/final-files/current',
  requireAuth,
  getCurrentFinalFile
)

/*
 * Get all PDF versions
 *
 * GET
 * /api/applications/:id/final-files
 */
router.get(
  '/:id/final-files',
  requireAuth,
  getFinalFileVersions
)

export default router