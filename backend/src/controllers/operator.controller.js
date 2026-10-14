import { supabase } from '../config/supabase.js'

// ======================================================
// GET CURRENT OPERATOR
// ======================================================

export async function getCurrentOperator(
  req,
  res
) {
  try {
    if (!req.user?.id) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      })
    }

    const {
      data: profile,
      error,
    } = await supabase
      .from('profiles')
      .select(
        'id, full_name, phone, role, created_at, updated_at'
      )
      .eq(
        'id',
        req.user.id
      )
      .single()

    if (error || !profile) {
      return res.status(404).json({
        success: false,
        message: 'Operator profile not found',
      })
    }

    if (profile.role !== 'operator') {
      return res.status(403).json({
        success: false,
        message: 'Operator access required',
      })
    }

    return res.status(200).json({
      success: true,

      operator: {
        id: profile.id,
        full_name: profile.full_name,
        phone: profile.phone,
        role: profile.role,
        created_at: profile.created_at,
        updated_at: profile.updated_at,
      },
    })
  } catch (error) {
    console.error(
      'Get current operator error:',
      error
    )

    return res.status(500).json({
      success: false,
      message:
        'Unable to fetch operator profile',
    })
  }
}