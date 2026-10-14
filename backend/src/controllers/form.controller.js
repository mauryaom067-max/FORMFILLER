import { supabase } from '../config/supabase.js'

// =====================================================
// 1. GET ALL ACTIVE FORMS
// GET /api/forms
// =====================================================

export async function getAllForms(req, res) {
  try {
    const {
      data,
      error,
    } = await supabase
      .from('forms')
      .select('*')
      .eq('status', 'active')
      .order('created_at', {
        ascending: false,
      })

    // -----------------------------------------------
    // Database error
    // -----------------------------------------------

    if (error) {
      console.error(
        'Get all forms error:',
        error
      )

      return res.status(500).json({
        success: false,
        message: 'Failed to fetch forms',
        error: error.message,
      })
    }

    // -----------------------------------------------
    // Success
    // -----------------------------------------------

    return res.status(200).json({
      success: true,
      count: data.length,
      forms: data,
    })
  } catch (error) {
    console.error(
      'Get all forms error:',
      error
    )

    return res.status(500).json({
      success: false,
      message: 'Unable to fetch forms',
      error: error.message,
    })
  }
}


// =====================================================
// 2. GET SINGLE FORM BY CODE
// GET /api/forms/:code
// =====================================================

export async function getFormByCode(req, res) {
  try {
    // -----------------------------------------------
    // Get form code from URL
    // -----------------------------------------------

    const { code } = req.params

    if (!code) {
      return res.status(400).json({
        success: false,
        message: 'Form code is required',
      })
    }

    // -----------------------------------------------
    // Find active form
    // -----------------------------------------------

    const {
      data,
      error,
    } = await supabase
      .from('forms')
      .select('*')
      .eq('form_code', code)
      .eq('status', 'active')
      .single()

    // -----------------------------------------------
    // Form not found
    // -----------------------------------------------

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          message: 'Form not found',
        })
      }

      console.error(
        'Get form by code error:',
        error
      )

      return res.status(500).json({
        success: false,
        message: 'Failed to fetch form',
        error: error.message,
      })
    }

    // -----------------------------------------------
    // Success
    // -----------------------------------------------

    return res.status(200).json({
      success: true,
      form: data,
    })
  } catch (error) {
    console.error(
      'Get form by code error:',
      error
    )

    return res.status(500).json({
      success: false,
      message: 'Unable to fetch form',
      error: error.message,
    })
  }
}


// =====================================================
// 3. GET FORMS BY CATEGORY
// GET /api/forms/category/:category
// =====================================================

export async function getFormsByCategory(req, res) {
  try {
    // -----------------------------------------------
    // Get category from URL
    // -----------------------------------------------

    const { category } = req.params

    if (!category) {
      return res.status(400).json({
        success: false,
        message: 'Category is required',
      })
    }

    // -----------------------------------------------
    // Find active forms in category
    // -----------------------------------------------

    const {
      data,
      error,
    } = await supabase
      .from('forms')
      .select('*')
      .eq('category', category)
      .eq('status', 'active')
      .order('created_at', {
        ascending: false,
      })

    // -----------------------------------------------
    // Database error
    // -----------------------------------------------

    if (error) {
      console.error(
        'Get forms by category error:',
        error
      )

      return res.status(500).json({
        success: false,
        message:
          'Failed to fetch forms by category',
        error: error.message,
      })
    }

    // -----------------------------------------------
    // Success
    // -----------------------------------------------

    return res.status(200).json({
      success: true,
      category,
      count: data.length,
      forms: data,
    })
  } catch (error) {
    console.error(
      'Get forms by category error:',
      error
    )

    return res.status(500).json({
      success: false,
      message:
        'Unable to fetch forms by category',
      error: error.message,
    })
  }
}