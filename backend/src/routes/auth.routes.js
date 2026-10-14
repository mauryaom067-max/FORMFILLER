import express from 'express'

import {
  signup,
  login,
  logout,
  getMe,
} from '../controllers/auth.controller.js'

import { requireAuth } from '../middleware/auth.middleware.js'

const router = express.Router()

router.post('/signup', signup)

router.post('/login', login)

router.post('/logout', requireAuth, logout)

router.get('/me', requireAuth, getMe)

export default router