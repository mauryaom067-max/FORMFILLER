import express from 'express'

import {
  operatorLogin,
} from '../controllers/auth.controller.js'

import {
  getCurrentOperator,
} from '../controllers/operator.controller.js'

import {
  getOperatorDashboard,
} from '../controllers/operatorDashboard.controller.js'

import {
  testAutoAssignApplication,
} from '../controllers/operatorAssignment.controller.js'

import {
  requireAuth,
} from '../middleware/auth.middleware.js'

import {
  requireOperator,
} from '../middleware/role.middleware.js'

const router = express.Router()

// ======================================================
// OPERATOR LOGIN
// ======================================================

router.post(
  '/login',
  operatorLogin
)

// ======================================================
// CURRENT OPERATOR
// ======================================================

router.get(
  '/me',
  requireAuth,
  requireOperator,
  getCurrentOperator
)

// ======================================================
// OPERATOR DASHBOARD
// ======================================================

router.get(
  '/dashboard',
  requireAuth,
  requireOperator,
  getOperatorDashboard
)

// ======================================================
// TEST AUTO ASSIGNMENT
// DEVELOPMENT ONLY
// ======================================================

router.post(
  '/dev/test-auto-assign',
  requireAuth,
  requireOperator,
  testAutoAssignApplication
)

export default router