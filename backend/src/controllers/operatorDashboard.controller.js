import { supabase } from '../config/supabase.js'

// ======================================================
// GET OPERATOR DASHBOARD
// ======================================================

export async function getOperatorDashboard(
  req,
  res
) {
  try {
    // --------------------------------------------------
    // 1. GET CURRENT OPERATOR
    // --------------------------------------------------

    const operatorId = req.user?.id

    if (!operatorId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      })
    }

    // --------------------------------------------------
    // 2. VERIFY OPERATOR PROFILE
    // --------------------------------------------------

    const {
      data: operator,
      error: operatorError,
    } = await supabase
      .from('profiles')
      .select(
        'id, full_name, phone, role, operator_status'
      )
      .eq(
        'id',
        operatorId
      )
      .single()

    if (
      operatorError ||
      !operator
    ) {
      return res.status(404).json({
        success: false,
        message: 'Operator profile not found',
      })
    }

    if (
      operator.role !== 'operator'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Operator access required',
      })
    }

    // --------------------------------------------------
    // 3. GET OPERATOR ASSIGNMENTS
    // --------------------------------------------------

    const {
      data: assignments,
      error: assignmentsError,
    } = await supabase
      .from(
        'application_operator_assignments'
      )
      .select(`
        id,
        application_id,
        operator_id,
        status,
        assigned_at,
        started_at,
        completed_at,
        created_at,
        updated_at
      `)
      .eq(
        'operator_id',
        operatorId
      )
      .order(
        'assigned_at',
        {
          ascending: false,
        }
      )

    if (assignmentsError) {
      console.error(
        'Operator assignments error:',
        assignmentsError
      )

      return res.status(500).json({
        success: false,
        message:
          'Unable to fetch operator assignments',
        error:
          assignmentsError.message,
      })
    }

    const assignmentList =
      assignments || []

    // --------------------------------------------------
    // 4. CALCULATE DASHBOARD COUNTS
    // --------------------------------------------------

    const counts = {
      assigned: 0,
      in_progress: 0,
      awaiting_review: 0,
      completed: 0,
      cancelled: 0,
      total: assignmentList.length,
    }

    for (
      const assignment
      of assignmentList
    ) {
      if (
        Object.prototype.hasOwnProperty.call(
          counts,
          assignment.status
        )
      ) {
        counts[
          assignment.status
        ] += 1
      }
    }

    // --------------------------------------------------
    // 5. GET APPLICATION IDS
    // --------------------------------------------------

    const applicationIds =
      assignmentList.map(
        (assignment) =>
          assignment.application_id
      )

    let applications = []

    // --------------------------------------------------
    // 6. FETCH APPLICATION DATA
    // --------------------------------------------------

    if (
      applicationIds.length > 0
    ) {
      const {
        data,
        error,
      } = await supabase
        .from('applications')
        .select(`
          id,
          applicant_id,
          form_id,
          application_number,
          status,
          current_step,
          form_data,
          submitted_at,
          created_at,
          updated_at
        `)
        .in(
          'id',
          applicationIds
        )
        .order(
          'updated_at',
          {
            ascending: false,
          }
        )

      if (error) {
        console.error(
          'Operator applications error:',
          error
        )

        return res.status(500).json({
          success: false,
          message:
            'Unable to fetch assigned applications',
          error:
            error.message,
        })
      }

      applications =
        data || []
    }

    // --------------------------------------------------
    // 7. COMBINE ASSIGNMENTS + APPLICATIONS
    // --------------------------------------------------

    const applicationMap =
      new Map()

    for (
      const application
      of applications
    ) {
      applicationMap.set(
        application.id,
        application
      )
    }

    const assignedApplications =
      assignmentList
        .map(
          (assignment) => {
            const application =
              applicationMap.get(
                assignment.application_id
              )

            return {
              assignment: {
                id:
                  assignment.id,

                status:
                  assignment.status,

                assigned_at:
                  assignment.assigned_at,

                started_at:
                  assignment.started_at,

                completed_at:
                  assignment.completed_at,

                created_at:
                  assignment.created_at,

                updated_at:
                  assignment.updated_at,
              },

              application:
                application || null,
            }
          }
        )
        .filter(
          (item) =>
            item.application !==
            null
        )

    // --------------------------------------------------
    // 8. CURRENT ACTIVE WORKLOAD
    // --------------------------------------------------

    const activeWorkload =
      counts.assigned +
      counts.in_progress +
      counts.awaiting_review

    // --------------------------------------------------
    // 9. FINAL RESPONSE
    // --------------------------------------------------

    return res.status(200).json({
      success: true,

      operator: {
        id: operator.id,

        full_name:
          operator.full_name,

        phone:
          operator.phone,

        role:
          operator.role,

        operator_status:
          operator.operator_status,
      },

      stats: {
        total:
          counts.total,

        assigned:
          counts.assigned,

        in_progress:
          counts.in_progress,

        awaiting_review:
          counts.awaiting_review,

        completed:
          counts.completed,

        cancelled:
          counts.cancelled,

        active_workload:
          activeWorkload,
      },

      applications:
        assignedApplications,
    })
  } catch (error) {
    console.error(
      'Operator dashboard error:',
      error
    )

    return res.status(500).json({
      success: false,
      message:
        'Unable to load operator dashboard',
    })
  }
}