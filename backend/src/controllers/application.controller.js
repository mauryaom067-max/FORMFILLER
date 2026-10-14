import {
  supabase,
  supabaseAdmin,
} from '../config/supabase.js'
import {
  autoAssignApplication,
} from '../services/operatorAssignment.service.js'


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
// HELPER: GET APPLICANT FOR LOGGED-IN USER
// =====================================================

async function getApplicantForUser(userId) {
  if (!userId) {
    return {
      applicant: null,
      error: 'Authenticated user not found',
    }
  }

  const {
    data: applicant,
    error,
  } = await supabase
    .from('applicants')
    .select('*')
    .eq('profile_id', userId)
    .maybeSingle()

  if (error) {
    return {
      applicant: null,
      error: error.message,
    }
  }

  if (!applicant) {
    return {
      applicant: null,
      error: 'Applicant profile not found',
    }
  }

  return {
    applicant,
    error: null,
  }
}


// =====================================================
// GET MY APPLICATIONS
// GET /api/applications
// =====================================================

export async function getMyApplications(req, res) {
  try {
    const userId = getUserId(req)

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      })
    }

    const {
      applicant,
      error: applicantError,
    } = await getApplicantForUser(userId)

    if (applicantError) {
      return res.status(404).json({
        success: false,
        message: applicantError,
      })
    }

    const {
      data,
      error,
    } = await supabase
      .from('applications')
      .select(`
        *,
        forms (
          id,
          form_code,
          form_name,
          description,
          category,
          authority_name,
          application_fee,
          service_fee,
          total_fee,
          status,
          requirements
        )
      `)
      .eq(
        'applicant_id',
        applicant.id
      )
      .order('created_at', {
        ascending: false,
      })

    if (error) {
      console.error(
        'Get applications error:',
        error
      )

      return res.status(500).json({
        success: false,
        message:
          'Failed to fetch applications',
        error: error.message,
      })
    }

    return res.status(200).json({
      success: true,
      count: data?.length || 0,
      applications: data || [],
    })
  } catch (error) {
    console.error(
      'Get applications error:',
      error
    )

    return res.status(500).json({
      success: false,
      message:
        'Unable to fetch applications',
      error: error.message,
    })
  }
}


// =====================================================
// CREATE APPLICATION
// POST /api/applications
// =====================================================

export async function createApplication(req, res) {
  try {
    const userId = getUserId(req)

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      })
    }

    const {
      applicant,
      error: applicantError,
    } = await getApplicantForUser(userId)

    if (applicantError) {
      return res.status(404).json({
        success: false,
        message: applicantError,
      })
    }

    const {
      formId,
      formCode,
      status = 'draft',
      currentStep = 1,
      formData = {},
    } = req.body

    if (!formId) {
      return res.status(400).json({
        success: false,
        message: 'formId is required',
      })
    }

    // -------------------------------------------------
    // VERIFY FORM
    // -------------------------------------------------

    const {
      data: form,
      error: formError,
    } = await supabase
      .from('forms')
      .select('*')
      .eq('id', formId)
      .eq('status', 'active')
      .single()

    if (formError || !form) {
      return res.status(404).json({
        success: false,
        message:
          'Form not found or inactive',
      })
    }

    // -------------------------------------------------
    // CHECK EXISTING DRAFT
    // -------------------------------------------------

    const {
      data: existingApplication,
      error: existingError,
    } = await supabase
      .from('applications')
      .select('*')
      .eq(
        'applicant_id',
        applicant.id
      )
      .eq(
        'form_id',
        formId
      )
      .eq(
        'status',
        'draft'
      )
      .maybeSingle()

    if (existingError) {
      console.error(
        'Check existing application error:',
        existingError
      )

      return res.status(500).json({
        success: false,
        message:
          'Failed to check existing application',
        error:
          existingError.message,
      })
    }

    if (existingApplication) {
      return res.status(200).json({
        success: true,
        message:
          'Existing draft application found',
        application:
          existingApplication,
        existing: true,
      })
    }

    // -------------------------------------------------
    // GENERATE APPLICATION NUMBER
    // -------------------------------------------------

    const applicationNumber =
      `FF-${Date.now()}-${Math.floor(
        1000 +
        Math.random() * 9000
      )}`

    // -------------------------------------------------
    // CREATE APPLICATION
    // -------------------------------------------------

    const {
      data: application,
      error,
    } = await supabase
      .from('applications')
      .insert({
        applicant_id:
          applicant.id,
        form_id:
          formId,
        application_number:
          applicationNumber,
        status,
        current_step:
          currentStep,
        form_data:
          formData,
      })
      .select()
      .single()

    if (error) {
      console.error(
        'Create application error:',
        error
      )

      return res.status(500).json({
        success: false,
        message:
          'Failed to create application',
        error:
          error.message,
      })
    }

    return res.status(201).json({
      success: true,
      message:
        'Application created successfully',
      application,
    })
  } catch (error) {
    console.error(
      'Create application error:',
      error
    )

    return res.status(500).json({
      success: false,
      message:
        'Unable to create application',
      error: error.message,
    })
  }
}


// =====================================================
// GET SINGLE APPLICATION
// GET /api/applications/:id
//
// ACCESS:
// applicant -> own application
// operator  -> assigned application
// admin     -> any application
// =====================================================

export async function getApplicationById(
  req,
  res
) {
  try {
    const userId =
      getUserId(req)

    if (!userId) {
      return res.status(401).json({
        success: false,
        message:
          'Authentication required',
      })
    }

    const { id } =
      req.params

    if (!id) {
      return res.status(400).json({
        success: false,
        message:
          'Application ID is required',
      })
    }

    // =================================================
    // CURRENT USER PROFILE
    // =================================================

    const {
      data: profile,
      error: profileError,
    } = await supabase
      .from('profiles')
      .select(`
        id,
        full_name,
        phone,
        role
      `)
      .eq(
        'id',
        userId
      )
      .single()

    if (
      profileError ||
      !profile
    ) {
      console.error(
        'Current user profile error:',
        profileError
      )

      return res.status(404).json({
        success: false,
        message:
          'User profile not found',
        debug: {
          userId,
          error:
            profileError?.message ||
            null,
          code:
            profileError?.code ||
            null,
        },
      })
    }

    // =================================================
    // GET APPLICATION
    // =================================================

    const {
      data: application,
      error: applicationError,
    } = await supabase
      .from('applications')
      .select(`
        *,
        forms (
          id,
          form_code,
          form_name,
          description,
          category,
          authority_name,
          application_fee,
          service_fee,
          total_fee,
          status,
          requirements
        )
      `)
      .eq(
        'id',
        id
      )
      .single()

    if (applicationError) {
      console.error(
        'Get application error:',
        applicationError
      )

      if (
        applicationError.code ===
        'PGRST116'
      ) {
        return res.status(404).json({
          success: false,
          message:
            'Application not found',
          debug: {
            applicationId: id,
            code:
              applicationError.code,
          },
        })
      }

      return res.status(500).json({
        success: false,
        message:
          'Failed to fetch application',
        error:
          applicationError.message,
        debug: {
          applicationId: id,
          code:
            applicationError.code ||
            null,
          details:
            applicationError.details ||
            null,
          hint:
            applicationError.hint ||
            null,
        },
      })
    }

    if (!application) {
      return res.status(404).json({
        success: false,
        message:
          'Application not found',
      })
    }

    console.log(
      'APPLICATION LOADED:',
      {
        applicationId:
          application.id,
        applicantId:
          application.applicant_id,
        currentUserId:
          userId,
        currentUserRole:
          profile.role,
      }
    )

    // =================================================
    // APPLICANT ACCESS
    // =================================================

    if (
      profile.role ===
      'applicant'
    ) {
      const {
        data: applicant,
        error:
          applicantError,
      } = await supabase
        .from('applicants')
        .select('*')
        .eq(
          'id',
          application.applicant_id
        )
        .eq(
          'profile_id',
          userId
        )
        .single()

      if (
        applicantError ||
        !applicant
      ) {
        console.error(
          'APPLICANT ACCESS FAILED:',
          {
            applicationId:
              id,
            applicationApplicantId:
              application.applicant_id,
            loggedInUserId:
              userId,
            applicantError,
            applicant,
          }
        )

        return res.status(403).json({
          success: false,
          message:
            'You do not have access to this application',
          debug: {
            applicationId:
              id,
            applicantId:
              application.applicant_id,
            userId,
            error:
              applicantError?.message ||
              null,
            code:
              applicantError?.code ||
              null,
            details:
              applicantError?.details ||
              null,
            hint:
              applicantError?.hint ||
              null,
          },
        })
      }

      return res.status(200).json({
        success: true,
        application,
        applicant,
      })
    }

    // =================================================
    // OPERATOR ACCESS
    // =================================================

    if (
      profile.role ===
      'operator'
    ) {
      // -----------------------------------------------
      // CHECK ASSIGNMENT
      // -----------------------------------------------

      const {
        data: assignment,
        error:
          assignmentError,
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
          completed_at
        `)
        .eq(
          'application_id',
          id
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

      if (
        assignmentError
      ) {
        console.error(
          'OPERATOR ASSIGNMENT CHECK FAILED:',
          {
            applicationId:
              id,
            operatorId:
              userId,
            error:
              assignmentError,
          }
        )

        return res.status(500).json({
          success: false,
          message:
            'Failed to verify operator assignment',
          error:
            assignmentError.message,
          debug: {
            code:
              assignmentError.code ||
              null,
            details:
              assignmentError.details ||
              null,
            hint:
              assignmentError.hint ||
              null,
          },
        })
      }

      if (!assignment) {
        console.error(
          'OPERATOR ASSIGNMENT NOT FOUND:',
          {
            applicationId:
              id,
            operatorId:
              userId,
          }
        )

        return res.status(403).json({
          success: false,
          message:
            'You are not assigned to this application',
          debug: {
            applicationId:
              id,
            operatorId:
              userId,
          },
        })
      }

      // -----------------------------------------------
      // GET APPLICANT
      // -----------------------------------------------

      let applicant = null

      const {
        data: applicantData,
        error: applicantError,
      } = await supabase
        .from('applicants')
        .select('*')
        .eq(
          'id',
          application.applicant_id
        )
        .maybeSingle()

      if (applicantError) {
        console.error(
          'OPERATOR APPLICANT QUERY FAILED:',
          {
            applicationId:
              id,
            applicantId:
              application.applicant_id,
            operatorId:
              userId,
            error:
              applicantError,
          }
        )
      } else {
        applicant = applicantData
      }

      // -----------------------------------------------
      // GET APPLICANT PROFILE
      // -----------------------------------------------

      let applicantProfile = null

      if (applicant?.profile_id) {
        const {
          data: profileData,
          error:
            applicantProfileError,
        } = await supabase
          .from('profiles')
          .select(`
            id,
            full_name,
            phone,
            role
          `)
          .eq(
            'id',
            applicant.profile_id
          )
          .maybeSingle()

        if (
          applicantProfileError
        ) {
          console.error(
            'Applicant profile fetch error:',
            applicantProfileError
          )
        } else {
          applicantProfile =
            profileData
        }
      }

      // -----------------------------------------------
      // FALLBACK APPLICANT DATA
      // -----------------------------------------------

      if (!applicant) {
        const formData =
          application.form_data ||
          {}

        const personalDetails =
          formData.personalDetails ||
          {}

        const additionalDetails =
          formData.additionalDetails ||
          {}

        applicant = {
          id:
            application.applicant_id,

          profile_id:
            null,

          date_of_birth:
            personalDetails.dateOfBirth ||
            null,

          gender:
            personalDetails.gender ||
            null,

          nationality:
            personalDetails.nationality ||
            'Indian',

          category:
            additionalDetails.category ||
            null,

          is_pwd:
            false,

          disability_type:
            null,

          disability_percentage:
            null,

          profile: {
            id: null,

            full_name:
              personalDetails.fullName ||
              'Applicant',

            phone:
              additionalDetails.mobile ||
              null,

            role:
              'applicant',
          },
        }
      } else {
        applicant = {
          ...applicant,

          profile:
            applicantProfile ||
            null,
        }
      }

      console.log(
        'OPERATOR APPLICATION ACCESS GRANTED:',
        {
          applicationId:
            id,
          operatorId:
            userId,
          applicantId:
            application.applicant_id,
          applicantFound:
            Boolean(
              applicantData
            ),
          profileFound:
            Boolean(
              applicantProfile
            ),
        }
      )

      return res.status(200).json({
        success: true,

        application,

        assignment,

        applicant,
      })
    }

    // =================================================
    // ADMIN ACCESS
    // =================================================

    if (
      profile.role ===
      'admin'
    ) {
      const {
        data: applicant,
        error:
          applicantError,
      } = await supabase
        .from('applicants')
        .select('*')
        .eq(
          'id',
          application.applicant_id
        )
        .maybeSingle()

      if (
        applicantError
      ) {
        console.error(
          'ADMIN APPLICANT QUERY FAILED:',
          applicantError
        )

        return res.status(500).json({
          success: false,
          message:
            'Failed to fetch applicant data',
          error:
            applicantError.message,
        })
      }

      if (!applicant) {
        return res.status(404).json({
          success: false,
          message:
            'Applicant data not found',
        })
      }

      const {
        data:
          applicantProfile,
        error:
          applicantProfileError,
      } = await supabase
        .from('profiles')
        .select(`
          id,
          full_name,
          phone,
          role
        `)
        .eq(
          'id',
          applicant.profile_id
        )
        .maybeSingle()

      if (
        applicantProfileError
      ) {
        console.error(
          'Admin applicant profile error:',
          applicantProfileError
        )
      }

      return res.status(200).json({
        success: true,

        application,

        applicant: {
          ...applicant,

          profile:
            applicantProfile ||
            null,
        },
      })
    }

    // =================================================
    // UNKNOWN ROLE
    // =================================================

    return res.status(403).json({
      success: false,
      message:
        'Your account does not have permission to access applications',
    })
  } catch (error) {
    console.error(
      'Get application error:',
      error
    )

    return res.status(500).json({
      success: false,
      message:
        'Unable to fetch application',
      error: error.message,
    })
  }
}


// =====================================================
// UPDATE APPLICATION
// PATCH /api/applications/:id
// =====================================================

export async function updateApplication(
  req,
  res
) {
  try {
    const userId =
      getUserId(req)

    if (!userId) {
      return res.status(401).json({
        success: false,
        message:
          'Authentication required',
      })
    }

    const {
      applicant,
      error:
        applicantError,
    } =
      await getApplicantForUser(
        userId
      )

    if (applicantError) {
      return res.status(404).json({
        success: false,
        message:
          applicantError,
      })
    }

    const { id } =
      req.params

    if (!id) {
      return res.status(400).json({
        success: false,
        message:
          'Application ID is required',
      })
    }

    const {
      formData,
      currentStep,
      status,
    } = req.body

    const updateData = {
      updated_at:
        new Date().toISOString(),
    }

    if (
      formData !== undefined
    ) {
      updateData.form_data =
        formData
    }

    if (
      currentStep !== undefined
    ) {
      updateData.current_step =
        currentStep
    }

    if (
      status !== undefined
    ) {
      updateData.status =
        status
    }

    const {
      data: application,
      error,
    } = await supabase
      .from('applications')
      .update(
        updateData
      )
      .eq(
        'id',
        id
      )
      .eq(
        'applicant_id',
        applicant.id
      )
      .select()
      .single()

    if (error) {
      if (
        error.code ===
        'PGRST116'
      ) {
        return res.status(404).json({
          success: false,
          message:
            'Application not found',
        })
      }

      console.error(
        'Update application error:',
        error
      )

      return res.status(500).json({
        success: false,
        message:
          'Failed to update application',
        error:
          error.message,
      })
    }

    return res.status(200).json({
      success: true,
      message:
        'Application updated successfully',
      application,
    })
  } catch (error) {
    console.error(
      'Update application error:',
      error
    )

    return res.status(500).json({
      success: false,
      message:
        'Unable to update application',
      error: error.message,
    })
  }
}


// =====================================================
// VALIDATE APPLICATION
// POST /api/applications/:id/validate
// =====================================================

export async function validateApplication(
  req,
  res
) {
  try {
    const userId =
      getUserId(req)

    if (!userId) {
      return res.status(401).json({
        success: false,
        message:
          'Authentication required',
      })
    }

    const {
      applicant,
      error:
        applicantError,
    } =
      await getApplicantForUser(
        userId
      )

    if (applicantError) {
      return res.status(404).json({
        success: false,
        message:
          applicantError,
      })
    }

    const { id } =
      req.params

    if (!id) {
      return res.status(400).json({
        success: false,
        message:
          'Application ID is required',
      })
    }

    const {
      data: application,
      error:
        applicationError,
    } = await supabase
      .from('applications')
      .select(`
        *,
        forms (
          id,
          form_code,
          form_name,
          requirements
        )
      `)
      .eq(
        'id',
        id
      )
      .eq(
        'applicant_id',
        applicant.id
      )
      .single()

    if (
      applicationError
    ) {
      if (
        applicationError.code ===
        'PGRST116'
      ) {
        return res.status(404).json({
          success: false,
          message:
            'Application not found',
        })
      }

      return res.status(500).json({
        success: false,
        message:
          'Failed to fetch application',
        error:
          applicationError.message,
      })
    }

    const errors = []

    const formData =
      application.form_data ||
      {}

    const personalDetails =
      formData.personalDetails ||
      {}

    const additionalDetails =
      formData.additionalDetails ||
      {}

    // -------------------------------------------------
    // PERSONAL DETAILS
    // -------------------------------------------------

    if (
      !personalDetails.fullName?.trim()
    ) {
      errors.push({
        field:
          'personalDetails.fullName',
        message:
          'Full Name is required.',
      })
    }

    if (
      !personalDetails.dateOfBirth
    ) {
      errors.push({
        field:
          'personalDetails.dateOfBirth',
        message:
          'Date of Birth is required.',
      })
    }

    if (
      !personalDetails.fatherName?.trim()
    ) {
      errors.push({
        field:
          'personalDetails.fatherName',
        message:
          "Father's Name is required.",
      })
    }

    if (
      !personalDetails.gender?.trim()
    ) {
      errors.push({
        field:
          'personalDetails.gender',
        message:
          'Gender is required.',
      })
    }

    // -------------------------------------------------
    // ADDITIONAL DETAILS
    // -------------------------------------------------

    if (
      !additionalDetails.address?.trim()
    ) {
      errors.push({
        field:
          'additionalDetails.address',
        message:
          'Address is required.',
      })
    }

    if (
      !additionalDetails.mobile?.trim()
    ) {
      errors.push({
        field:
          'additionalDetails.mobile',
        message:
          'Mobile Number is required.',
      })
    }

    if (
      !additionalDetails.category?.trim()
    ) {
      errors.push({
        field:
          'additionalDetails.category',
        message:
          'Category is required.',
      })
    }

    if (
      !additionalDetails.preferredCities?.trim()
    ) {
      errors.push({
        field:
          'additionalDetails.preferredCities',
        message:
          'Preferred Exam City is required.',
      })
    }

    // -------------------------------------------------
    // APPLICATION DOCUMENTS
    // -------------------------------------------------

    const {
      data:
        applicationDocuments,
      error:
        documentsError,
    } = await supabase
      .from(
        'application_documents'
      )
      .select(`
        id,
        document_type,
        is_required,
        status,
        document_id
      `)
      .eq(
        'application_id',
        id
      )

    if (
      documentsError
    ) {
      console.error(
        'Validation documents error:',
        documentsError
      )

      return res.status(500).json({
        success: false,
        message:
          'Failed to validate application documents',
        error:
          documentsError.message,
      })
    }

    const attachedDocuments =
      applicationDocuments ||
      []

    // -------------------------------------------------
    // REQUIRED DOCUMENTS
    // -------------------------------------------------

    const requiredDocuments = [
      'aadhaar',
      'photograph',
      'signature',
      '10th_marksheet',
    ]

    for (
      const documentType
      of requiredDocuments
    ) {
      const attached =
        attachedDocuments.find(
          (document) =>
            document.document_type ===
              documentType &&
            document.status !==
              'rejected'
        )

      if (!attached) {
        errors.push({
          field:
            `documents.${documentType}`,
          message:
            `${formatDocumentName(
              documentType
            )} is required.`,
        })
      }
    }

    const valid =
      errors.length === 0

    return res.status(200).json({
      success: true,
      valid,
      errors,
    })
  } catch (error) {
    console.error(
      'Validate application error:',
      error
    )

    return res.status(500).json({
      success: false,
      message:
        'Unable to validate application',
      error: error.message,
    })
  }
}


// =====================================================
// PREPARE PAYMENT
// POST /api/applications/:id/prepare-payment
// =====================================================

export async function preparePayment(
  req,
  res
) {
  try {
    const userId =
      getUserId(req)

    if (!userId) {
      return res.status(401).json({
        success: false,
        message:
          'Authentication required',
      })
    }

    const {
      applicant,
      error:
        applicantError,
    } =
      await getApplicantForUser(
        userId
      )

    if (applicantError) {
      return res.status(404).json({
        success: false,
        message:
          applicantError,
      })
    }

    const { id } =
      req.params

    if (!id) {
      return res.status(400).json({
        success: false,
        message:
          'Application ID is required',
      })
    }

    const {
      data: application,
      error,
    } = await supabase
      .from('applications')
      .select(`
        *,
        forms (
          id,
          form_code,
          form_name,
          application_fee,
          service_fee,
          total_fee
        )
      `)
      .eq(
        'id',
        id
      )
      .eq(
        'applicant_id',
        applicant.id
      )
      .single()

    if (error) {
      if (
        error.code ===
        'PGRST116'
      ) {
        return res.status(404).json({
          success: false,
          message:
            'Application not found',
        })
      }

      return res.status(500).json({
        success: false,
        message:
          'Failed to fetch payment details',
        error:
          error.message,
      })
    }

    const form =
      application.forms

    if (!form) {
      return res.status(404).json({
        success: false,
        message:
          'Form details not found',
      })
    }

    const applicationFee =
      Number(
        form.application_fee ||
          0
      )

    const serviceFee =
      Number(
        form.service_fee ||
          0
      )

    const totalFee =
      applicationFee +
      serviceFee

    // -------------------------------------------------
    // MOVE TO PAYMENT PENDING
    // -------------------------------------------------

    if (
      application.status !==
      'paid'
    ) {
      const {
        data:
          updatedApplication,
        error:
          updateError,
      } = await supabase
        .from('applications')
        .update({
          status:
            'payment_pending',
          current_step:
            3,
          updated_at:
            new Date().toISOString(),
        })
        .eq(
          'id',
          id
        )
        .eq(
          'applicant_id',
          applicant.id
        )
        .select()
        .single()

      if (
        updateError
      ) {
        console.error(
          'Prepare payment update error:',
          updateError
        )

        return res.status(500).json({
          success: false,
          message:
            'Failed to prepare payment',
          error:
            updateError.message,
        })
      }

      return res.status(200).json({
        success: true,
        message:
          'Payment prepared successfully',
        payment: {
          applicationFee,
          serviceFee,
          totalFee,
        },
        application:
          updatedApplication,
      })
    }

    return res.status(200).json({
      success: true,
      message:
        'Application is already paid',
      payment: {
        applicationFee,
        serviceFee,
        totalFee,
      },
      application,
    })
  } catch (error) {
    console.error(
      'Prepare payment error:',
      error
    )

    return res.status(500).json({
      success: false,
      message:
        'Unable to prepare payment',
      error: error.message,
    })
  }
}


// =====================================================
// CONFIRM PAYMENT
// POST /api/applications/:id/confirm-payment
//
// PAYMENT FLOW:
// 1. Verify applicant
// 2. Confirm payment
// 3. Move application to paid
// 4. Automatically assign operator
// =====================================================

export async function confirmPayment(
  req,
  res
) {
  try {
    const userId =
      getUserId(req)

    if (!userId) {
      return res.status(401).json({
        success: false,
        message:
          'Authentication required',
      })
    }

    const {
      applicant,
      error:
        applicantError,
    } =
      await getApplicantForUser(
        userId
      )

    if (applicantError) {
      return res.status(404).json({
        success: false,
        message:
          applicantError,
      })
    }

    const { id } =
      req.params

    if (!id) {
      return res.status(400).json({
        success: false,
        message:
          'Application ID is required',
      })
    }

    // -------------------------------------------------
    // GET APPLICATION
    // -------------------------------------------------

    const {
      data: application,
      error:
        applicationError,
    } = await supabase
      .from('applications')
      .select(`
        *,
        forms (
          id,
          form_code,
          form_name,
          application_fee,
          service_fee,
          total_fee
        )
      `)
      .eq(
        'id',
        id
      )
      .eq(
        'applicant_id',
        applicant.id
      )
      .single()

    if (
      applicationError
    ) {
      if (
        applicationError.code ===
        'PGRST116'
      ) {
        return res.status(404).json({
          success: false,
          message:
            'Application not found',
        })
      }

      return res.status(500).json({
        success: false,
        message:
          'Failed to fetch application',
        error:
          applicationError.message,
      })
    }

    // =================================================
    // ALREADY PAID
    // =================================================

    if (
      application.status ===
      'paid'
    ) {
      let assignmentResult =
        null

      try {
        assignmentResult =
          await autoAssignApplication(
            id
          )
      } catch (
        assignmentError
      ) {
        console.error(
          'Auto assignment error for already-paid application:',
          assignmentError
        )

        assignmentResult = {
          success: false,
          assigned: false,
          reason:
            assignmentError.message,
        }
      }

      return res.status(200).json({
        success: true,
        message:
          'Application is already paid',
        paymentStatus:
          'paid',
        alreadyPaid: true,
        application,
        assignment:
          assignmentResult,
      })
    }

    // =================================================
    // CONFIRM PAYMENT
    // =================================================

    const {
      data:
        updatedApplication,
      error:
        updateError,
    } = await supabase
      .from('applications')
      .update({
        status: 'paid',
        current_step:
          4,
        updated_at:
          new Date().toISOString(),
      })
      .eq(
        'id',
        id
      )
      .eq(
        'applicant_id',
        applicant.id
      )
      .select(`
        *,
        forms (
          id,
          form_code,
          form_name,
          application_fee,
          service_fee,
          total_fee
        )
      `)
      .single()

    if (
      updateError
    ) {
      console.error(
        'Confirm payment update error:',
        updateError
      )

      return res.status(500).json({
        success: false,
        message:
          'Failed to confirm payment',
        error:
          updateError.message,
      })
    }

    // =================================================
    // AUTO ASSIGN OPERATOR
    // =================================================

    let assignmentResult =
      null

    try {
      assignmentResult =
        await autoAssignApplication(
          id
        )
    } catch (
      assignmentError
    ) {
      console.error(
        'Auto assignment error:',
        assignmentError
      )

      assignmentResult = {
        success: false,
        assigned: false,
        reason:
          assignmentError.message,
      }
    }

    return res.status(200).json({
      success: true,
      message:
        'Payment confirmed successfully',
      paymentStatus:
        'paid',
      application:
        updatedApplication,
      assignment:
        assignmentResult,
    })
  } catch (error) {
    console.error(
      'Confirm payment error:',
      error
    )

    return res.status(500).json({
      success: false,
      message:
        'Unable to confirm payment',
      error: error.message,
    })
  }
}


// =====================================================
// GET APPLICATION DOCUMENTS
// GET /api/applications/:id/documents
// =====================================================

export async function getApplicationDocuments(
  req,
  res
) {
  try {
    const userId =
      getUserId(req)

    if (!userId) {
      return res.status(401).json({
        success: false,
        message:
          'Authentication required',
      })
    }

    const { id } =
      req.params

    if (!id) {
      return res.status(400).json({
        success: false,
        message:
          'Application ID is required',
      })
    }

    // =================================================
    // GET USER PROFILE
    // =================================================

    const {
      data: profile,
      error:
        profileError,
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
      .single()

    if (
      profileError ||
      !profile
    ) {
      return res.status(404).json({
        success: false,
        message:
          'User profile not found',
      })
    }

    // =================================================
    // GET APPLICATION
    // =================================================

    const {
      data: application,
      error:
        applicationError,
    } = await supabase
      .from('applications')
      .select(`
        id,
        applicant_id
      `)
      .eq(
        'id',
        id
      )
      .single()

    if (
      applicationError ||
      !application
    ) {
      return res.status(404).json({
        success: false,
        message:
          'Application not found',
      })
    }

    // =================================================
    // CHECK ACCESS
    // =================================================

    if (
      profile.role ===
      'applicant'
    ) {
      const {
        data: applicant,
      } = await supabase
        .from('applicants')
        .select('id')
        .eq(
          'id',
          application.applicant_id
        )
        .eq(
          'profile_id',
          userId
        )
        .maybeSingle()

      if (!applicant) {
        return res.status(403).json({
          success: false,
          message:
            'You do not have access to this application',
        })
      }
    }

    if (
      profile.role ===
      'operator'
    ) {
      const {
        data: assignment,
        error:
          assignmentError,
      } = await supabase
        .from(
          'application_operator_assignments'
        )
        .select('id')
        .eq(
          'application_id',
          id
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

      if (
        assignmentError
      ) {
        return res.status(500).json({
          success: false,
          message:
            'Failed to verify operator assignment',
          error:
            assignmentError.message,
        })
      }

      if (!assignment) {
        return res.status(403).json({
          success: false,
          message:
            'You are not assigned to this application',
        })
      }
    }

    if (
      profile.role !==
        'applicant' &&
      profile.role !==
        'operator' &&
      profile.role !==
        'admin'
    ) {
      return res.status(403).json({
        success: false,
        message:
          'You do not have permission to view these documents',
      })
    }

    // =================================================
    // GET DOCUMENTS
    // =================================================

    const {
      data,
      error,
    } = await supabase
      .from(
        'application_documents'
      )
      .select(`
        *,
        documents (
          id,
          document_type,
          document_name,
          storage_path,
          file_url,
          mime_type,
          file_size,
          source,
          verification_status,
          uploaded_at
        )
      `)
      .eq(
        'application_id',
        id
      )
      .order(
        'created_at',
        {
          ascending: false,
        }
      )

    if (error) {
      console.error(
        'Get application documents error:',
        error
      )

      return res.status(500).json({
        success: false,
        message:
          'Failed to fetch application documents',
        error:
          error.message,
      })
    }

    return res.status(200).json({
      success: true,
      count:
        data?.length || 0,
      documents:
        data || [],
    })
  } catch (error) {
    console.error(
      'Get application documents error:',
      error
    )

    return res.status(500).json({
      success: false,
      message:
        'Unable to fetch application documents',
      error: error.message,
    })
  }
}


// =====================================================
// ATTACH DOCUMENT TO APPLICATION
// POST /api/applications/:id/documents
// =====================================================

export async function attachDocumentToApplication(
  req,
  res
) {
  try {
    const userId =
      getUserId(req)

    if (!userId) {
      return res.status(401).json({
        success: false,
        message:
          'Authentication required',
      })
    }

    const {
      applicant,
      error:
        applicantError,
    } =
      await getApplicantForUser(
        userId
      )

    if (applicantError) {
      return res.status(404).json({
        success: false,
        message:
          applicantError,
      })
    }

    const { id } =
      req.params

    const {
      documentId,
      documentType,
      source = 'upload',
      isRequired = true,
    } = req.body

    // -------------------------------------------------
    // VERIFY APPLICATION
    // -------------------------------------------------

    const {
      data: application,
      error:
        applicationError,
    } = await supabase
      .from('applications')
      .select('id')
      .eq(
        'id',
        id
      )
      .eq(
        'applicant_id',
        applicant.id
      )
      .single()

    if (
      applicationError ||
      !application
    ) {
      return res.status(404).json({
        success: false,
        message:
          'Application not found',
      })
    }

    // -------------------------------------------------
    // VAULT DOCUMENT
    // -------------------------------------------------

    let finalDocumentId =
      documentId

    if (
      source === 'vault' &&
      !finalDocumentId
    ) {
      if (!documentType) {
        return res.status(400).json({
          success: false,
          message:
            'documentType is required for vault document',
        })
      }

      const {
        data:
          vaultDocument,
        error:
          vaultError,
      } = await supabase
        .from('documents')
        .select('id')
        .eq(
          'profile_id',
          userId
        )
        .eq(
          'document_type',
          documentType
        )
        .order(
          'uploaded_at',
          {
            ascending: false,
          }
        )
        .limit(1)
        .maybeSingle()

      if (
        vaultError
      ) {
        return res.status(500).json({
          success: false,
          message:
            'Failed to find vault document',
          error:
            vaultError.message,
        })
      }

      if (
        !vaultDocument
      ) {
        return res.status(404).json({
          success: false,
          message:
            'Matching vault document not found',
        })
      }

      finalDocumentId =
        vaultDocument.id
    }

    if (!finalDocumentId) {
      return res.status(400).json({
        success: false,
        message:
          'documentId is required',
      })
    }

    // -------------------------------------------------
    // VERIFY DOCUMENT OWNERSHIP
    // -------------------------------------------------

    const {
      data: document,
      error:
        documentError,
    } = await supabase
      .from('documents')
      .select('*')
      .eq(
        'id',
        finalDocumentId
      )
      .eq(
        'profile_id',
        userId
      )
      .single()

    if (
      documentError ||
      !document
    ) {
      return res.status(404).json({
        success: false,
        message:
          'Document not found or access denied',
      })
    }

    const finalDocumentType =
      documentType ||
      document.document_type

    // -------------------------------------------------
    // CHECK DUPLICATE
    // -------------------------------------------------

    const {
      data: existing,
      error:
        existingError,
    } = await supabase
      .from(
        'application_documents'
      )
      .select('*')
      .eq(
        'application_id',
        id
      )
      .eq(
        'document_id',
        finalDocumentId
      )
      .maybeSingle()

    if (
      existingError
    ) {
      return res.status(500).json({
        success: false,
        message:
          'Failed to check existing document',
        error:
          existingError.message,
      })
    }

    if (existing) {
      return res.status(200).json({
        success: true,
        message:
          'Document is already attached',
        applicationDocument:
          existing,
        existing: true,
      })
    }

    // -------------------------------------------------
    // ATTACH DOCUMENT
    // -------------------------------------------------

    const {
      data:
        applicationDocument,
      error,
    } = await supabase
      .from(
        'application_documents'
      )
      .insert({
        application_id:
          id,
        document_id:
          finalDocumentId,
        document_type:
          finalDocumentType,
        is_required:
          isRequired,
        status:
          'pending',
      })
      .select()
      .single()

    if (error) {
      console.error(
        'Attach application document error:',
        error
      )

      return res.status(500).json({
        success: false,
        message:
          'Failed to attach document to application',
        error:
          error.message,
      })
    }

    return res.status(201).json({
      success: true,
      message:
        'Document attached to application successfully',
      applicationDocument,
    })
  } catch (error) {
    console.error(
      'Attach application document error:',
      error
    )

    return res.status(500).json({
      success: false,
      message:
        'Unable to attach document',
      error: error.message,
    })
  }
}


// =====================================================
// DELETE APPLICATION DOCUMENT
// DELETE /api/applications/:id/documents/:documentId
// =====================================================

export async function removeApplicationDocument(
  req,
  res
) {
  try {
    const userId =
      getUserId(req)

    if (!userId) {
      return res.status(401).json({
        success: false,
        message:
          'Authentication required',
      })
    }

    const {
      applicant,
      error:
        applicantError,
    } =
      await getApplicantForUser(
        userId
      )

    if (applicantError) {
      return res.status(404).json({
        success: false,
        message:
          applicantError,
      })
    }

    const {
      id,
      documentId,
    } = req.params

    // -------------------------------------------------
    // VERIFY APPLICATION
    // -------------------------------------------------

    const {
      data: application,
      error:
        applicationError,
    } = await supabase
      .from('applications')
      .select('id')
      .eq(
        'id',
        id
      )
      .eq(
        'applicant_id',
        applicant.id
      )
      .single()

    if (
      applicationError ||
      !application
    ) {
      return res.status(404).json({
        success: false,
        message:
          'Application not found',
      })
    }

    // -------------------------------------------------
    // DELETE ATTACHMENT
    // -------------------------------------------------

    const {
      data,
      error,
    } = await supabase
      .from(
        'application_documents'
      )
      .delete()
      .eq(
        'application_id',
        id
      )
      .eq(
        'document_id',
        documentId
      )
      .select()
      .single()

    if (error) {
      if (
        error.code ===
        'PGRST116'
      ) {
        return res.status(404).json({
          success: false,
          message:
            'Application document not found',
        })
      }

      console.error(
        'Remove application document error:',
        error
      )

      return res.status(500).json({
        success: false,
        message:
          'Failed to remove application document',
        error:
          error.message,
      })
    }

    return res.status(200).json({
      success: true,
      message:
        'Document removed from application',
      applicationDocument:
        data,
    })
  } catch (error) {
    console.error(
      'Remove application document error:',
      error
    )

    return res.status(500).json({
      success: false,
      message:
        'Unable to remove application document',
      error: error.message,
    })
  }
}


// =====================================================
// HELPER: DOCUMENT NAME
// =====================================================

function formatDocumentName(
  type
) {
  const names = {
    aadhaar:
      'Aadhaar Card',

    photograph:
      'Passport Size Photograph',

    photo:
      'Passport Size Photograph',

    signature:
      'Signature',

    '10th_marksheet':
      'Class 10 Marksheet',

    '12th_marksheet':
      'Class 12 Marksheet',

    caste_certificate:
      'Caste Certificate',
  }

  return (
    names[type] ||
    type
      ?.replaceAll(
        '_',
        ' '
      )
      ?.replace(
        /\b\w/g,
        (char) =>
          char.toUpperCase()
      )
  )
}
// =====================================================
// APPROVE APPLICATION
// POST /api/applications/:id/approve
//
// FLOW:
// 1. Verify logged-in applicant
// 2. Verify application belongs to applicant
// 3. Verify final PDF exists
// 4. Approve application
// 5. Move application to step 5
// =====================================================

export async function approveApplication(req, res) {
  try {
    console.log('========================================')
    console.log('APPROVE APPLICATION REQUEST')
    console.log('========================================')

    // -------------------------------------------------
    // GET LOGGED-IN USER
    // -------------------------------------------------

    const userId = getUserId(req)

    console.log('Approve userId:', userId)

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      })
    }

    // -------------------------------------------------
    // GET APPLICATION ID
    // -------------------------------------------------

    const { id } = req.params

    console.log('Approve application ID:', id)

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Application ID is required',
      })
    }

    // -------------------------------------------------
    // GET APPLICANT
    // -------------------------------------------------

    const {
      applicant,
      error: applicantError,
    } = await getApplicantForUser(userId)

    if (applicantError || !applicant) {
      console.error(
        'Approve applicant lookup failed:',
        applicantError
      )

      return res.status(404).json({
        success: false,
        message:
          applicantError ||
          'Applicant profile not found',
      })
    }

    console.log('Approve applicant:', applicant.id)

    // -------------------------------------------------
    // GET APPLICATION
    // -------------------------------------------------

    const {
      data: application,
      error: applicationError,
    } = await supabase
      .from('applications')
      .select('*')
      .eq('id', id)
      .eq('applicant_id', applicant.id)
      .single()

    if (applicationError) {
      console.error(
        'Approve application lookup error:',
        applicationError
      )

      if (applicationError.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          message: 'Application not found',
        })
      }

      return res.status(500).json({
        success: false,
        message: 'Failed to fetch application',
        error: applicationError.message,
        debug: {
          code: applicationError.code || null,
          details: applicationError.details || null,
          hint: applicationError.hint || null,
        },
      })
    }

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found',
      })
    }

    console.log(
      'Current application status:',
      application.status
    )

    console.log(
      'Current application step:',
      application.current_step
    )

    // -------------------------------------------------
    // ALREADY SUBMITTED
    // -------------------------------------------------

    if (application.status === 'submitted') {
      return res.status(400).json({
        success: false,
        message: 'Application has already been submitted',
      })
    }

    // -------------------------------------------------
    // ALREADY APPROVED
    // -------------------------------------------------

    if (application.status === 'approved') {
      return res.status(200).json({
        success: true,
        message: 'Application is already approved',
        application,
      })
    }

    // -------------------------------------------------
    // VERIFY FINAL APPLICATION PDF
    //
    // IMPORTANT:
    // Use supabaseAdmin here because this is a
    // privileged server-side verification.
    // -------------------------------------------------

    console.log(
      'Checking current final PDF for application:',
      id
    )

    const {
      data: finalFile,
      error: finalFileError,
    } = await supabaseAdmin
      .from('application_final_files')
      .select(`
        id,
        application_id,
        version,
        file_name,
        storage_path,
        mime_type,
        file_size,
        screenshot_count,
        uploaded_by,
        is_current,
        created_at,
        updated_at
      `)
      .eq('application_id', id)
      .eq('is_current', true)
      .maybeSingle()

    if (finalFileError) {
      console.error(
        'Approve application final file lookup error:',
        finalFileError
      )

      return res.status(500).json({
        success: false,
        message:
          'Failed to verify final application PDF',
        error: finalFileError.message,
        debug: {
          code: finalFileError.code || null,
          details: finalFileError.details || null,
          hint: finalFileError.hint || null,
        },
      })
    }

    console.log(
      'Current final PDF:',
      finalFile
    )

    if (!finalFile) {
      return res.status(400).json({
        success: false,
        message:
          'Final application PDF is not available yet',
      })
    }

    // -------------------------------------------------
    // SAFETY CHECK
    // -------------------------------------------------

    if (
      finalFile.application_id &&
      finalFile.application_id !== id
    ) {
      console.error(
        'Final PDF application mismatch:',
        {
          expectedApplicationId: id,
          actualApplicationId:
            finalFile.application_id,
        }
      )

      return res.status(400).json({
        success: false,
        message:
          'Final application PDF does not belong to this application',
      })
    }

    // -------------------------------------------------
    // APPROVE APPLICATION
    // -------------------------------------------------

    const approvalTime =
      new Date().toISOString()

    console.log(
      'Approving application:',
      id
    )

    const {
      data: updatedApplication,
      error: updateError,
    } = await supabaseAdmin
      .from('applications')
      .update({
        status: 'approved',
        current_step: 5,
        updated_at: approvalTime,
      })
      .eq('id', id)
      .eq('applicant_id', applicant.id)
      .select('*')
      .single()

    if (updateError) {
      console.error(
        'Approve application update error:',
        updateError
      )

      return res.status(500).json({
        success: false,
        message:
          'Failed to approve application',
        error: updateError.message,
        debug: {
          code: updateError.code || null,
          details: updateError.details || null,
          hint: updateError.hint || null,
        },
      })
    }

    if (!updatedApplication) {
      return res.status(500).json({
        success: false,
        message:
          'Application approval did not return an updated application',
      })
    }

    console.log(
      'APPLICATION APPROVED SUCCESSFULLY:',
      {
        applicationId: updatedApplication.id,
        status: updatedApplication.status,
        currentStep:
          updatedApplication.current_step,
        finalFileId: finalFile.id,
        finalFileVersion:
          finalFile.version,
      }
    )

    // -------------------------------------------------
    // SUCCESS RESPONSE
    // -------------------------------------------------

    return res.status(200).json({
      success: true,
      message:
        'Application approved successfully',

      application:
        updatedApplication,

      finalFile,

      approval: {
        approved: true,
        approvedAt: approvalTime,
        finalFileVersion:
          finalFile.version,
      },
    })
  } catch (error) {
    console.error(
      'Approve application unexpected error:',
      error
    )

    return res.status(500).json({
      success: false,
      message:
        'Unable to approve application',
      error: error.message,
    })
  }
}

// =====================================================
// SUBMIT APPLICATION
// POST /api/applications/:id/submit
// Operator submits application on government portal
// =====================================================

export async function submitApplication(req, res) {
  try {
    const userId = getUserId(req)

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      })
    }

    const { id } = req.params

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Application ID is required',
      })
    }

    // -------------------------------------------------
    // GET OPERATOR PROFILE
    // -------------------------------------------------

    const {
      data: profile,
      error: profileError,
    } = await supabase
      .from('profiles')
      .select(`
        id,
        full_name,
        role
      `)
      .eq('id', userId)
      .single()

    if (profileError || !profile) {
      return res.status(404).json({
        success: false,
        message: 'Operator profile not found',
      })
    }

    if (profile.role !== 'operator') {
      return res.status(403).json({
        success: false,
        message:
          'Only an operator can submit the application',
      })
    }

    // -------------------------------------------------
    // GET GOVERNMENT CREDENTIALS
    // -------------------------------------------------

    const governmentApplicationNumber =
      String(
        req.body?.governmentApplicationNumber || ''
      ).trim()

    const governmentApplicationPassword =
      String(
        req.body?.governmentApplicationPassword || ''
      ).trim()

    // -------------------------------------------------
    // VALIDATE GOVERNMENT CREDENTIALS
    // -------------------------------------------------

    if (!governmentApplicationNumber) {
      return res.status(400).json({
        success: false,
        message:
          'Government application number is required',
      })
    }

    if (!governmentApplicationPassword) {
      return res.status(400).json({
        success: false,
        message:
          'Government portal password is required',
      })
    }

    // -------------------------------------------------
    // GET APPLICATION
    // -------------------------------------------------

    const {
      data: application,
      error: applicationError,
    } = await supabase
      .from('applications')
      .select('*')
      .eq('id', id)
      .single()

    if (applicationError || !application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found',
      })
    }

    // -------------------------------------------------
    // APPLICATION STATUS
    // -------------------------------------------------

    if (application.status === 'submitted') {
      return res.status(400).json({
        success: false,
        message:
          'Application has already been submitted',
      })
    }

    if (application.status !== 'approved') {
      return res.status(400).json({
        success: false,
        message:
          'Application must be approved before submission',
        currentStatus: application.status,
      })
    }

    // -------------------------------------------------
    // CHECK OPERATOR ASSIGNMENT
    // -------------------------------------------------

    const {
      data: assignment,
      error: assignmentError,
    } = await supabase
      .from('application_operator_assignments')
      .select(`
        id,
        application_id,
        operator_id,
        status
      `)
      .eq('application_id', id)
      .eq('operator_id', userId)
      .in('status', [
        'assigned',
        'in_progress',
        'awaiting_review',
        'completed',
      ])
      .order('created_at', {
        ascending: false,
      })
      .limit(1)
      .maybeSingle()

    if (assignmentError) {
      console.error(
        'Assignment lookup error:',
        assignmentError
      )

      return res.status(500).json({
        success: false,
        message:
          'Unable to verify operator assignment',
        error: assignmentError.message,
      })
    }

    if (!assignment) {
      return res.status(403).json({
        success: false,
        message:
          'You are not assigned to this application',
      })
    }

    // -------------------------------------------------
    // GET CURRENT FINAL PDF
    // -------------------------------------------------

    const {
      data: finalFile,
      error: finalFileError,
    } = await supabase
      .from('application_final_files')
      .select(`
        id,
        application_id,
        version,
        file_name,
        storage_path,
        mime_type,
        file_size,
        screenshot_count,
        uploaded_by,
        is_current,
        created_at,
        updated_at
      `)
      .eq('application_id', id)
      .eq('is_current', true)
      .maybeSingle()

    if (finalFileError) {
      console.error(
        'Final file lookup error:',
        finalFileError
      )

      return res.status(500).json({
        success: false,
        message:
          'Failed to verify final application PDF',
        error: finalFileError.message,
      })
    }

    if (!finalFile) {
      return res.status(400).json({
        success: false,
        message:
          'Final application PDF is not available',
      })
    }

    // -------------------------------------------------
    // UPDATE APPLICATION
    // -------------------------------------------------

    const submittedAt =
      new Date().toISOString()

    const {
      data: updatedApplication,
      error: updateError,
    } = await supabase
      .from('applications')
      .update({
        status: 'submitted',
        current_step: 6,

        government_application_number:
          governmentApplicationNumber,

        government_application_password:
          governmentApplicationPassword,

        submitted_at: submittedAt,
        submitted_by: userId,
        updated_at: submittedAt,
      })
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      console.error(
        'Final submission update error:',
        updateError
      )

      return res.status(500).json({
        success: false,
        message:
          'Failed to mark application as submitted',
        error: updateError.message,
      })
    }

    // -------------------------------------------------
    // COMPLETE OPERATOR ASSIGNMENT
    // -------------------------------------------------

    const {
      error: assignmentUpdateError,
    } = await supabase
      .from(
        'application_operator_assignments'
      )
      .update({
        status: 'completed',
        completed_at: submittedAt,
      })
      .eq('id', assignment.id)

    if (assignmentUpdateError) {
      console.error(
        'Assignment completion update error:',
        assignmentUpdateError
      )
    }

    // -------------------------------------------------
    // SUCCESS
    // -------------------------------------------------

    return res.status(200).json({
      success: true,

      message:
        'Application submitted successfully',

      application:
        updatedApplication,

      finalFile,

      submittedAt,

      governmentApplicationNumber,

      governmentApplicationPassword,
    })

  } catch (error) {
    console.error(
      'Final submission error:',
      error
    )

    return res.status(500).json({
      success: false,
      message:
        'Unable to submit application',
      error: error.message,
    })
  }
}