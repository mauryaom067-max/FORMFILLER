import { supabase } from '../config/supabase.js'

// =====================================================
// HELPER: GET LOGGED-IN USER ID
// =====================================================

function getUserId(req) {
  return (
    req.user?.id ||
    req.user?.user?.id ||
    req.auth?.user?.id ||
    null
  )
}

// =====================================================
// HELPER: GET APPLICATION
// =====================================================

async function getApplication(applicationId) {
  const {
    data,
    error,
  } = await supabase
    .from('applications')
    .select(`
      id,
      applicant_id,
      application_number,
      status,
      current_step
    `)
    .eq('id', applicationId)
    .maybeSingle()

  if (error) {
    console.error(
      'Get application for chat error:',
      error
    )

    return {
      application: null,
      error: error.message,
    }
  }

  if (!data) {
    return {
      application: null,
      error: 'Application not found',
    }
  }

  return {
    application: data,
    error: null,
  }
}

// =====================================================
// HELPER: CHECK WHETHER USER CAN ACCESS CHAT
// =====================================================

async function getChatParticipant(
  applicationId,
  userId
) {
  if (!userId) {
    return {
      allowed: false,
      role: null,
      application: null,
      error: 'Authenticated user not found',
    }
  }

  // ---------------------------------------------------
  // GET APPLICATION
  // ---------------------------------------------------

  const {
    application,
    error: applicationError,
  } = await getApplication(applicationId)

  if (applicationError) {
    return {
      allowed: false,
      role: null,
      application: null,
      error: applicationError,
    }
  }

  // ---------------------------------------------------
  // CHECK APPLICANT
  // ---------------------------------------------------

  const {
    data: applicant,
    error: applicantError,
  } = await supabase
    .from('applicants')
    .select(`
      id,
      profile_id
    `)
    .eq(
      'id',
      application.applicant_id
    )
    .maybeSingle()

  if (applicantError) {
    console.error(
      'Chat applicant check error:',
      applicantError
    )

    return {
      allowed: false,
      role: null,
      application,
      error: applicantError.message,
    }
  }

  // ---------------------------------------------------
  // APPLICANT ACCESS GRANTED
  // ---------------------------------------------------

  if (
    applicant &&
    applicant.profile_id === userId
  ) {
    return {
      allowed: true,
      role: 'applicant',
      application,
      error: null,
    }
  }

  // ---------------------------------------------------
  // CHECK ASSIGNED OPERATOR
  // ---------------------------------------------------

  const {
    data: assignment,
    error: assignmentError,
  } = await supabase
    .from(
      'application_operator_assignments'
    )
    .select(`
      id,
      application_id,
      operator_id,
      status
    `)
    .eq(
      'application_id',
      applicationId
    )
    .eq(
      'operator_id',
      userId
    )
    .in(
      'status',
      [
        'assigned',
        'in_progress',
        'awaiting_review',
        'completed',
      ]
    )
    .maybeSingle()

  if (assignmentError) {
    console.error(
      'Chat operator assignment check error:',
      assignmentError
    )

    return {
      allowed: false,
      role: null,
      application,
      error: assignmentError.message,
    }
  }

  // ---------------------------------------------------
  // OPERATOR ACCESS GRANTED
  // ---------------------------------------------------

  if (assignment) {
    return {
      allowed: true,
      role: 'operator',
      application,
      assignment,
      error: null,
    }
  }

  // ---------------------------------------------------
  // CHECK ADMIN
  // ---------------------------------------------------

  const {
    data: profile,
    error: profileError,
  } = await supabase
    .from('profiles')
    .select(`
      id,
      role
    `)
    .eq(
      'id',
      userId
    )
    .maybeSingle()

  if (profileError) {
    console.error(
      'Chat profile check error:',
      profileError
    )

    return {
      allowed: false,
      role: null,
      application,
      error: profileError.message,
    }
  }

  // ---------------------------------------------------
  // ADMIN ACCESS GRANTED
  // ---------------------------------------------------

  if (
    profile?.role === 'admin'
  ) {
    return {
      allowed: true,
      role: 'admin',
      application,
      error: null,
    }
  }

  // ---------------------------------------------------
  // ACCESS DENIED
  // ---------------------------------------------------

  return {
    allowed: false,
    role: null,
    application,
    error:
      'You are not allowed to access this application chat',
  }
}

// =====================================================
// GET APPLICATION CHAT
// GET /api/applications/:id/messages
// =====================================================

export async function getApplicationMessages(
  req,
  res
) {
  try {
    const userId = getUserId(req)

    if (!userId) {
      return res.status(401).json({
        success: false,
        message:
          'Authentication required',
      })
    }

    const {
      id: applicationId,
    } = req.params

    if (!applicationId) {
      return res.status(400).json({
        success: false,
        message:
          'Application ID is required',
      })
    }

    // -------------------------------------------------
    // CHECK ACCESS
    // -------------------------------------------------

    const {
      allowed,
      error: accessError,
    } = await getChatParticipant(
      applicationId,
      userId
    )

    if (!allowed) {
      return res.status(403).json({
        success: false,
        message:
          accessError ||
          'Chat access denied',
      })
    }

    // -------------------------------------------------
    // FETCH MESSAGES
    // -------------------------------------------------

    const {
      data: messages,
      error,
    } = await supabase
      .from('application_messages')
      .select(`
        id,
        application_id,
        sender_id,
        sender_role,
        message,
        message_type,
        read_at,
        created_at
      `)
      .eq(
        'application_id',
        applicationId
      )
      .order(
        'created_at',
        {
          ascending: true,
        }
      )

    if (error) {
      console.error(
        'Get application messages error:',
        error
      )

      return res.status(500).json({
        success: false,
        message:
          'Failed to fetch chat messages',
        error: error.message,
      })
    }

    return res.status(200).json({
      success: true,
      count:
        messages?.length || 0,
      messages:
        messages || [],
    })
  } catch (error) {
    console.error(
      'Get application messages error:',
      error
    )

    return res.status(500).json({
      success: false,
      message:
        'Unable to fetch chat messages',
      error: error.message,
    })
  }
}

// =====================================================
// SEND APPLICATION MESSAGE
// POST /api/applications/:id/messages
// =====================================================

export async function sendApplicationMessage(
  req,
  res
) {
  try {
    const userId = getUserId(req)

    if (!userId) {
      return res.status(401).json({
        success: false,
        message:
          'Authentication required',
      })
    }

    const {
      id: applicationId,
    } = req.params

    if (!applicationId) {
      return res.status(400).json({
        success: false,
        message:
          'Application ID is required',
      })
    }

    // -------------------------------------------------
    // CHECK ACCESS + GET ROLE
    // -------------------------------------------------

    const {
      allowed,
      role,
      error: accessError,
    } = await getChatParticipant(
      applicationId,
      userId
    )

    if (!allowed) {
      return res.status(403).json({
        success: false,
        message:
          accessError ||
          'Chat access denied',
      })
    }

    // -------------------------------------------------
    // GET REQUEST BODY
    // -------------------------------------------------

    const {
      message,
      messageType = 'text',
    } = req.body

    // -------------------------------------------------
    // VALIDATE MESSAGE
    // -------------------------------------------------

    if (
      !message ||
      typeof message !== 'string' ||
      !message.trim()
    ) {
      return res.status(400).json({
        success: false,
        message:
          'Message is required',
      })
    }

    // -------------------------------------------------
    // VALIDATE MESSAGE TYPE
    // -------------------------------------------------

    const allowedMessageTypes = [
      'text',
      'otp_request',
      'live_photo_request',
      'error_report',
      'system',
    ]

    if (
      !allowedMessageTypes.includes(
        messageType
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          'Invalid message type',
      })
    }

    // -------------------------------------------------
    // INSERT MESSAGE
    // -------------------------------------------------

    const {
      data: newMessage,
      error,
    } = await supabase
      .from('application_messages')
      .insert({
        application_id:
          applicationId,

        sender_id:
          userId,

        sender_role:
          role,

        message:
          message.trim(),

        message_type:
          messageType,
      })
      .select(`
        id,
        application_id,
        sender_id,
        sender_role,
        message,
        message_type,
        read_at,
        created_at
      `)
      .single()

    if (error) {
      console.error(
        'Send application message error:',
        error
      )

      return res.status(500).json({
        success: false,
        message:
          'Failed to send message',
        error: error.message,
      })
    }

    return res.status(201).json({
      success: true,
      message:
        'Message sent successfully',
      chatMessage:
        newMessage,
    })
  } catch (error) {
    console.error(
      'Send application message error:',
      error
    )

    return res.status(500).json({
      success: false,
      message:
        'Unable to send message',
      error: error.message,
    })
  }
}

// =====================================================
// MARK MESSAGE AS READ
// PATCH /api/applications/:id/messages/:messageId/read
// =====================================================

export async function markMessageAsRead(
  req,
  res
) {
  try {
    const userId = getUserId(req)

    if (!userId) {
      return res.status(401).json({
        success: false,
        message:
          'Authentication required',
      })
    }

    const {
      id: applicationId,
      messageId,
    } = req.params

    if (
      !applicationId ||
      !messageId
    ) {
      return res.status(400).json({
        success: false,
        message:
          'Application ID and message ID are required',
      })
    }

    // -------------------------------------------------
    // CHECK CHAT ACCESS
    // -------------------------------------------------

    const {
      allowed,
      error: accessError,
    } = await getChatParticipant(
      applicationId,
      userId
    )

    if (!allowed) {
      return res.status(403).json({
        success: false,
        message:
          accessError ||
          'Chat access denied',
      })
    }

    // -------------------------------------------------
    // MARK MESSAGE AS READ
    // -------------------------------------------------

    const {
      data: message,
      error,
    } = await supabase
      .from('application_messages')
      .update({
        read_at:
          new Date().toISOString(),
      })
      .eq(
        'id',
        messageId
      )
      .eq(
        'application_id',
        applicationId
      )
      .select(`
        id,
        application_id,
        sender_id,
        sender_role,
        message,
        message_type,
        read_at,
        created_at
      `)
      .single()

    if (error) {
      if (
        error.code === 'PGRST116'
      ) {
        return res.status(404).json({
          success: false,
          message:
            'Message not found',
        })
      }

      console.error(
        'Mark message read error:',
        error
      )

      return res.status(500).json({
        success: false,
        message:
          'Failed to mark message as read',
        error: error.message,
      })
    }

    return res.status(200).json({
      success: true,
      message:
        'Message marked as read',
      chatMessage:
        message,
    })
  } catch (error) {
    console.error(
      'Mark message read error:',
      error
    )

    return res.status(500).json({
      success: false,
      message:
        'Unable to mark message as read',
      error: error.message,
    })
  }
}