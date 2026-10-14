import { supabase } from '../config/supabase.js'

export async function requireOperator(
  req,
  res,
  next
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
      .select('id, full_name, phone, role')
      .eq('id', req.user.id)
      .single()

    if (error || !profile) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found',
      })
    }

    if (profile.role !== 'operator') {
      return res.status(403).json({
        success: false,
        message: 'Operator access required',
      })
    }

    req.profile = profile

    next()
  } catch (error) {
    console.error(
      'Operator role middleware error:',
      error
    )

    return res.status(500).json({
      success: false,
      message:
        'Operator authorization verification failed',
    })
  }
}