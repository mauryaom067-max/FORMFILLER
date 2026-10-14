import { supabase } from '../config/supabase.js'

// ==========================================
// GET MY PROFILE
// ==========================================

export async function getProfile(req, res) {
  try {
    const userId = req.user.id

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found',
        error: error.message,
      })
    }

    return res.status(200).json({
      success: true,
      profile: data,
    })
  } catch (error) {
    console.error('Get profile error:', error)

    return res.status(500).json({
      success: false,
      message: 'Unable to fetch profile',
    })
  }
}

// ==========================================
// UPDATE MY PROFILE
// ==========================================

export async function updateProfile(req, res) {
  try {
    const userId = req.user.id

    const {
      fullName,
      phone,
    } = req.body

    const updates = {}

    if (fullName !== undefined) {
      updates.full_name = fullName
    }

    if (phone !== undefined) {
      updates.phone = phone
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No profile fields provided for update',
      })
    }

    updates.updated_at = new Date().toISOString()

    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single()

    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Unable to update profile',
        error: error.message,
      })
    }

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      profile: data,
    })
  } catch (error) {
    console.error('Update profile error:', error)

    return res.status(500).json({
      success: false,
      message: 'Unable to update profile',
    })
  }
}