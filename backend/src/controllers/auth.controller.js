import { supabase, supabaseAdmin } from '../config/supabase.js'

// ======================================================
// SIGNUP
// ======================================================

export async function signup(req, res) {
  try {
    const { email, password, fullName, phone } = req.body

    if (!email || !password || !fullName) {
      return res.status(400).json({
        success: false,
        message: 'Email, password and full name are required',
      })
    }

    // Create Supabase Auth user
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          phone: phone || null,
        },
      },
    })

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      })
    }

    if (!data?.user) {
      return res.status(400).json({
        success: false,
        message: 'Unable to create user',
      })
    }

    // Create/update profile using admin client
    const {
      data: profile,
      error: profileError,
    } = await supabaseAdmin
      .from('profiles')
      .upsert(
        {
          id: data.user.id,
          full_name: fullName,
          phone: phone || null,
          role: 'applicant',
        },
        {
          onConflict: 'id',
        }
      )
      .select()
      .single()

    if (profileError) {
      console.error('Profile creation error:', profileError)

      return res.status(500).json({
        success: false,
        message: 'User created but profile creation failed',
        error: profileError.message,
      })
    }

    return res.status(201).json({
      success: true,
      message: 'Account created successfully',
      user: data.user,
      profile,
      session: data.session,
    })
  } catch (error) {
    console.error('Signup error:', error)

    return res.status(500).json({
      success: false,
      message: 'Signup failed',
    })
  }
}

// ======================================================
// LOGIN
// ======================================================

export async function login(req, res) {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
      })
    }

    console.log(`🔐 Login attempt: ${email}`)

    // IMPORTANT:
    // Auth operation is handled by Supabase Auth client.
    const {
      data,
      error,
    } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      console.error('Supabase login error:', error.message)

      return res.status(401).json({
        success: false,
        message: error.message,
      })
    }

    if (!data?.user || !data?.session) {
      return res.status(401).json({
        success: false,
        message: 'Login failed. No valid session returned.',
      })
    }

    console.log(`✅ Auth successful: ${data.user.id}`)

    // IMPORTANT:
    // Profile query uses admin client.
    const {
      data: profile,
      error: profileError,
    } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .maybeSingle()

    if (profileError) {
      console.error('Login profile error:', profileError)

      return res.status(500).json({
        success: false,
        message: 'Unable to load user profile',
        error: profileError.message,
      })
    }

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found',
      })
    }

    console.log(`✅ Profile loaded: ${profile.full_name}`)

    return res.status(200).json({
      success: true,
      message: 'Login successful',

      user: data.user,

      profile,

      session: {
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
        expires_in: data.session.expires_in,
        expires_at: data.session.expires_at,
        token_type: data.session.token_type,
      },
    })
  } catch (error) {
    console.error('Login error:', error)

    return res.status(500).json({
      success: false,
      message: 'Login failed',
      error:
        process.env.NODE_ENV === 'development'
          ? error.message
          : undefined,
    })
  }
}

// ======================================================
// OPERATOR LOGIN
// ======================================================

export async function operatorLogin(req, res) {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
      })
    }

    const {
      data,
      error,
    } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      console.error('Operator auth error:', error.message)

      return res.status(401).json({
        success: false,
        message: 'Invalid operator credentials',
      })
    }

    if (!data?.user || !data?.session) {
      return res.status(401).json({
        success: false,
        message: 'Operator login failed',
      })
    }

    // Admin client for profile lookup
    const {
      data: profile,
      error: profileError,
    } = await supabaseAdmin
      .from('profiles')
      .select('id, full_name, phone, role')
      .eq('id', data.user.id)
      .maybeSingle()

    if (profileError) {
      console.error(
        'Operator profile error:',
        profileError
      )

      return res.status(500).json({
        success: false,
        message: 'Unable to load operator profile',
      })
    }

    if (!profile) {
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
      message: 'Operator login successful',

      user: data.user,

      profile,

      session: {
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
        expires_in: data.session.expires_in,
        expires_at: data.session.expires_at,
        token_type: data.session.token_type,
      },
    })
  } catch (error) {
    console.error('Operator login error:', error)

    return res.status(500).json({
      success: false,
      message: 'Operator login failed',
    })
  }
}

// ======================================================
// LOGOUT
// ======================================================

export async function logout(req, res) {
  try {
    return res.status(200).json({
      success: true,
      message: 'Logout successful',
    })
  } catch (error) {
    console.error('Logout error:', error)

    return res.status(500).json({
      success: false,
      message: 'Logout failed',
    })
  }
}

// ======================================================
// GET CURRENT USER
// ======================================================

export async function getMe(req, res) {
  try {
    const userId = req.user.id

    const {
      data: profile,
      error,
    } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle()

    if (error) {
      console.error('Get profile error:', error)

      return res.status(500).json({
        success: false,
        message: 'Unable to load profile',
      })
    }

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found',
      })
    }

    return res.status(200).json({
      success: true,
      user: req.user,
      profile,
    })
  } catch (error) {
    console.error('Get me error:', error)

    return res.status(500).json({
      success: false,
      message: 'Unable to fetch user',
    })
  }
}