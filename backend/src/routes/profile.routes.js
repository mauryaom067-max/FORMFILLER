import express from 'express'

import {
  getProfile,
  updateProfile,
} from '../controllers/profile.controller.js'

import { requireAuth } from '../middleware/auth.middleware.js'

const router = express.Router()

router.get(
  '/',
  requireAuth,
  getProfile
)

router.put(
  '/',
  requireAuth,
  updateProfile
)

export default router
