import express from 'express'

import {
  getAllForms,
  getFormByCode,
  getFormsByCategory,
} from '../controllers/form.controller.js'

const router = express.Router()

// =====================================================
// GET ALL ACTIVE FORMS
// GET /api/forms
// =====================================================

router.get(
  '/',
  getAllForms
)

// =====================================================
// GET FORMS BY CATEGORY
// GET /api/forms/category/:category
// =====================================================

router.get(
  '/category/:category',
  getFormsByCategory
)

// =====================================================
// GET SINGLE FORM BY CODE
// GET /api/forms/:code
// =====================================================

router.get(
  '/:code',
  getFormByCode
)

export default router