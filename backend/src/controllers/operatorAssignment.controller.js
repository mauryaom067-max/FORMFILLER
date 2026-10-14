import {
  autoAssignApplication,
} from '../services/operatorAssignment.service.js'

// ======================================================
// TEST AUTO ASSIGNMENT
// DEVELOPMENT ONLY
// ======================================================

export async function testAutoAssignApplication(
  req,
  res
) {
  try {
    // --------------------------------------------------
    // DEVELOPMENT SAFETY CHECK
    // --------------------------------------------------

    if (
      process.env.NODE_ENV !==
      'development'
    ) {
      return res.status(404).json({
        success: false,
        message: 'Route not found',
      })
    }

    // --------------------------------------------------
    // APPLICATION ID
    // --------------------------------------------------

    const {
      applicationId,
    } = req.body

    if (!applicationId) {
      return res.status(400).json({
        success: false,
        message:
          'applicationId is required',
      })
    }

    // --------------------------------------------------
    // AUTO ASSIGN
    // --------------------------------------------------

    const result =
      await autoAssignApplication(
        applicationId
      )

    return res.status(200).json({
      success: true,
      message:
        result.alreadyAssigned
          ? 'Application is already assigned'
          : result.assigned
            ? 'Application assigned successfully'
            : 'Application could not be assigned',

      result,
    })
  } catch (error) {
    console.error(
      'Test auto assignment error:',
      error
    )

    return res.status(500).json({
      success: false,
      message:
        'Auto assignment test failed',
      error: error.message,
    })
  }
}