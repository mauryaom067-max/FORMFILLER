import {
  useEffect,
  useRef,
  useState,
} from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { OperatorShell } from '../../components/layout/OperatorShell'
import {
  Card,
  Button,
  Badge,
} from '../../components/ui'
import { Chat } from '../../components/Chat'

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  'http://localhost:5000'

export default function OperatorWorkspace() {
  const { id } = useParams()

  const [application, setApplication] = useState(null)
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [operator, setOperator] = useState(null)

  useEffect(() => {
    try {
      const storedProfile =
        localStorage.getItem('formfiller_profile')

      if (storedProfile) {
        setOperator(JSON.parse(storedProfile))
      }
    } catch (error) {
      console.error(
        'Failed to read operator profile:',
        error
      )
    }
  }, [])

  useEffect(() => {
    if (!id) {
      setError('Application ID is missing.')
      setLoading(false)
      return
    }

    loadApplication()

    /*
      Auto refresh every 3 seconds.

      Isse operator ko applicant ke approval ke baad
      browser refresh karne ki zarurat nahi padegi.
    */
    const refreshTimer = setInterval(() => {
      loadApplication({ silent: true })
    }, 3000)

    return () => {
      clearInterval(refreshTimer)
    }
  }, [id])

  async function loadApplication({ silent = false } = {}) {
    try {
      if (!silent) {
        setLoading(true)
      }

      setError('')

      const token =
        localStorage.getItem(
          'formfiller_access_token'
        )

      if (!token) {
        throw new Error(
          'Operator session not found. Please login again.'
        )
      }

      const applicationResponse =
        await fetch(
          `${API_BASE_URL}/api/applications/${id}`,
          {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${token}`,
            },
            credentials: 'include',
          }
        )

      const applicationData =
        await applicationResponse.json()

      if (!applicationResponse.ok) {
        throw new Error(
          applicationData?.message ||
            'Unable to load application'
        )
      }

      const loadedApplication =
        applicationData.application ||
        applicationData.data ||
        applicationData

      setApplication(loadedApplication)

      try {
        const documentsResponse =
          await fetch(
            `${API_BASE_URL}/api/applications/${id}/documents`,
            {
              method: 'GET',
              headers: {
                Authorization: `Bearer ${token}`,
              },
              credentials: 'include',
            }
          )

        const documentsData =
          await documentsResponse.json()

        if (documentsResponse.ok) {
          setDocuments(
            documentsData.documents ||
              documentsData.data ||
              []
          )
        }
      } catch (documentError) {
        console.error(
          'Failed to load application documents:',
          documentError
        )

        setDocuments([])
      }
    } catch (error) {
      console.error(
        'Operator workspace error:',
        error
      )

      if (!silent) {
        setError(
          error.message ||
            'Unable to load application'
        )
      }
    } finally {
      if (!silent) {
        setLoading(false)
      }
    }
  }

  if (loading) {
    return (
      <OperatorShell title="Application">
        <div className="flex items-center justify-center py-24">
          <div className="text-center">
            <div className="w-10 h-10 border-4 border-brand-200 border-t-brand-500 rounded-full animate-spin mx-auto" />

            <p className="text-sm text-ink-faint mt-4">
              Loading application...
            </p>
          </div>
        </div>
      </OperatorShell>
    )
  }

  if (error || !application) {
    return (
      <OperatorShell title="Application">
        <div className="max-w-content">
          <Card>
            <div className="py-12 text-center">
              <div className="w-14 h-14 rounded-full bg-danger-bg text-danger flex items-center justify-center mx-auto text-xl">
                !
              </div>

              <h3 className="font-display text-xl font-bold text-ink mt-5">
                Unable to load application
              </h3>

              <p className="text-sm text-ink-faint mt-2">
                {error ||
                  'Application not found.'}
              </p>

              <Button
                className="mt-6"
                onClick={loadApplication}
              >
                Try Again
              </Button>
            </div>
          </Card>
        </div>
      </OperatorShell>
    )
  }

  const formData =
    application.form_data || {}

  const personalDetails =
    formData.personalDetails || {}

  const additionalDetails =
    formData.additionalDetails || {}

  const applicantName =
    personalDetails.fullName ||
    personalDetails.full_name ||
    personalDetails.name ||
    'Applicant'

  const applicationNumber =
    application.application_number ||
    application.id

  return (
    <OperatorShell
      title={`Application ${applicationNumber}`}
      subtitle={`JEE Main · ${applicantName}`}
    >
      <div className="grid grid-cols-[300px_1fr_360px] gap-5 h-[calc(100vh-8rem)] -m-2">

        {/* ==================================================
            LEFT — APPLICANT DATA
        ================================================== */}

        <div className="overflow-y-auto p-2">
          <ApplicantDataPanel
            personalDetails={personalDetails}
            additionalDetails={additionalDetails}
            documents={documents}
          />
        </div>

        {/* ==================================================
            CENTER — OPERATOR WORKSPACE
        ================================================== */}

        <div className="overflow-y-auto p-2 space-y-4">
          <FormWorkspace
            application={application}
          />

          <ApplicationStatus
            application={application}
          />

          <FinalApplicationFile
            applicationId={id}
          />
        </div>

        {/* ==================================================
            RIGHT — REAL-TIME CHAT
        ================================================== */}

        <Card
          padded={false}
          className="h-full min-h-0 overflow-hidden flex flex-col"
        >
          <div className="flex-1 min-h-0">
            <Chat
              applicationId={id}
              selfRole="operator"
              otherName={`${applicantName} · Applicant`}
              quickReplies={[
                'Please share your OTP',
                'Live photograph required',
                'Could you confirm your address?',
                'Please report the error you found.',
              ]}
            />
          </div>
        </Card>
      </div>
    </OperatorShell>
  )
}


/* ======================================================
   APPLICANT DATA PANEL
====================================================== */

function ApplicantDataPanel({
  personalDetails,
  additionalDetails,
  documents,
}) {
  const [copied, setCopied] = useState(null)

  const fields = [
    [
      'Name',
      personalDetails.fullName ||
        personalDetails.full_name ||
        personalDetails.name,
    ],

    [
      'Date of Birth',
      personalDetails.dob ||
        personalDetails.dateOfBirth ||
        personalDetails.date_of_birth,
    ],

    [
      "Father's Name",
      personalDetails.fatherName ||
        personalDetails.father_name ||
        personalDetails.father,
    ],

    [
      'Gender',
      personalDetails.gender,
    ],

    [
      'Address',
      personalDetails.address,
    ],

    [
      'Mobile',
      personalDetails.mobile ||
        personalDetails.phone ||
        personalDetails.mobileNumber,
    ],

    [
      'Category',
      personalDetails.category ||
        additionalDetails.category,
    ],

    [
      'Exam City',
      personalDetails.examCity ||
        additionalDetails.preferredExamCity ||
        additionalDetails.examCity,
    ],
  ]

  function copy(label, value) {
    if (!value) {
      return
    }

    navigator.clipboard
      ?.writeText(String(value))
      .catch(() => {})

    setCopied(label)

    setTimeout(
      () => setCopied(null),
      1200
    )
  }

  return (
    <Card className="h-full">
      <h3 className="font-medium text-ink mb-1">
        Applicant data
      </h3>

      <p className="text-xs text-ink-faint mb-4">
        Real data from the applicant&apos;s application.
      </p>

      <div className="space-y-3">
        {fields.map(([label, value]) => {
          const displayValue =
            value || 'Not provided'

          return (
            <div
              key={label}
              className="border border-line rounded-lg px-3.5 py-2.5"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-[11px] uppercase tracking-wide text-ink-faint">
                  {label}
                </p>

                {value && (
                  <button
                    type="button"
                    onClick={() =>
                      copy(label, value)
                    }
                    className="text-[11px] text-brand-600 hover:text-brand-700"
                  >
                    {copied === label
                      ? 'Copied'
                      : 'Copy'}
                  </button>
                )}
              </div>

              <p className="text-sm text-ink mt-1 break-words">
                {displayValue}
              </p>
            </div>
          )
        })}
      </div>

      <div className="mt-5">
        <h4 className="text-sm font-medium text-ink mb-3">
          Documents
        </h4>

        {documents.length === 0 ? (
          <p className="text-xs text-ink-faint">
            No documents attached.
          </p>
        ) : (
          <div className="space-y-2">
            {documents.map((document) => (
              <div
                key={document.id}
                className="border border-line rounded-lg px-3 py-2.5"
              >
                <p className="text-sm text-ink font-medium">
                  {document.document_name ||
                    document.document_type ||
                    'Document'}
                </p>

                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[11px] text-ink-faint">
                    {document.source === 'vault'
                      ? 'From Vault'
                      : 'Uploaded'}
                  </span>

                  <span className="text-[11px] text-ink-faint">
                    ·
                  </span>

                  <span className="text-[11px] text-ink-faint">
                    {document.verification_status ||
                      'pending'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  )
}


/* ======================================================
   FORM WORKSPACE
====================================================== */

function FormWorkspace({
  application,
}) {
  const formData =
    application?.form_data || {}

  const sections = [
    {
      title: 'Personal Details',
      data:
        formData.personalDetails || {},
    },

    {
      title: 'Disability Details',
      data:
        formData.disabilityDetails || {},
    },

    {
      title: 'Parent Details',
      data:
        formData.parentDetails || {},
    },

    {
      title: 'Examination Details',
      data:
        formData.examinationDetails || {},
    },

    {
      title: 'Class 10 Education',
      data:
        formData.education10 || {},
    },

    {
      title: 'Class 12 Education',
      data:
        formData.education12 || {},
    },

    {
      title: 'Address',
      data:
        formData.address || {},
    },

    {
      title: 'Additional Details',
      data:
        formData.additionalDetails || {},
    },
  ]

  return (
    <Card>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium text-ink">
            Application details
          </h3>

          <p className="text-xs text-ink-faint mt-1">
            Details submitted by the applicant.
          </p>
        </div>

        <Badge tone="blue">
          {formatStatus(
            application?.status
          )}
        </Badge>
      </div>

      <div className="mt-5 space-y-4">
        {sections.map((section) => {
          const entries =
            Object.entries(section.data)

          if (entries.length === 0) {
            return null
          }

          return (
            <div
              key={section.title}
              className="border border-line rounded-xl overflow-hidden"
            >
              <div className="px-4 py-3 bg-surface border-b border-line">
                <h4 className="text-sm font-medium text-ink">
                  {section.title}
                </h4>
              </div>

              <div className="grid grid-cols-2 gap-3 p-4">
                {entries.map(
                  ([key, value]) => (
                    <div
                      key={key}
                      className="min-w-0"
                    >
                      <p className="text-[11px] text-ink-faint uppercase tracking-wide">
                        {formatLabel(key)}
                      </p>

                      <p className="text-sm text-ink mt-1 break-words">
                        {formatValue(value)}
                      </p>
                    </div>
                  )
                )}
              </div>
            </div>
          )
        })}

        {sections.every(
          (section) =>
            Object.keys(section.data).length ===
            0
        ) && (
          <div className="py-8 text-center">
            <p className="text-sm text-ink-faint">
              No form data available.
            </p>
          </div>
        )}
      </div>
    </Card>
  )
}


/* ======================================================
   APPLICATION STATUS
====================================================== */

function ApplicationStatus({
  application,
}) {
  const navigate = useNavigate()

  const [
    governmentApplicationNumber,
    setGovernmentApplicationNumber,
  ] = useState(
    application?.government_application_number ||
      ''
  )

  const [
    governmentApplicationPassword,
    setGovernmentApplicationPassword,
  ] = useState(
    application?.government_application_password ||
      ''
  )

  const [submitting, setSubmitting] =
    useState(false)

  const [submitted, setSubmitted] =
    useState(
      application?.status === 'submitted'
    )

  const [message, setMessage] =
    useState('')

  const [error, setError] =
    useState('')

  /*
    Whenever Workspace auto-refreshes the application,
    this syncs the latest government credentials/status.
  */
  useEffect(() => {
    setGovernmentApplicationNumber(
      application?.government_application_number ||
        ''
    )

    setGovernmentApplicationPassword(
      application?.government_application_password ||
        ''
    )

    setSubmitted(
      application?.status === 'submitted'
    )
  }, [
    application?.government_application_number,
    application?.government_application_password,
    application?.status,
  ])

  async function submitApplication() {
    const applicationNumber =
      governmentApplicationNumber.trim()

    const applicationPassword =
      governmentApplicationPassword.trim()

    if (!applicationNumber) {
      setError(
        'Please enter the government application number.'
      )
      setMessage('')
      return
    }

    if (!applicationPassword) {
      setError(
        'Please enter the government portal password.'
      )
      setMessage('')
      return
    }

    try {
      setSubmitting(true)
      setError('')
      setMessage('')

      const token =
        localStorage.getItem(
          'formfiller_access_token'
        )

      if (!token) {
        throw new Error(
          'Operator session not found. Please login again.'
        )
      }

      const response =
        await fetch(
          `${API_BASE_URL}/api/applications/${application.id}/submit`,
          {
            method: 'POST',

            headers: {
              Authorization:
                `Bearer ${token}`,

              'Content-Type':
                'application/json',
            },

            credentials: 'include',

            body: JSON.stringify({
              governmentApplicationNumber:
                applicationNumber,

              governmentApplicationPassword:
                applicationPassword,
            }),
          }
        )

      const data =
        await response.json()

      if (!response.ok) {
        throw new Error(
          data?.message ||
            'Unable to submit application.'
        )
      }

      setGovernmentApplicationNumber(
        data?.governmentApplicationNumber ||
          applicationNumber
      )

      setGovernmentApplicationPassword(
        data?.governmentApplicationPassword ||
          applicationPassword
      )

      setSubmitted(true)

      setMessage(
        'Application submitted successfully.'
      )
    } catch (error) {
      console.error(
        'Submit application error:',
        error
      )

      setError(
        error?.message ||
          'Unable to submit application.'
      )
    } finally {
      setSubmitting(false)
    }
  }

  const isApproved =
    application?.status === 'approved'

  const isSubmitted =
    submitted ||
    application?.status === 'submitted'

  return (
    <Card>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium text-ink">
            Application workflow
          </h3>

          <p className="text-sm text-ink-faint mt-1">
            Complete the government submission
            after the applicant approves the final
            application.
          </p>
        </div>

        <Badge
          tone={
            isSubmitted
              ? 'green'
              : isApproved
              ? 'blue'
              : 'gray'
          }
        >
          {isSubmitted
            ? 'Submitted'
            : isApproved
            ? 'Approved'
            : formatStatus(
                application?.status
              )}
        </Badge>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-3">
        <WorkflowItem
          title="Application"
          status="Loaded"
        />

        <WorkflowItem
          title="Official form"
          status="Manual"
        />

        <WorkflowItem
          title="Final review"
          status={
            isSubmitted
              ? 'Submitted'
              : isApproved
              ? 'Approved'
              : 'Pending'
          }
        />
      </div>

      {/* ==================================================
          APPROVED → GOVERNMENT SUBMISSION
      ================================================== */}

      {isApproved && !isSubmitted && (
        <div className="mt-5 border border-line rounded-xl p-4 bg-surface">
          <div>
            <h4 className="text-sm font-medium text-ink">
              Government Submission Details
            </h4>

            <p className="text-xs text-ink-faint mt-1">
              Enter the application number and
              password generated after completing
              the official government portal.
            </p>
          </div>

          <div className="mt-4 space-y-3">
            {/* APPLICATION NUMBER */}

            <div>
              <label className="block text-xs font-medium text-ink mb-1.5">
                Government Application Number
              </label>

              <input
                type="text"
                value={
                  governmentApplicationNumber
                }
                onChange={(event) => {
                  setGovernmentApplicationNumber(
                    event.target.value
                  )

                  setError('')
                  setMessage('')
                }}
                placeholder="Enter government application number"
                disabled={submitting}
                className="w-full border border-line rounded-lg px-3 py-2.5 text-sm text-ink bg-white outline-none focus:border-brand-500"
              />
            </div>

            {/* PASSWORD */}

            <div>
              <label className="block text-xs font-medium text-ink mb-1.5">
                Government Portal Password
              </label>

              <input
                type="password"
                value={
                  governmentApplicationPassword
                }
                onChange={(event) => {
                  setGovernmentApplicationPassword(
                    event.target.value
                  )

                  setError('')
                  setMessage('')
                }}
                placeholder="Enter government portal password"
                disabled={submitting}
                className="w-full border border-line rounded-lg px-3 py-2.5 text-sm text-ink bg-white outline-none focus:border-brand-500"
              />
            </div>
          </div>

          {/* ERROR */}

          {error && (
            <div className="mt-3 rounded-lg border border-danger/20 bg-danger/5 px-3 py-2">
              <p className="text-xs text-danger">
                {error}
              </p>
            </div>
          )}

          {/* SUBMIT */}

          <div className="mt-4 flex justify-end">
            <Button
              type="button"
              disabled={
                submitting ||
                !governmentApplicationNumber.trim() ||
                !governmentApplicationPassword.trim()
              }
              onClick={submitApplication}
            >
              {submitting
                ? 'Submitting...'
                : 'Submit Application'}
            </Button>
          </div>
        </div>
      )}

      {/* ==================================================
          SUBMITTED SUCCESS
      ================================================== */}

      {isSubmitted && (
        <div className="mt-5 border border-success/20 rounded-xl p-4 bg-success/5">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-success/10 flex items-center justify-center shrink-0">
              <span className="text-success text-sm">
                ✓
              </span>
            </div>

            <div className="min-w-0 flex-1">
              <h4 className="text-sm font-medium text-ink">
                Application submitted
              </h4>

              <p className="text-xs text-ink-faint mt-1">
                The government application has been
                submitted successfully.
              </p>

              <div className="mt-3 space-y-3">
                {/* APPLICATION NUMBER */}

                {governmentApplicationNumber && (
                  <div>
                    <p className="text-[11px] text-ink-faint">
                      Government Application Number
                    </p>

                    <p className="text-sm font-medium text-ink mono-data break-all mt-1">
                      {
                        governmentApplicationNumber
                      }
                    </p>
                  </div>
                )}

                {/* PASSWORD */}

                {governmentApplicationPassword && (
                  <div>
                    <p className="text-[11px] text-ink-faint">
                      Government Portal Password
                    </p>

                    <p className="text-sm font-medium text-ink mono-data break-all mt-1">
                      {
                        governmentApplicationPassword
                      }
                    </p>
                  </div>
                )}
              </div>

              {/* EXIT APPLICATION */}

              <div className="mt-5 pt-4 border-t border-success/20 flex justify-end">
                <Button
                  type="button"
                  onClick={() =>
                    navigate('/operator')
                  }
                >
                  Exit Application
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MESSAGE */}

      {message && !isSubmitted && (
        <div className="mt-3 rounded-lg border border-success/20 bg-success/5 px-3 py-2">
          <p className="text-xs text-success">
            {message}
          </p>
        </div>
      )}
    </Card>
  )
}


/* ======================================================
   WORKFLOW ITEM
====================================================== */

function WorkflowItem({
  title,
  status,
}) {
  return (
    <div className="border border-line rounded-lg p-3">
      <p className="text-[11px] text-ink-faint uppercase tracking-wide">
        {title}
      </p>

      <p className="text-sm font-medium text-ink mt-1">
        {status}
      </p>
    </div>
  )
}


/* ======================================================
   FINAL APPLICATION FILE
====================================================== */

function FinalApplicationFile({
  applicationId,
}) {
  const [uploading, setUploading] = useState(false)
  const [opening, setOpening] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [selectedFiles, setSelectedFiles] = useState([])

  const fileInputRef = useRef(null)

  function handleFileChange(event) {
    const files = Array.from(event.target.files || [])

    setError('')
    setSuccess('')

    if (!files.length) {
      setSelectedFiles([])
      return
    }

    if (files.length < 2 || files.length > 4) {
      setError('Please select between 2 and 4 screenshots.')
      setSelectedFiles([])
      event.target.value = ''
      return
    }

    const invalidFile = files.find(
      (file) =>
        !['image/jpeg', 'image/png'].includes(
          file.type
        )
    )

    if (invalidFile) {
      setError(
        'Only JPG and PNG screenshots are allowed.'
      )
      setSelectedFiles([])
      event.target.value = ''
      return
    }

    const oversizedFile = files.find(
      (file) =>
        file.size > 10 * 1024 * 1024
    )

    if (oversizedFile) {
      setError(
        'Each screenshot must be 10 MB or smaller.'
      )
      setSelectedFiles([])
      event.target.value = ''
      return
    }

    setSelectedFiles(files)
  }

  async function generatePdf() {
    try {
      setError('')
      setSuccess('')

      if (
        selectedFiles.length < 2 ||
        selectedFiles.length > 4
      ) {
        setError(
          'Please select between 2 and 4 screenshots.'
        )
        return
      }

      const token =
        localStorage.getItem(
          'formfiller_access_token'
        )

      if (!token) {
        throw new Error(
          'Operator session not found. Please login again.'
        )
      }

      setUploading(true)

      const formData = new FormData()

      selectedFiles.forEach((file) => {
        formData.append('screenshots', file)
      })

      const response = await fetch(
        `${API_BASE_URL}/api/applications/${applicationId}/final-files`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          credentials: 'include',
          body: formData,
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data?.message ||
            'Unable to generate PDF.'
        )
      }

      setSuccess(
        data?.message ||
          'Final application PDF generated successfully.'
      )

      setSelectedFiles([])

      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } catch (error) {
      console.error(
        'Generate final PDF error:',
        error
      )

      setError(
        error?.message ||
          'Unable to generate PDF.'
      )
    } finally {
      setUploading(false)
    }
  }

  async function openPdf() {
    try {
      setOpening(true)
      setError('')
      setSuccess('')

      const token =
        localStorage.getItem(
          'formfiller_access_token'
        )

      if (!token) {
        throw new Error(
          'Operator session not found. Please login again.'
        )
      }

      const response = await fetch(
        `${API_BASE_URL}/api/applications/${applicationId}/final-files/current`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          credentials: 'include',
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data?.message ||
            'Unable to open PDF.'
        )
      }

      const signedUrl =
        data?.pdf?.signedUrl

      if (!signedUrl) {
        throw new Error(
          'PDF access URL was not generated.'
        )
      }

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

      setError(
        error?.message ||
          'Unable to open PDF.'
      )
    } finally {
      setOpening(false)
    }
  }

  return (
    <Card>
      <div>
        <h3 className="font-medium text-ink">
          Final application PDF
        </h3>

        <p className="text-xs text-ink-faint mt-1">
          Upload screenshots from the official
          government portal. FormFiller will
          combine them into a single application PDF.
        </p>
      </div>

      {/* ==================================================
          UPLOAD SCREENSHOTS
      ================================================== */}

      <div className="mt-5 border border-line rounded-xl p-4 bg-surface">
        <div>
          <h4 className="text-sm font-medium text-ink">
            Generate final PDF
          </h4>

          <p className="text-xs text-ink-faint mt-1">
            Upload 2–4 screenshots of the completed
            government application.
          </p>
        </div>

        <div className="mt-4">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png"
            multiple
            onChange={handleFileChange}
            disabled={uploading}
            className="block w-full text-sm text-ink
              file:mr-4
              file:rounded-lg
              file:border-0
              file:bg-brand-50
              file:px-4
              file:py-2
              file:text-sm
              file:font-medium
              file:text-brand-700
              hover:file:bg-brand-100"
          />

          <p className="text-[11px] text-ink-faint mt-2">
            JPG or PNG only · 2–4 screenshots ·
            Maximum 10 MB per screenshot
          </p>
        </div>

        {/* SELECTED FILES */}

        {selectedFiles.length > 0 && (
          <div className="mt-4 space-y-2">
            <p className="text-xs font-medium text-ink">
              Selected screenshots
            </p>

            {selectedFiles.map(
              (file, index) => (
                <div
                  key={`${file.name}-${index}`}
                  className="flex items-center justify-between border border-line rounded-lg px-3 py-2 bg-white"
                >
                  <div className="min-w-0">
                    <p className="text-xs text-ink truncate">
                      {index + 1}. {file.name}
                    </p>

                    <p className="text-[11px] text-ink-faint">
                      {(
                        file.size /
                        (1024 * 1024)
                      ).toFixed(2)}{' '}
                      MB
                    </p>
                  </div>
                </div>
              )
            )}
          </div>
        )}

        {/* ERROR */}

        {error && (
          <div className="mt-3 rounded-lg border border-danger/20 bg-danger/5 px-3 py-2">
            <p className="text-xs text-danger">
              {error}
            </p>
          </div>
        )}

        {/* SUCCESS */}

        {success && (
          <div className="mt-3 rounded-lg border border-success/20 bg-success/5 px-3 py-2">
            <p className="text-xs text-success">
              {success}
            </p>
          </div>
        )}

        {/* GENERATE BUTTON */}

        <div className="mt-4 flex justify-end">
          <Button
            type="button"
            onClick={generatePdf}
            disabled={
              uploading ||
              selectedFiles.length < 2 ||
              selectedFiles.length > 4
            }
          >
            {uploading
              ? 'Generating PDF...'
              : 'Generate PDF'}
          </Button>
        </div>
      </div>

      {/* ==================================================
          CURRENT PDF
      ================================================== */}

      <div className="mt-5 border-t border-line pt-5">
        <div>
          <h4 className="text-sm font-medium text-ink">
            Current final PDF
          </h4>

          <p className="text-xs text-ink-faint mt-1">
            View the latest PDF generated from the
            operator&apos;s screenshots.
          </p>
        </div>

        <div className="mt-4">
          <Button
            type="button"
            onClick={openPdf}
            disabled={opening}
          >
            {opening
              ? 'Opening...'
              : 'View Current PDF'}
          </Button>
        </div>
      </div>
    </Card>
  )
}
/* ======================================================
   HELPERS
====================================================== */

function formatStatus(status) {
  if (!status) {
    return 'Unknown'
  }

  return String(status)
    .replaceAll('_', ' ')
    .replace(/\b\w/g, (char) =>
      char.toUpperCase()
    )
}


function formatLabel(value) {
  if (!value) {
    return ''
  }

  return String(value)
    .replaceAll('_', ' ')
    .replace(
      /([a-z])([A-Z])/g,
      '$1 $2'
    )
    .replace(/\b\w/g, (char) =>
      char.toUpperCase()
    )
}


function formatValue(value) {
  if (
    value === null ||
    value === undefined ||
    value === ''
  ) {
    return 'Not provided'
  }

  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No'
  }

  if (typeof value === 'object') {
    return JSON.stringify(value)
  }

  return String(value)
}