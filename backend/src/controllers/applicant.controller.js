import { supabase } from '../config/supabase.js'

// ==========================================
// GET MY APPLICANT PROFILE
// ==========================================

export async function getApplicant(req, res) {
  try {
    const userId = req.user.id

    const { data, error } = await supabase
      .from('applicants')
      .select('*')
      .eq('profile_id', userId)
      .maybeSingle()

    if (error) {
      return res.status(500).json({
        success: false,
        message: 'Unable to fetch applicant profile',
        error: error.message,
      })
    }

    return res.status(200).json({
      success: true,
      applicant: data,
    })
  } catch (error) {
    console.error('Get applicant error:', error)

    return res.status(500).json({
      success: false,
      message: 'Unable to fetch applicant profile',
    })
  }
}

// ==========================================
// CREATE APPLICANT PROFILE
// ==========================================

export async function createApplicant(req, res) {
  try {
    const userId = req.user.id

    const {
      dateOfBirth,
      gender,
      nationality,
      category,
      isPwd,
      disabilityType,
      disabilityPercentage,
    } = req.body

    // Check if applicant profile already exists
    const { data: existingApplicant, error: existingError } =
      await supabase
        .from('applicants')
        .select('id')
        .eq('profile_id', userId)
        .maybeSingle()

    if (existingError) {
      return res.status(500).json({
        success: false,
        message: 'Unable to check applicant profile',
        error: existingError.message,
      })
    }

    if (existingApplicant) {
      return res.status(409).json({
        success: false,
        message: 'Applicant profile already exists',
      })
    }

    const { data, error } = await supabase
      .from('applicants')
      .insert({
        profile_id: userId,
        date_of_birth: dateOfBirth || null,
        gender: gender || null,
        nationality: nationality || 'Indian',
        category: category || null,
        is_pwd: isPwd ?? false,
        disability_type: disabilityType || null,
        disability_percentage:
          disabilityPercentage ?? null,
      })
      .select()
      .single()

    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Unable to create applicant profile',
        error: error.message,
      })
    }

    return res.status(201).json({
      success: true,
      message: 'Applicant profile created successfully',
      applicant: data,
    })
  } catch (error) {
    console.error('Create applicant error:', error)

    return res.status(500).json({
      success: false,
      message: 'Unable to create applicant profile',
    })
  }
}

// ==========================================
// UPDATE APPLICANT PROFILE
// ==========================================

export async function updateApplicant(req, res) {
  try {
    const userId = req.user.id

    const {
      dateOfBirth,
      gender,
      nationality,
      category,
      isPwd,
      disabilityType,
      disabilityPercentage,
    } = req.body

    const updates = {}

    if (dateOfBirth !== undefined) {
      updates.date_of_birth = dateOfBirth
    }

    if (gender !== undefined) {
      updates.gender = gender
    }

    if (nationality !== undefined) {
      updates.nationality = nationality
    }

    if (category !== undefined) {
      updates.category = category
    }

    if (isPwd !== undefined) {
      updates.is_pwd = isPwd
    }

    if (disabilityType !== undefined) {
      updates.disability_type = disabilityType
    }

    if (disabilityPercentage !== undefined) {
      updates.disability_percentage =
        disabilityPercentage
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No applicant fields provided for update',
      })
    }

    updates.updated_at = new Date().toISOString()

    const { data, error } = await supabase
      .from('applicants')
      .update(updates)
      .eq('profile_id', userId)
      .select()
      .single()

    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Unable to update applicant profile',
        error: error.message,
      })
    }

    return res.status(200).json({
      success: true,
      message: 'Applicant profile updated successfully',
      applicant: data,
    })
  } catch (error) {
    console.error('Update applicant error:', error)

    return res.status(500).json({
      success: false,
      message: 'Unable to update applicant profile',
    })
  }
}