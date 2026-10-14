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
  Modal,
  ProgressSteps,
} from '../../components/ui'

import {
  Chat,
} from '../../components/Chat'

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


export default function FinalReview() {

  const navigate = useNavigate()

  const {
    jeeApplication,
  } = useApp()


  // =====================================================
  // APPLICATION
  // =====================================================

  const [
    application,
    setApplication,
  ] = useState(null)


  // =====================================================
  // DOCUMENTS
  // =====================================================

  const [
    applicationDocuments,
    setApplicationDocuments,
  ] = useState([])


  // =====================================================
  // FINAL PDF
  // =====================================================

  const [
    finalFile,
    setFinalFile,
  ] = useState(null)

  const [
    finalPdfLoading,
    setFinalPdfLoading,
  ] = useState(true)

  const [
    finalPdfAvailable,
    setFinalPdfAvailable,
  ] = useState(false)

  const [
    finalPdfError,
    setFinalPdfError,
  ] = useState('')


  // =====================================================
  // NEW PDF VERSION
  // =====================================================

  const [
    newVersionAvailable,
    setNewVersionAvailable,
  ] = useState(false)


  // =====================================================
  // LOADING
  // =====================================================

  const [
    loading,
    setLoading,
  ] = useState(true)


  // =====================================================
  // APPROVAL
  // =====================================================

  const [
    approving,
    setApproving,
  ] = useState(false)

  const [
    approved,
    setApproved,
  ] = useState(false)


  // =====================================================
  // SUBMITTED STEP
  // =====================================================

  const [
    showSubmittedStep,
    setShowSubmittedStep,
  ] = useState(false)


  // =====================================================
  // ERROR CHAT
  // =====================================================

  const [
    errorChatOpen,
    setErrorChatOpen,
  ] = useState(false)


  // =====================================================
  // PAGE ERROR
  // =====================================================

  const [
    pageError,
    setPageError,
  ] = useState('')


  // =====================================================
  // CONFIRM MODAL
  // =====================================================

  const [
    confirmOpen,
    setConfirmOpen,
  ] = useState(false)


  // =====================================================
  // LOAD APPLICATION
  // =====================================================

  useEffect(() => {

    let cancelled = false


    async function loadReviewData() {

      try {

        setLoading(true)
        setPageError('')


        // -----------------------------------------------
        // GET APPLICATION ID
        // -----------------------------------------------

        let applicationId =
          jeeApplication?.id || null


        // -----------------------------------------------
        // FALLBACK: GET APPLICATIONS
        // -----------------------------------------------

        if (!applicationId) {

          const response =
            await apiRequest(
              '/api/applications'
            )


          const applications =
            response?.applications || []


          const jeeApplicationFromList =
            applications.find(
              (item) =>
                item?.forms?.form_code ===
                'JEE-MAIN'
            )


          applicationId =
            jeeApplicationFromList?.id ||
            applications[0]?.id ||
            null
        }


        // -----------------------------------------------
        // APPLICATION NOT FOUND
        // -----------------------------------------------

        if (!applicationId) {

          throw new Error(
            'Application not found. Please start the application again.'
          )
        }


        // -----------------------------------------------
        // GET COMPLETE APPLICATION
        // -----------------------------------------------

        const applicationResponse =
          await apiRequest(
            `/api/applications/${applicationId}`
          )


        if (cancelled) {
          return
        }


        const loadedApplication =
          applicationResponse?.application


        if (!loadedApplication) {

          throw new Error(
            'Application data could not be loaded.'
          )
        }


        setApplication(
          loadedApplication
        )


        // -----------------------------------------------
        // CHECK APPLICATION STATUS
        // -----------------------------------------------

        if (
          loadedApplication.status ===
          'approved'
        ) {

          setApproved(true)

        }


        if (
          loadedApplication.status ===
          'submitted'
        ) {

          setApproved(true)

          /*
           * If application is already submitted
           * and user opens this page again,
           * directly show submitted step.
           */
          setShowSubmittedStep(true)

        }


        // -----------------------------------------------
        // GET APPLICATION DOCUMENTS
        // -----------------------------------------------

        try {

          const documentsResponse =
            await apiRequest(
              `/api/applications/${applicationId}/documents`
            )


          if (!cancelled) {

            setApplicationDocuments(
              documentsResponse?.documents ||
              []
            )

          }

        } catch (documentError) {

          console.error(
            'Load application documents error:',
            documentError
          )


          if (!cancelled) {

            setApplicationDocuments([])

          }

        }


        // -----------------------------------------------
        // GET CURRENT FINAL PDF
        // -----------------------------------------------

        try {

          setFinalPdfLoading(true)
          setFinalPdfError('')


          const finalFileResponse =
            await apiRequest(
              `/api/applications/${applicationId}/final-files/current`
            )


          if (!cancelled) {

            const loadedFinalFile =
              finalFileResponse?.finalFile ||
              null


            setFinalFile(
              loadedFinalFile
            )


            setFinalPdfAvailable(
              Boolean(
                loadedFinalFile
              )
            )

          }

        } catch (finalFileError) {

          console.error(
            'Load final PDF error:',
            finalFileError
          )


          if (!cancelled) {

            setFinalFile(null)

            setFinalPdfAvailable(false)


            if (
              finalFileError?.message &&
              !finalFileError.message
                .toLowerCase()
                .includes(
                  'not available'
                )
            ) {

              setFinalPdfError(
                finalFileError.message
              )

            }

          }

        } finally {

          if (!cancelled) {

            setFinalPdfLoading(false)

          }

        }

      } catch (error) {

        console.error(
          'Load review data error:',
          error
        )


        if (!cancelled) {

          setPageError(
            error?.message ||
            'Unable to load final review.'
          )

        }

      } finally {

        if (!cancelled) {

          setLoading(false)

        }

      }

    }


    loadReviewData()


    return () => {

      cancelled = true

    }

  }, [
    jeeApplication,
  ])


  // =====================================================
  // AUTO REFRESH APPLICATION STATUS
  // =====================================================
  //
  // Operator approves/submits from another screen.
  // Applicant automatically receives latest status.
  //
  // =====================================================

  useEffect(() => {

    if (!application?.id) {
      return
    }


    let cancelled = false


    async function refreshApplicationStatus() {

      try {

        const response =
          await apiRequest(
            `/api/applications/${application.id}`
          )


        if (cancelled) {
          return
        }


        const latestApplication =
          response?.application


        if (!latestApplication) {
          return
        }


        setApplication(
          latestApplication
        )


        // ---------------------------------------------
        // APPROVED
        // ---------------------------------------------

        if (
          latestApplication.status ===
          'approved'
        ) {

          setApproved(true)

        }


        // ---------------------------------------------
        // SUBMITTED
        // ---------------------------------------------

        if (
          latestApplication.status ===
          'submitted'
        ) {

          setApproved(true)

          /*
           * Don't automatically jump to Submitted
           * immediately after operator submits.
           *
           * Applicant first gets the NEXT button.
           */

        }

      } catch (error) {

        /*
         * Background refresh errors should not
         * disturb the applicant.
         */

        console.error(
          'Application status refresh error:',
          error
        )

      }

    }


    refreshApplicationStatus()


    const intervalId =
      setInterval(
        refreshApplicationStatus,
        5000
      )


    function handleVisibilityChange() {

      if (
        document.visibilityState ===
        'visible'
      ) {

        refreshApplicationStatus()

      }

    }


    document.addEventListener(
      'visibilitychange',
      handleVisibilityChange
    )


    return () => {

      cancelled = true

      clearInterval(
        intervalId
      )

      document.removeEventListener(
        'visibilitychange',
        handleVisibilityChange
      )

    }

  }, [
    application?.id,
  ])


  // =====================================================
  // AUTO REFRESH FINAL PDF
  // =====================================================

  useEffect(() => {

    if (!application?.id) {
      return
    }


    let cancelled = false


    async function refreshFinalPdf() {

      try {

        const response =
          await apiRequest(
            `/api/applications/${application.id}/final-files/current`
          )


        if (cancelled) {
          return
        }


        const latestFinalFile =
          response?.finalFile ||
          null


        if (!latestFinalFile) {
          return
        }


        // ---------------------------------------------
        // FIRST PDF
        // ---------------------------------------------

        if (!finalFile) {

          setFinalFile(
            latestFinalFile
          )


          setFinalPdfAvailable(
            true
          )


          setFinalPdfError('')

          return

        }


        // ---------------------------------------------
        // COMPARE VERSIONS
        // ---------------------------------------------

        const previousVersion =
          Number(
            finalFile.version ||
            0
          )


        const latestVersion =
          Number(
            latestFinalFile.version ||
            0
          )


        // ---------------------------------------------
        // NEW VERSION
        // ---------------------------------------------

        if (
          latestVersion >
          previousVersion
        ) {

          setFinalFile(
            latestFinalFile
          )


          setFinalPdfAvailable(
            true
          )


          setFinalPdfError('')


          setNewVersionAvailable(
            true
          )


          setTimeout(() => {

            if (!cancelled) {

              setNewVersionAvailable(
                false
              )

            }

          }, 5000)


          return

        }


        setFinalPdfAvailable(
          true
        )

      } catch (error) {

        if (
          error?.message
            ?.toLowerCase()
            .includes(
              'not available'
            )
        ) {

          return

        }


        console.error(
          'Background final PDF refresh error:',
          error
        )

      }

    }


    refreshFinalPdf()


    const intervalId =
      setInterval(
        refreshFinalPdf,
        5000
      )


    function handleVisibilityChange() {

      if (
        document.visibilityState ===
        'visible'
      ) {

        refreshFinalPdf()

      }

    }


    document.addEventListener(
      'visibilitychange',
      handleVisibilityChange
    )


    return () => {

      cancelled = true

      clearInterval(
        intervalId
      )

      document.removeEventListener(
        'visibilitychange',
        handleVisibilityChange
      )

    }

  }, [
    application?.id,
    finalFile,
  ])


  // =====================================================
  // FORM DATA
  // =====================================================

  const formData =
    application?.form_data ||
    {}


  const personalDetails =
    formData?.personalDetails ||
    {}


  const additionalDetails =
    formData?.additionalDetails ||
    {}


  // =====================================================
  // OPEN CURRENT PDF
  // =====================================================

  async function openFinalPdf() {

    if (!application?.id) {

      setPageError(
        'Application ID is missing.'
      )

      return
    }


    try {

      setFinalPdfError('')


      const response =
        await apiRequest(
          `/api/applications/${application.id}/final-files/current`
        )


      const loadedFinalFile =
        response?.finalFile ||
        null


      const signedUrl =
        response?.pdf?.signedUrl ||
        null


      if (!loadedFinalFile) {

        throw new Error(
          'Final application PDF is not available yet.'
        )

      }


      if (!signedUrl) {

        throw new Error(
          'PDF access URL could not be generated.'
        )

      }


      setFinalFile(
        loadedFinalFile
      )


      setFinalPdfAvailable(
        true
      )


      window.open(
        signedUrl,
        '_blank',
        'noopener,noreferrer'
      )

    } catch (error) {

      console.error(
        'Open final PDF error:',
        error
      )


      setFinalPdfError(
        error?.message ||
        'Unable to open final application PDF.'
      )

    }

  }


  // =====================================================
  // APPLICANT APPROVAL
  // =====================================================

  async function approveApplication() {

    if (!application?.id) {

      setPageError(
        'Application ID is missing.'
      )

      return
    }


    if (!finalPdfAvailable) {

      setPageError(
        'Please review the final application PDF before approving.'
      )

      return
    }


    try {

      setApproving(true)
      setPageError('')


      const response =
        await apiRequest(
          `/api/applications/${application.id}/approve`,
          {
            method: 'POST',
          }
        )


      if (!response?.success) {

        throw new Error(
          response?.message ||
          'Unable to approve application.'
        )

      }


      // -----------------------------------------------
      // UPDATE APPLICATION
      // -----------------------------------------------

      if (
        response?.application
      ) {

        setApplication(
          response.application
        )

      } else {

        setApplication(
          (previous) => ({
            ...previous,
            status: 'approved',
            current_step: 5,
          })
        )

      }


      setApproved(true)

      setConfirmOpen(false)

    } catch (error) {

      console.error(
        'Approve application error:',
        error
      )


      setPageError(
        error?.message ||
        'Unable to approve application.'
      )

    } finally {

      setApproving(false)

    }

  }


  // =====================================================
  // NEXT → SUBMITTED
  // =====================================================

  function goToSubmittedStep() {

    /*
     * IMPORTANT:
     *
     * Applicant should only go to Submitted
     * after operator has actually submitted
     * the application.
     */

    if (
      application?.status !==
      'submitted'
    ) {

      return

    }


    setShowSubmittedStep(true)


    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })

  }


  // =====================================================
  // EXIT APPLICATION
  // =====================================================

  function exitApplication() {

    navigate(
      '/dashboard'
    )

  }


  // =====================================================
  // OPEN ERROR CHAT
  // =====================================================

  function handleFormError() {

    setErrorChatOpen(true)


    setTimeout(() => {

      const element =
        document.getElementById(
          'application-error-chat'
        )


      element?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      })

    }, 100)

  }


  // =====================================================
  // LOADING UI
  // =====================================================

  if (loading) {

    return (

      <ApplicantShell
        title="JEE Main"
        subtitle="Step 5 of 6 · Final review"
      >

        <div className="max-w-content">

          <ProgressSteps
            steps={STEPS}
            current={4}
          />


          <Card className="mt-8">

            <div className="py-16 text-center">

              <p className="text-sm text-ink-faint">
                Loading your final review...
              </p>

            </div>

          </Card>

        </div>

      </ApplicantShell>

    )

  }


  // =====================================================
  // SUBMITTED STEP
  // =====================================================

  if (
    showSubmittedStep &&
    application?.status ===
    'submitted'
  ) {

    return (

      <ApplicantShell
        title="JEE Main"
        subtitle="Step 6 of 6 · Submitted"
      >

        <div className="max-w-content">

          {/* PROGRESS */}

          <ProgressSteps
            steps={STEPS}
            current={5}
          />


          {/* HEADER */}

          <div className="mt-8 mb-6">

            <h2 className="font-display text-2xl font-bold text-ink">
              Application Submitted
            </h2>

            <p className="text-sm text-ink-faint mt-1">
              Your JEE Main application has been
              successfully submitted.
            </p>

          </div>


          {/* SUCCESS CARD */}

          <Card>

            <div className="text-center py-6">

              <div className="mx-auto w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">

                <span className="text-2xl text-green-700 font-bold">
                  ✓
                </span>

              </div>


              <h3 className="font-display text-xl font-bold text-ink mt-5">
                Submission Complete
              </h3>


              <p className="text-sm text-ink-faint mt-2">
                Your operator has completed the
                final submission on the government
                portal.
              </p>

            </div>


            {/* GOVERNMENT CREDENTIALS */}

            <div className="mt-5 space-y-4">

              {/* APPLICATION NUMBER */}

              <div className="border border-line rounded-xl p-4">

                <p className="text-xs text-ink-faint uppercase tracking-wide">
                  Government Application Number
                </p>

                <p className="text-base font-semibold text-ink mt-2 break-all">
                  {application?.government_application_number ||
                    'Not available'}
                </p>

              </div>


              {/* PASSWORD */}

              <div className="border border-line rounded-xl p-4">

                <p className="text-xs text-ink-faint uppercase tracking-wide">
                  Government Portal Password
                </p>

                <p className="text-base font-semibold text-ink mt-2 break-all">
                  {application?.government_application_password ||
                    'Not available'}
                </p>

              </div>

            </div>


            {/* INFORMATION */}

            <div className="mt-5 rounded-xl border border-blue-200 bg-blue-50 px-4 py-4">

              <p className="text-sm font-medium text-blue-800">
                Keep these details safe
              </p>

              <p className="text-sm text-blue-700 mt-1">
                You can use the application number
                and password to access your government
                application later.
              </p>

            </div>


            {/* EXIT */}

            <div className="flex justify-end mt-6 pt-5 border-t border-line">

              <Button
                size="lg"
                onClick={
                  exitApplication
                }
              >
                Exit Application
              </Button>

            </div>

          </Card>

        </div>

      </ApplicantShell>

    )

  }


  // =====================================================
  // MAIN FINAL REVIEW UI
  // =====================================================

  return (

    <ApplicantShell
      title="JEE Main"
      subtitle="Step 5 of 6 · Final review"
    >

      <div className="max-w-content">

        {/* =============================================
            PROGRESS
        ============================================= */}

        <ProgressSteps
          steps={STEPS}
          current={4}
        />


        {/* =============================================
            HEADER
        ============================================= */}

        <div className="mt-8 mb-6">

          <h2 className="font-display text-2xl font-bold text-ink">
            Final review
          </h2>

          <p className="text-sm text-ink-faint mt-1">
            Review the completed application carefully
            before approving it for final submission.
          </p>

        </div>


        {/* =============================================
            PAGE ERROR
        ============================================= */}

        {pageError && (

          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3">

            <p className="text-sm text-red-700">
              {pageError}
            </p>

          </div>

        )}


        {/* =============================================
            APPLICATION STATUS
        ============================================= */}

        <Card className="mb-4">

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

            <div>

              <p className="text-xs text-ink-faint">
                Application ID
              </p>

              <p className="text-sm font-medium text-ink mt-1 break-all">
                {application?.id || '—'}
              </p>

            </div>


            <div>

              <p className="text-xs text-ink-faint">
                Status
              </p>

              <div className="mt-1">

                <Badge
                  tone={
                    application?.status ===
                    'submitted'
                      ? 'green'
                      : approved
                        ? 'green'
                        : 'blue'
                  }
                >

                  {application?.status ===
                  'submitted'
                    ? 'Submitted'
                    : approved
                      ? 'Approved'
                      : 'Ready for Review'}

                </Badge>

              </div>

            </div>

          </div>

        </Card>


        {/* =============================================
            FINAL APPLICATION PDF
        ============================================= */}

        <Card className="mb-4">

          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">

            <div>

              <p className="text-xs font-medium text-brand-600">
                Completed application
              </p>

              <h3 className="font-display text-xl font-bold text-ink mt-1">
                Final Application PDF
              </h3>

              <p className="text-sm text-ink-faint mt-1">
                Review the PDF generated from the
                completed official application.
              </p>

            </div>


            {finalFile && (

              <Badge tone="green">
                Version {finalFile.version}
              </Badge>

            )}

          </div>


          {/* NEW VERSION */}

          {newVersionAvailable && (

            <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3">

              <p className="text-sm font-medium text-blue-800">
                New application version available
              </p>

              <p className="text-xs text-blue-700 mt-1">
                The operator has updated your application.
                Please review Version {finalFile?.version}.
              </p>

            </div>

          )}


          <div className="mt-5">

            {finalPdfLoading ? (

              <div className="rounded-xl border border-line bg-surface px-5 py-6 text-center">

                <p className="text-sm text-ink-faint">
                  Checking for your completed
                  application PDF...
                </p>

              </div>

            ) : finalPdfAvailable ? (

              <div className="rounded-xl border border-green-200 bg-green-50 px-5 py-5">

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

                  <div>

                    <p className="text-sm font-medium text-green-800">
                      Your completed application
                      is ready for review.
                    </p>

                    <p className="text-xs text-green-700 mt-1">
                      {finalFile?.file_name ||
                        'Final application PDF'}
                    </p>

                  </div>


                  <Button
                    onClick={
                      openFinalPdf
                    }
                  >
                    View Application PDF
                  </Button>

                </div>


                {finalPdfError && (

                  <p className="text-xs text-red-600 mt-3">
                    {finalPdfError}
                  </p>

                )}

              </div>

            ) : (

              <div className="rounded-xl border border-yellow-200 bg-yellow-50 px-5 py-5">

                <p className="text-sm font-medium text-yellow-800">
                  Your final application PDF is
                  not available yet.
                </p>

                <p className="text-xs text-yellow-700 mt-1">
                  Your assigned operator is still
                  completing the official application.
                  Please check again once processing
                  is complete.
                </p>

              </div>

            )}

          </div>

        </Card>


        {/* =============================================
            PERSONAL DETAILS
        ============================================= */}

        <ReviewSection
          title="Personal Details"
        >

          <FieldRow
            label="Full Name"
            value={
              personalDetails?.fullName ||
              'Not provided'
            }
          />

          <FieldRow
            label="Date of Birth"
            value={
              personalDetails?.dateOfBirth ||
              'Not provided'
            }
          />

          <FieldRow
            label="Father's Name"
            value={
              personalDetails?.fatherName ||
              'Not provided'
            }
          />

          <FieldRow
            label="Gender"
            value={
              personalDetails?.gender ||
              'Not provided'
            }
          />

        </ReviewSection>


        {/* =============================================
            ADDITIONAL DETAILS
        ============================================= */}

        <ReviewSection
          title="Additional Details"
          className="mt-4"
        >

          <FieldRow
            label="Address"
            value={
              additionalDetails?.address ||
              'Not provided'
            }
          />

          <FieldRow
            label="Mobile Number"
            value={
              additionalDetails?.mobile ||
              'Not provided'
            }
          />

          <FieldRow
            label="Category"
            value={
              additionalDetails?.category ||
              'Not provided'
            }
          />

          <FieldRow
            label="Preferred Exam City"
            value={
              additionalDetails?.preferredCities ||
              'Not provided'
            }
          />

        </ReviewSection>


        {/* =============================================
            DOCUMENTS
        ============================================= */}

        <ReviewSection
          title="Uploaded Documents"
          className="mt-4"
        >

          {applicationDocuments.length === 0 ? (

            <div className="rounded-lg border border-line bg-surface px-4 py-4">

              <p className="text-sm text-ink-faint">
                No documents are attached to this
                application.
              </p>

            </div>

          ) : (

            <div className="space-y-3">

              {applicationDocuments.map(
                (item) => {

                  const document =
                    item?.documents ||
                    item


                  return (

                    <div
                      key={
                        item?.id ||
                        document?.id
                      }
                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border border-line rounded-lg px-4 py-3"
                    >

                      <div>

                        <p className="text-sm font-medium text-ink">

                          {document?.document_name ||
                           document?.document_type ||
                           item?.document_type ||
                           'Document'}

                        </p>


                        <p className="text-xs text-ink-faint mt-1">

                          {document?.source ===
                          'vault'
                            ? 'From Vault'
                            : 'Uploaded'}

                        </p>

                      </div>


                      <Badge tone="green">
                        Attached
                      </Badge>

                    </div>

                  )

                }
              )}

            </div>

          )}

        </ReviewSection>


        {/* =============================================
            PAYMENT
        ============================================= */}

        <ReviewSection
          title="Payment"
          className="mt-4"
        >

          <FieldRow
            label="Application Fee"
            value="₹1,000"
          />

          <FieldRow
            label="FormFiller Service Fee"
            value="₹99"
          />

          <FieldRow
            label="Total"
            value="₹1,099"
          />


          <div className="pt-2">

            <Badge tone="green">
              Paid · Demo Payment
            </Badge>

          </div>

        </ReviewSection>


        {/* =============================================
            REVIEW INSTRUCTIONS
        ============================================= */}

        <div className="mt-6 rounded-xl border border-blue-200 bg-blue-50 px-4 py-4">

          <p className="text-sm font-medium text-blue-800">
            Please review the completed application
          </p>

          <p className="text-sm text-blue-700 mt-1">
            First open the Final Application PDF and
            carefully check the information entered in
            the official application.
          </p>

        </div>


        {/* =============================================
            APPROVAL ACTIONS
        ============================================= */}

        {!approved &&
        application?.status !== 'submitted' && (

          <div className="mt-6 rounded-xl border border-line bg-white p-5">

            <div>

              <h3 className="font-medium text-ink">
                Is everything correct?
              </h3>

              <p className="text-sm text-ink-faint mt-1">
                If you find any mistake in the completed
                application, report it to your operator
                before approving.
              </p>

            </div>


            <div className="flex flex-col sm:flex-row gap-3 mt-5">

              <Button
                variant="secondary"
                onClick={
                  handleFormError
                }
              >
                Form has an Error
              </Button>


              <Button
                size="lg"
                onClick={() =>
                  setConfirmOpen(true)
                }
                disabled={
                  !finalPdfAvailable ||
                  approving
                }
              >
                Everything is Correct
              </Button>

            </div>


            {!finalPdfAvailable && (

              <p className="text-xs text-ink-faint mt-3">
                You can approve the application after
                the final PDF is generated and available.
              </p>

            )}

          </div>

        )}


        {/* =============================================
            APPROVED / WAITING FOR OPERATOR
        ============================================= */}

        {approved &&
        application?.status !== 'submitted' && (

          <div className="mt-6 rounded-xl border border-green-200 bg-green-50 px-5 py-5">

            <div className="flex items-start gap-3">

              <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center shrink-0">

                <span className="text-green-700 font-bold">
                  ✓
                </span>

              </div>


              <div>

                <p className="text-sm font-semibold text-green-800">
                  Application approved
                </p>

                <p className="text-sm text-green-700 mt-1">
                  You have approved the completed
                  application. Your assigned operator
                  will now proceed with the final
                  submission process.
                </p>

              </div>

            </div>

          </div>

        )}


        {/* =============================================
            NEXT BUTTON
        ============================================= */}

        {application?.status ===
        'submitted' && (

          <div className="mt-6 rounded-xl border border-green-200 bg-green-50 p-5">

            <div>

              <p className="text-sm font-semibold text-green-800">
                Application submitted successfully
              </p>

              <p className="text-sm text-green-700 mt-1">
                Your operator has completed the
                government portal submission.
                Click Next to view your submission
                credentials.
              </p>

            </div>


            <div className="flex justify-end mt-5">

              <Button
                size="lg"
                onClick={
                  goToSubmittedStep
                }
              >
                Next
              </Button>

            </div>

          </div>

        )}


        {/* =============================================
            ERROR CHAT
        ============================================= */}

        {errorChatOpen && (

          <div
            id="application-error-chat"
            className="mt-6"
          >

            <Card
              padded={false}
              className="overflow-hidden"
            >

              <div className="px-5 py-4 border-b border-line">

                <div className="flex items-center justify-between gap-4">

                  <div>

                    <p className="text-xs font-medium text-brand-600">
                      Application correction
                    </p>

                    <h3 className="font-display text-lg font-bold text-ink mt-1">
                      Report an error
                    </h3>

                    <p className="text-xs text-ink-faint mt-1">
                      Tell your assigned operator what
                      needs to be corrected.
                    </p>

                  </div>


                  <button
                    type="button"
                    onClick={() =>
                      setErrorChatOpen(false)
                    }
                    className="text-xs text-ink-faint hover:text-ink"
                  >
                    Close
                  </button>

                </div>

              </div>


              {application?.id ? (

                <Chat
                  applicationId={
                    application.id
                  }
                  selfRole="applicant"
                  otherName="FormFiller Operator"
                  quickReplies={[
                    'I found an error in my application.',
                    'Please check my application details.',
                    'The information in the PDF is incorrect.',
                    'Please correct this before submission.',
                  ]}
                />

              ) : (

                <div className="p-6 text-center">

                  <p className="text-sm text-ink-faint">
                    Connecting to application chat...
                  </p>

                </div>

              )}

            </Card>

          </div>

        )}


        {/* =============================================
            BACK BUTTON
        ============================================= */}

        <div className="flex justify-start mt-8 pb-8">

          <Button
            variant="secondary"
            onClick={() =>
              navigate(
                '/forms/jee-main/application'
              )
            }
            disabled={approving}
          >
            Back to Application
          </Button>

        </div>


        {/* =============================================
            APPROVAL CONFIRMATION MODAL
        ============================================= */}

        <Modal
          open={confirmOpen}
          onClose={() =>
            !approving &&
            setConfirmOpen(false)
          }
          title="Approve final application"
          footer={
            <>
              <Button
                variant="secondary"
                onClick={() =>
                  setConfirmOpen(false)
                }
                disabled={approving}
              >
                Cancel
              </Button>


              <Button
                onClick={
                  approveApplication
                }
                disabled={approving}
              >
                {approving
                  ? 'Approving...'
                  : 'Confirm Approval'}
              </Button>
            </>
          }
        >

          <div className="space-y-3">

            <p>
              Please confirm that you have checked
              the completed application PDF and all
              important information.
            </p>

            <p>
              By approving, you are confirming that the
              application is ready for the operator to
              proceed with final submission.
            </p>

            <p className="text-sm text-ink-faint">
              The operator will handle the actual
              government portal submission after your
              approval.
            </p>

          </div>

        </Modal>

      </div>

    </ApplicantShell>

  )

}


// =====================================================
// REVIEW SECTION
// =====================================================

function ReviewSection({
  title,
  children,
  className = '',
}) {

  return (

    <Card className={className}>

      <h3 className="font-medium text-ink mb-4">
        {title}
      </h3>

      <div className="space-y-3">
        {children}
      </div>

    </Card>

  )

}


// =====================================================
// FIELD ROW
// =====================================================

function FieldRow({
  label,
  value,
}) {

  return (

    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1 sm:gap-6 text-sm border-b border-line/70 last:border-0 pb-3 last:pb-0">

      <span className="text-ink-faint">
        {label}
      </span>

      <span className="text-ink font-medium sm:text-right break-words">
        {value}
      </span>

    </div>

  )

}