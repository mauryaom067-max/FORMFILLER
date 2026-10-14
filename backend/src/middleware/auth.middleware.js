import { supabase } from '../config/supabase.js'

export async function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authorization token is required',
      })
    }

    const token = authHeader.replace('Bearer ', '').trim()

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Invalid authorization token',
      })
    }

    const { data, error } = await supabase.auth.getUser(token)

    if (error || !data?.user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired authentication token',
      })
    }

    req.user = data.user

    next()
  } catch (error) {
    console.error('Auth middleware error:', error)

    return res.status(500).json({
      success: false,
      message: 'Authentication verification failed',
    })
  }
}