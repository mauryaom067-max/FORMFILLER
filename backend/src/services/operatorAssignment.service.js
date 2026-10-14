import { supabase } from '../config/supabase.js'

// ======================================================
// AUTO ASSIGN APPLICATION TO OPERATOR
// ======================================================

export async function autoAssignApplication(
  applicationId
) {
  if (!applicationId) {
    throw new Error(
      'Application ID is required for operator assignment'
    )
  }

  // --------------------------------------------------
  // SECURE DATABASE ASSIGNMENT FUNCTION
  // --------------------------------------------------

  const {
    data,
    error,
  } = await supabase.rpc(
    'auto_assign_application',
    {
      p_application_id:
        applicationId,
    }
  )

  if (error) {
    throw new Error(
      `Unable to auto assign application: ${error.message}`
    )
  }

  if (!data) {
    throw new Error(
      'No assignment result was returned'
    )
  }

  // --------------------------------------------------
  // RETURN DATABASE RESULT
  // --------------------------------------------------

  return data
}