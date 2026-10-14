import {
  useEffect,
  useState,
} from 'react'

import {
  useNavigate,
} from 'react-router-dom'

import {
  ApplicantShell,
} from '../../components/layout/ApplicantShell'

import {
  Card,
  Button,
  ProgressSteps,
  Input,
  SectionLabel,
} from '../../components/ui'

import {
  apiRequest,
} from '../../lib/api/client'

import {
  useApp,
} from '../../lib/store'

// ======================================================
// APPLICATION STEPS
// ======================================================

const STEPS = [
  'Documents',
  'Application',
  'Payment',
  'Processing',
  'Review',
  'Submitted',
]

// ======================================================
// EMPTY FORM DATA
// ======================================================

const EMPTY_FORM_DATA = {
  personalDetails: {
    fullName: '',
    dateOfBirth: '',
    fatherName: '',
    gender: '',
  },

  additionalDetails: {
    address: '',
    mobile: '',
    category: '',
    preferredCities: '',
  },
}

// ======================================================
// APPLICATION FORM
// ======================================================

export default function ApplicationForm() {
  const navigate = useNavigate()

  const {
    user,
    accessToken,
    jeeApplication,
    ensureJeeApplication,
    updateApplicationData,
  } = useApp()

  // ====================================================
  // APPLICATION STATE
  // ====================================================

  const [
    application,
    setApplication,
  ] = useState(null)

  const [
    loading,
    setLoading,
  ] = useState(true)

  const [
    saving,
    setSaving,
  ] = useState(false)

  const [
    validating,
    setValidating,
  ] = useState(false)

  // ====================================================
  // MESSAGE STATE
  // ====================================================

  const [
    pageError,
    setPageError,
  ] = useState('')

  const [
    successMessage,
    setSuccessMessage,
  ] = useState('')

  // ====================================================
  // VALIDATION STATE
  // ====================================================

  const [
    validationErrors,
    setValidationErrors,
  ] = useState([])

  // ====================================================
  // FORM STATE
  // ====================================================

  const [
    formData,
    setFormData,
  ] = useState(
    EMPTY_FORM_DATA
  )

  // ====================================================
  // AUTH HEADERS
  // ====================================================

  function getAuthHeaders() {
    if (!accessToken) {
      throw new Error(
        'Authorization token is required. Please login again.'
      )
    }

    return {
      Authorization:
        `Bearer ${accessToken}`,
    }
  }

  // ====================================================
  // LOAD APPLICATION
  // ====================================================

  useEffect(() => {
    let cancelled = false

    async function loadApplication() {
      try {
        setLoading(true)
        setPageError('')
        setSuccessMessage('')
        setValidationErrors([])

        // ----------------------------------------------
        // LOGIN CHECK
        // ----------------------------------------------

        if (!user?.id) {
          throw new Error(
            'Please login to continue.'
          )
        }

        if (!accessToken) {
          throw new Error(
            'Authorization token is missing. Please login again.'
          )
        }

        // ----------------------------------------------
        // FIRST USE APPLICATION FROM STORE
        // ----------------------------------------------

        let loadedApplication =
          jeeApplication || null

        // ----------------------------------------------
        // IF APPLICATION IS NOT AVAILABLE,
        // ASK STORE TO LOAD/CREATE IT
        // ----------------------------------------------

        if (!loadedApplication?.id) {
          loadedApplication =
            await ensureJeeApplication(
              user
            )
        }

        // ----------------------------------------------
        // SAFETY CHECK
        // ----------------------------------------------

        if (
          cancelled
        ) {
          return
        }

        if (
          !loadedApplication?.id
        ) {
          throw new Error(
            'JEE Main application was not found.'
          )
        }

        // ----------------------------------------------
        // GET COMPLETE APPLICATION FROM BACKEND
        // ----------------------------------------------

        const result =
          await apiRequest(
            `/api/applications/${loadedApplication.id}`,
            {
              headers:
                getAuthHeaders(),
            }
          )

        if (
          cancelled
        ) {
          return
        }

        const backendApplication =
          result?.application

        if (
          !backendApplication
        ) {
          throw new Error(
            'Application data was not returned by the server.'
          )
        }

        // ----------------------------------------------
        // STORE LOCAL APPLICATION
        // ----------------------------------------------

        setApplication(
          backendApplication
        )

        // ----------------------------------------------
        // LOAD EXISTING FORM DATA
        // ----------------------------------------------

        const savedData =
          backendApplication?.form_data ||
          {}

        // ----------------------------------------------
        // PRESERVE EXISTING JSON DATA
        // ----------------------------------------------

        setFormData({
          ...EMPTY_FORM_DATA,

          ...savedData,

          personalDetails: {
            ...EMPTY_FORM_DATA.personalDetails,

            ...(
              savedData
                ?.personalDetails ||
              {}
            ),
          },

          additionalDetails: {
            ...EMPTY_FORM_DATA.additionalDetails,

            ...(
              savedData
                ?.additionalDetails ||
              {}
            ),
          },
        })
      } catch (error) {
        console.error(
          'Load application error:',
          error
        )

        if (
          !cancelled
        ) {
          setPageError(
            error?.message ||
              'Unable to load application.'
          )
        }
      } finally {
        if (
          !cancelled
        ) {
          setLoading(false)
        }
      }
    }

    loadApplication()

    return () => {
      cancelled = true
    }
  }, [
    user,
    accessToken,
    jeeApplication,
    ensureJeeApplication,
  ])

  // ====================================================
  // UPDATE PERSONAL FIELD
  // ====================================================

  function updatePersonalField(
    field,
    value
  ) {
    setFormData(
      (previous) => ({
        ...previous,

        personalDetails: {
          ...previous.personalDetails,

          [field]: value,
        },
      })
    )

    clearFieldError(
      `personalDetails.${field}`
    )
  }

  // ====================================================
  // UPDATE ADDITIONAL FIELD
  // ====================================================

  function updateAdditionalField(
    field,
    value
  ) {
    setFormData(
      (previous) => ({
        ...previous,

        additionalDetails: {
          ...previous.additionalDetails,

          [field]: value,
        },
      })
    )

    clearFieldError(
      `additionalDetails.${field}`
    )
  }

  // ====================================================
  // CLEAR FIELD ERROR
  // ====================================================

  function clearFieldError(
    field
  ) {
    setValidationErrors(
      (previous) =>
        previous.filter(
          (error) =>
            error?.field !== field
        )
    )
  }

  // ====================================================
  // SAVE APPLICATION
  // ====================================================

  async function saveApplication(
    showMessage = true
  ) {
    if (
      !application?.id
    ) {
      throw new Error(
        'Application ID is missing.'
      )
    }

    if (
      !accessToken
    ) {
      throw new Error(
        'Authorization token is required.'
      )
    }

    try {
      setSaving(true)

      // ----------------------------------------------
      // USE STORE API
      // This already sends authenticated PATCH
      // ----------------------------------------------

      const updatedApplication =
        await updateApplicationData(
          formData,
          2
        )

      // ----------------------------------------------
      // UPDATE LOCAL STATE
      // ----------------------------------------------

      if (
        updatedApplication
      ) {
        setApplication(
          updatedApplication
        )
      }

      // ----------------------------------------------
      // SUCCESS MESSAGE
      // ----------------------------------------------

      if (
        showMessage
      ) {
        setSuccessMessage(
          'Application saved successfully.'
        )

        setTimeout(() => {
          setSuccessMessage('')
        }, 3000)
      }

      return (
        updatedApplication ||
        application
      )
    } finally {
      setSaving(false)
    }
  }

  // ====================================================
  // VALIDATE APPLICATION
  // ====================================================

  async function validateApplication() {
    if (
      !application?.id
    ) {
      throw new Error(
        'Application ID is missing.'
      )
    }

    const result =
      await apiRequest(
        `/api/applications/${application.id}/validate`,
        {
          method: 'POST',

          headers:
            getAuthHeaders(),
        }
      )

    const errors =
      Array.isArray(
        result?.errors
      )
        ? result.errors
        : []

    setValidationErrors(
      errors
    )

    return result
  }

  // ====================================================
  // PREPARE PAYMENT
  // ====================================================

  async function preparePayment() {
    if (
      !application?.id
    ) {
      throw new Error(
        'Application ID is missing.'
      )
    }

    const result =
      await apiRequest(
        `/api/applications/${application.id}/prepare-payment`,
        {
          method: 'POST',

          headers:
            getAuthHeaders(),
        }
      )

    return result
  }

  // ====================================================
  // CONTINUE
  // ====================================================

  async function handleContinue() {
    try {
      setPageError('')
      setSuccessMessage('')
      setValidationErrors([])

      setValidating(true)

      // ----------------------------------------------
      // STEP 1
      // SAVE APPLICATION
      // ----------------------------------------------

      await saveApplication(
        false
      )

      // ----------------------------------------------
      // STEP 2
      // VALIDATE
      // ----------------------------------------------

      const validation =
        await validateApplication()

      // ----------------------------------------------
      // VALIDATION FAILED
      // ----------------------------------------------

      if (
        !validation?.valid
      ) {
        setPageError(
          'Please complete all required details and documents before continuing.'
        )

        window.scrollTo({
          top: 0,
          behavior: 'smooth',
        })

        return
      }

      // ----------------------------------------------
      // STEP 3
      // PREPARE PAYMENT
      // ----------------------------------------------

      const paymentResult =
        await preparePayment()

      // ----------------------------------------------
      // STEP 4
      // GO TO PAYMENT
      // ----------------------------------------------

      if (
        paymentResult?.success
      ) {
        navigate(
          '/forms/jee-main/payment'
        )

        return
      }

      throw new Error(
        paymentResult?.message ||
          'Unable to prepare payment.'
      )
    } catch (error) {
      console.error(
        'Continue application error:',
        error
      )

      setPageError(
        error?.message ||
          'Unable to continue application.'
      )

      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      })
    } finally {
      setValidating(false)
    }
  }

  // ====================================================
  // BACK
  // ====================================================

  function handleBack() {
    navigate(
      '/forms/jee-main/documents'
    )
  }

  // ====================================================
  // FIELD ERROR
  // ====================================================

  function getFieldError(
    field
  ) {
    const error =
      validationErrors.find(
        (item) =>
          item?.field === field
      )

    return (
      error?.message || ''
    )
  }

  // ====================================================
  // FIELD ERROR CHECK
  // ====================================================

  function hasFieldError(
    field
  ) {
    return validationErrors.some(
      (item) =>
        item?.field === field
    )
  }

  // ====================================================
  // LOADING
  // ====================================================

  if (
    loading
  ) {
    return (
      <ApplicantShell
        title="JEE Main"
        subtitle="Step 2 of 6 · Application"
      >
        <div className="max-w-content">

          <ProgressSteps
            steps={STEPS}
            current={1}
          />

          <Card className="mt-8">

            <div className="py-12 text-center">

              <p className="text-sm text-ink-faint">
                Loading your application...
              </p>

            </div>

          </Card>

        </div>
      </ApplicantShell>
    )
  }

  // ====================================================
  // MAIN UI
  // ====================================================

  return (
    <ApplicantShell
      title="JEE Main"
      subtitle="Step 2 of 6 · Application"
    >

      <div className="max-w-content">

        {/* ============================================
            PROGRESS
        ============================================ */}

        <ProgressSteps
          steps={STEPS}
          current={1}
        />

        {/* ============================================
            HEADER
        ============================================ */}

        <div className="mt-8 mb-6">

          <h2 className="font-display text-2xl font-bold text-ink">
            Application details
          </h2>

          <p className="text-ink-faint text-sm mt-1">
            Complete your application details.
            Information already available from
            your profile or documents can be
            shown here.
          </p>

        </div>

        {/* ============================================
            ERROR
        ============================================ */}

        {pageError && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3">

            <p className="text-sm text-red-700">
              {pageError}
            </p>

          </div>
        )}

        {/* ============================================
            SUCCESS
        ============================================ */}

        {successMessage && (
          <div className="mb-6 rounded-xl border border-green-200 bg-green-50 px-4 py-3">

            <p className="text-sm text-green-700">
              {successMessage}
            </p>

          </div>
        )}

        {/* ============================================
            APPLICATION INFORMATION
        ============================================ */}

        {application?.id && (
          <div className="mb-6 rounded-xl border border-line bg-surface px-4 py-3">

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

              <div>

                <p className="text-xs text-ink-faint">
                  Application ID
                </p>

                <p className="text-sm font-medium text-ink mt-1 break-all">
                  {application.id}
                </p>

              </div>

              <div className="text-left sm:text-right">

                <p className="text-xs text-ink-faint">
                  Status
                </p>

                <p className="text-sm font-medium text-ink mt-1 capitalize">
                  {application.status ||
                    'draft'}
                </p>

              </div>

            </div>

          </div>
        )}

        {/* ============================================
            FORM CARD
        ============================================ */}

        <Card>

          {/* ==========================================
              PERSONAL DETAILS
          ========================================== */}

          <SectionLabel>
            Personal details
          </SectionLabel>

          <div className="grid sm:grid-cols-2 gap-5">

            {/* FULL NAME */}

            <div>

              <Input
                label="Full Name"
                value={
                  formData
                    .personalDetails
                    .fullName
                }
                onChange={(
                  event
                ) =>
                  updatePersonalField(
                    'fullName',
                    event.target.value
                  )
                }
                placeholder="Enter full name"
                hint="Enter the name exactly as it should appear in the application."
              />

              {hasFieldError(
                'personalDetails.fullName'
              ) && (
                <p className="text-xs text-red-600 mt-1">
                  {getFieldError(
                    'personalDetails.fullName'
                  )}
                </p>
              )}

            </div>

            {/* DATE OF BIRTH */}

            <div>

              <Input
                label="Date of Birth"
                type="date"
                value={
                  formData
                    .personalDetails
                    .dateOfBirth
                }
                onChange={(
                  event
                ) =>
                  updatePersonalField(
                    'dateOfBirth',
                    event.target.value
                  )
                }
              />

              {hasFieldError(
                'personalDetails.dateOfBirth'
              ) && (
                <p className="text-xs text-red-600 mt-1">
                  {getFieldError(
                    'personalDetails.dateOfBirth'
                  )}
                </p>
              )}

            </div>

            {/* FATHER NAME */}

            <div>

              <Input
                label="Father's Name"
                value={
                  formData
                    .personalDetails
                    .fatherName
                }
                onChange={(
                  event
                ) =>
                  updatePersonalField(
                    'fatherName',
                    event.target.value
                  )
                }
                placeholder="Enter father's name"
              />

              {hasFieldError(
                'personalDetails.fatherName'
              ) && (
                <p className="text-xs text-red-600 mt-1">
                  {getFieldError(
                    'personalDetails.fatherName'
                  )}
                </p>
              )}

            </div>

            {/* GENDER */}

            <div>

              <Input
                label="Gender"
                value={
                  formData
                    .personalDetails
                    .gender
                }
                onChange={(
                  event
                ) =>
                  updatePersonalField(
                    'gender',
                    event.target.value
                  )
                }
                placeholder="Male / Female / Other"
              />

              {hasFieldError(
                'personalDetails.gender'
              ) && (
                <p className="text-xs text-red-600 mt-1">
                  {getFieldError(
                    'personalDetails.gender'
                  )}
                </p>
              )}

            </div>

          </div>

          {/* ==========================================
              DIVIDER
          ========================================== */}

          <div className="h-px bg-line my-7" />

          {/* ==========================================
              ADDITIONAL DETAILS
          ========================================== */}

          <SectionLabel>
            Additional details
          </SectionLabel>

          <div className="grid sm:grid-cols-2 gap-5">

            {/* ADDRESS */}

            <div className="sm:col-span-2">

              <Input
                label="Address"
                value={
                  formData
                    .additionalDetails
                    .address
                }
                onChange={(
                  event
                ) =>
                  updateAdditionalField(
                    'address',
                    event.target.value
                  )
                }
                placeholder="Enter your complete address"
              />

              {hasFieldError(
                'additionalDetails.address'
              ) && (
                <p className="text-xs text-red-600 mt-1">
                  {getFieldError(
                    'additionalDetails.address'
                  )}
                </p>
              )}

            </div>

            {/* MOBILE */}

            <div>

              <Input
                label="Mobile Number"
                type="tel"
                value={
                  formData
                    .additionalDetails
                    .mobile
                }
                onChange={(
                  event
                ) =>
                  updateAdditionalField(
                    'mobile',
                    event.target.value
                  )
                }
                placeholder="Enter mobile number"
              />

              {hasFieldError(
                'additionalDetails.mobile'
              ) && (
                <p className="text-xs text-red-600 mt-1">
                  {getFieldError(
                    'additionalDetails.mobile'
                  )}
                </p>
              )}

            </div>

            {/* CATEGORY */}

            <div>

              <Input
                label="Category"
                value={
                  formData
                    .additionalDetails
                    .category
                }
                onChange={(
                  event
                ) =>
                  updateAdditionalField(
                    'category',
                    event.target.value
                  )
                }
                placeholder="General / EWS / OBC-NCL / SC / ST"
              />

              {hasFieldError(
                'additionalDetails.category'
              ) && (
                <p className="text-xs text-red-600 mt-1">
                  {getFieldError(
                    'additionalDetails.category'
                  )}
                </p>
              )}

            </div>

            {/* PREFERRED CITY */}

            <div className="sm:col-span-2">

              <Input
                label="Preferred Exam City"
                value={
                  formData
                    .additionalDetails
                    .preferredCities
                }
                onChange={(
                  event
                ) =>
                  updateAdditionalField(
                    'preferredCities',
                    event.target.value
                  )
                }
                placeholder="Enter preferred exam city"
              />

              {hasFieldError(
                'additionalDetails.preferredCities'
              ) && (
                <p className="text-xs text-red-600 mt-1">
                  {getFieldError(
                    'additionalDetails.preferredCities'
                  )}
                </p>
              )}

            </div>

          </div>

        </Card>

        {/* ============================================
            VALIDATION SUMMARY
        ============================================ */}

        {validationErrors.length >
          0 && (
          <Card className="mt-6">

            <SectionLabel>
              Please complete these items
            </SectionLabel>

            <div className="space-y-3">

              {validationErrors.map(
                (
                  error,
                  index
                ) => (
                  <div
                    key={`${error?.field || 'error'}-${index}`}
                    className="flex items-start gap-3 rounded-lg bg-red-50 border border-red-100 px-4 py-3"
                  >

                    <span className="text-red-600">
                      •
                    </span>

                    <div>

                      <p className="text-sm font-medium text-red-700">
                        {error?.message ||
                          'Please complete this field.'}
                      </p>

                      {error?.field && (
                        <p className="text-xs text-red-500 mt-1">
                          {error.field}
                        </p>
                      )}

                    </div>

                  </div>
                )
              )}

            </div>

          </Card>
        )}

        {/* ============================================
            ACTIONS
        ============================================ */}

        <div className="flex flex-col sm:flex-row justify-between gap-4 mt-8">

          {/* BACK */}

          <Button
            variant="secondary"
            onClick={
              handleBack
            }
            disabled={
              saving ||
              validating
            }
          >
            Back
          </Button>

          {/* RIGHT ACTIONS */}

          <div className="flex flex-col sm:flex-row gap-3">

            {/* SAVE DRAFT */}

            <Button
              variant="secondary"
              onClick={() =>
                saveApplication(
                  true
                )
              }
              disabled={
                saving ||
                validating
              }
            >
              {saving
                ? 'Saving...'
                : 'Save Draft'}
            </Button>

            {/* CONTINUE */}

            <Button
              size="lg"
              onClick={
                handleContinue
              }
              disabled={
                saving ||
                validating
              }
            >
              {validating
                ? 'Checking...'
                : 'Review & Continue'}
            </Button>

          </div>

        </div>

      </div>

    </ApplicantShell>
  )
}