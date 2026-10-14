import express from 'express'

import {
  getApplicant,
  createApplicant,
  updateApplicant,
} from '../controllers/applicant.controller.js'

import { requireAuth } from '../middleware/auth.middleware.js'

const router = express.Router()

router.get(
  '/',
  requireAuth,
  getApplicant
)

router.post(
  '/',
  requireAuth,
  createApplicant
)

router.put(
  '/',
  requireAuth,
  updateApplicant
)

export default router