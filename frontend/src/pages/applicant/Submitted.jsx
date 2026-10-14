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
  Badge,
  ProgressSteps,
} from '../../components/ui'

import {
  apiRequest,
} from '../../lib/api/client'

import {
  useApp,
} from '../../lib/store'


const STEPS = [
  'Documents',
  'Application',
  'Payment',
  'Processing',
  'Review',
  'Submitted',
]


export default function Submitted() {
  const navigate = useNavigate()

  const {
    jeeApplication,
  } = useApp()


  // =====================================================
  // STATE
  // =====================================================

  const [
    application,
    setApplication,
  ] = useState(null)

  const [
    loading,
    setLoading,
  ] = useState(true)

  const [
    pageError,
    setPageError,
  ] = useState('')


  // =====================================================
  // LOAD APPLICATION
  // =====================================================

  useEffect(() => {
    let cancelled = false


    async function loadApplication() {
      try {
        setLoading(true)
        setPageError('')


        // -----------------------------------------------
        // 1. GET APPLICATION ID FROM STORE
        // -----------------------------------------------

        let applicationId =
          jeeApplication?.id || null


        // -----------------------------------------------
        // 2. FALLBACK TO APPLICATION LIST
        // -----------------------------------------------

        if (!applicationId) {
          const response =
            await apiRequest(
              '/api/applications'
            )


          const applications =
            response?.applications || []


          const submittedApplication =
            applications.find(
              (item) =>
                item?.forms?.form_code ===
                  'JEE-MAIN' &&
                item?.status ===
                  'submitted'
            )


          const jeeMainApplication =
            applications.find(
              (item) =>
                item?.forms?.form_code ===
                'JEE-MAIN'
            )


          applicationId =
            submittedApplication?.id ||
            jeeMainApplication?.id ||
            applications[0]?.id ||
            null
        }


        // -----------------------------------------------
        // 3. APPLICATION NOT FOUND
        // -----------------------------------------------

        if (!applicationId) {
          throw new Error(
            'Application not found.'
          )
        }


        // -----------------------------------------------
        // 4. GET COMPLETE APPLICATION
        // -----------------------------------------------

        const response =
          await apiRequest(
            `/api/applications/${applicationId}`
          )


        if (cancelled) {
          return
        }


        const loadedApplication =
          response?.application


        if (!loadedApplication) {
          throw new Error(
            'Application data could not be loaded.'
          )
        }


        setApplication(
          loadedApplication
        )


      } catch (error) {
        console.error(
          'Load submitted application error:',
          error
        )


        if (!cancelled) {
          setPageError(
            error?.message ||
            'Unable to load submitted application.'
          )
        }

      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }


    loadApplication()


    return () => {
      cancelled = true
    }

  }, [
    jeeApplication,
  ])


  // =====================================================
  // FORMAT DATE
  // =====================================================

  function formatDate(dateValue) {
    if (!dateValue) {
      return '—'
    }


    try {
      return new Date(
        dateValue
      ).toLocaleString(
        'en-IN',
        {
          dateStyle: 'medium',
          timeStyle: 'short',
        }
      )
    } catch {
      return dateValue
    }
  }


  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <ApplicantShell
        title="JEE Main"
        subtitle="Step 6 of 6 · Submitted"
      >

        <div className="max-w-content">

          <ProgressSteps
            steps={STEPS}
            current={5}
          />


          <Card className="mt-8">

            <div className="py-16 text-center">

              <p className="text-sm text-ink-faint">
                Loading submission details...
              </p>

            </div>

          </Card>

        </div>

      </ApplicantShell>
    )
  }


  // =====================================================
  // MAIN UI
  // =====================================================

  return (
    <ApplicantShell
      title="JEE Main"
      subtitle="Step 6 of 6 · Submitted"
    >

      <div className="max-w-content">

        {/* =============================================
            PROGRESS
        ============================================= */}

        <ProgressSteps
          steps={STEPS}
          current={5}
        />


        {/* =============================================
            ERROR
        ============================================= */}

        {pageError && (
          <div className="mt-8 rounded-xl border border-red-200 bg-red-50 px-4 py-3">

            <p className="text-sm text-red-700">
              {pageError}
            </p>

          </div>
        )}


        {/* =============================================
            SUCCESS CARD
        ============================================= */}

        {!pageError && (
          <Card className="mt-8 text-center py-14">

            {/* SUCCESS ICON */}

            <div className="w-16 h-16 rounded-full bg-success-bg text-success flex items-center justify-center mx-auto mb-5 text-3xl">

              ✓

            </div>


            {/* TITLE */}

            <h2 className="font-display text-2xl font-bold text-ink">

              Application submitted successfully

            </h2>


            {/* DESCRIPTION */}

            <p className="text-sm text-ink-faint mt-3 max-w-lg mx-auto">

              Your JEE Main application has been
              successfully submitted on FormFiller.

            </p>


            {/* STATUS */}

            <div className="mt-5">

              <Badge tone="green">

                Submitted

              </Badge>

            </div>


            {/* APPLICATION ID */}

            <div className="mt-8 max-w-md mx-auto rounded-xl border border-line bg-surface px-5 py-4 text-left">

              <p className="text-xs text-ink-faint">
                Application ID
              </p>

              <p className="text-sm font-semibold text-ink mt-1 break-all">

                {application?.id || '—'}

              </p>

            </div>


            {/* APPLICATION NUMBER */}

            {application?.application_number && (
              <div className="mt-3 max-w-md mx-auto rounded-xl border border-line bg-surface px-5 py-4 text-left">

                <p className="text-xs text-ink-faint">
                  Application Number
                </p>

                <p className="text-sm font-semibold text-ink mt-1">

                  {application.application_number}

                </p>

              </div>
            )}


            {/* SUBMITTED DATE */}

            <div className="mt-3 max-w-md mx-auto rounded-xl border border-line bg-surface px-5 py-4 text-left">

              <p className="text-xs text-ink-faint">
                Submitted On
              </p>

              <p className="text-sm font-medium text-ink mt-1">

                {formatDate(
                  application?.updated_at
                )}

              </p>

            </div>


            {/* PAYMENT */}

            <div className="mt-3 max-w-md mx-auto rounded-xl border border-line bg-surface px-5 py-4 text-left">

              <div className="flex items-center justify-between">

                <div>

                  <p className="text-xs text-ink-faint">
                    Payment
                  </p>

                  <p className="text-sm font-medium text-ink mt-1">
                    ₹1,099
                  </p>

                </div>


                <Badge tone="green">
                  Paid
                </Badge>

              </div>

            </div>


            {/* NEXT MESSAGE */}

            <div className="mt-8 rounded-xl border border-blue-200 bg-blue-50 px-5 py-4 max-w-xl mx-auto text-left">

              <p className="text-sm font-medium text-blue-800">

                What's next?

              </p>

              <p className="text-sm text-blue-700 mt-1">

                Your application has been submitted.
                You can track its status from your
                FormFiller dashboard.

              </p>

            </div>


            {/* ACTIONS */}

            <div className="flex flex-col sm:flex-row justify-center gap-3 mt-8">

              <Button
                variant="secondary"
                onClick={() =>
                  navigate('/dashboard')
                }
              >
                Go to Dashboard
              </Button>


              <Button
                onClick={() =>
                  navigate(
                    '/forms/jee-main/review'
                  )
                }
              >
                View Application
              </Button>

            </div>

          </Card>
        )}

      </div>

    </ApplicantShell>
  )
}