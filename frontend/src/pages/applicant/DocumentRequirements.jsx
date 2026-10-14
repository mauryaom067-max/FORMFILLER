import {
  useEffect,
  useRef,
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
  Modal,
} from '../../components/ui'

import {
  jeeMainForm,
} from '../../lib/mockData'

import {
  useApp,
} from '../../lib/store'

import {
  apiRequest,
} from '../../lib/api/client'

// ======================================================
// STEPS
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
// STATUS LABELS
// ======================================================

const STATUS_LABEL = {
  idle: 'Available in Vault',

  not_uploaded:
    'Not uploaded',

  uploading:
    'Uploading…',

  processing:
    'Processing…',

  extracting:
    'Extracting details…',

  validating:
    'Validating…',

  ready:
    'Ready',
}

// ======================================================
// STATUS DOT
// ======================================================

function StatusDot({
  status,
}) {
  const className =
    status === 'ready'
      ? 'bg-emerald-500'
      : status === 'uploading' ||
          status === 'processing' ||
          status === 'extracting' ||
          status === 'validating'
        ? 'bg-blue-500'
        : 'bg-slate-300'

  return (
    <span
      className={`inline-block w-2 h-2 rounded-full ${className}`}
    />
  )
}

// ======================================================
// DOCUMENT TYPE HELPER
// ======================================================

function getDocumentType(
  doc
) {
  const map = {
    aadhaar:
      'aadhaar',

    photo:
      'photograph',

    photograph:
      'photograph',

    signature:
      'signature',

    marksheet:
      '10th_marksheet',

    '10th_marksheet':
      '10th_marksheet',

    marksheet_10:
      '10th_marksheet',

    '12th_marksheet':
      '12th_marksheet',

    marksheet_12:
      '12th_marksheet',

    caste_certificate:
      'caste_certificate',
  }

  return (
    map[doc.key] ||
    doc.documentType ||
    doc.key
  )
}

// ======================================================
// COMPONENT
// ======================================================

export default function DocumentRequirements() {
  const navigate =
    useNavigate()

  const {
    user,

    docState,

    grantPermission,

    uploadDocument,

    jeeApplication,

    applicationLoading,

    ensureJeeApplication,

    documentError,

    setDocumentError,
  } = useApp()

  // ====================================================
  // FILE INPUT
  // ====================================================

  const fileInputRef =
    useRef(null)

  const [
    uploadingDocKey,
    setUploadingDocKey,
  ] = useState(null)

  // ====================================================
  // VAULT PERMISSION MODAL
  // ====================================================

  const [
    permissionDoc,
    setPermissionDoc,
  ] = useState(null)

  // ====================================================
  // PREVIEW
  // ====================================================

  const [
    previewDoc,
    setPreviewDoc,
  ] = useState(null)

  const [
    previewUrl,
    setPreviewUrl,
  ] = useState('')

  const [
    previewLoading,
    setPreviewLoading,
  ] = useState(false)

  // ====================================================
  // PAGE ERROR
  // ====================================================

  const [
    pageError,
    setPageError,
  ] = useState('')

  // ====================================================
  // LOAD / CREATE JEE APPLICATION
  // ====================================================

  useEffect(() => {
    if (!user) {
      return
    }

    let cancelled =
      false

    async function loadApplication() {
      try {
        setPageError('')

        setDocumentError('')

        await ensureJeeApplication(
          user
        )
      } catch (error) {
        console.error(
          'Failed to load JEE application:',
          error
        )

        if (!cancelled) {
          setPageError(
            error?.message ||
              'Unable to load your JEE Main application.'
          )
        }
      }
    }

    loadApplication()

    return () => {
      cancelled = true
    }
  }, [
    user,
    ensureJeeApplication,
    setDocumentError,
  ])

  // ====================================================
  // REQUIRED DOCUMENTS
  //
  // Caste certificate is optional and must not block
  // the Next button.
  // ====================================================

  const requiredDocuments =
    jeeMainForm.documents.filter(
      (document) => {
        if (
          document.key ===
          'caste_certificate'
        ) {
          return false
        }

        if (
          document.required ===
          false
        ) {
          return false
        }

        return true
      }
    )

  // ====================================================
  // ALL REQUIRED DOCUMENTS READY?
  // ====================================================

  const allReady =
    requiredDocuments.every(
      (document) =>
        docState[
          document.key
        ]?.status === 'ready'
    )

  // ====================================================
  // FILE UPLOAD BUTTON
  // ====================================================

  function handleUploadClick(
    docKey
  ) {
    setDocumentError('')

    setUploadingDocKey(
      docKey
    )

    fileInputRef.current?.click()
  }

  // ====================================================
  // FILE SELECTED
  // ====================================================

  async function handleFileSelect(
    event
  ) {
    const file =
      event.target.files?.[0]

    if (
      !file ||
      !uploadingDocKey
    ) {
      return
    }

    // --------------------------------------------
    // Basic file validation
    // --------------------------------------------

    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'application/pdf',
    ]

    if (
      !allowedTypes.includes(
        file.type
      )
    ) {
      setDocumentError(
        'Only JPG, PNG, WEBP and PDF files are allowed.'
      )

      event.target.value =
        ''

      setUploadingDocKey(null)

      return
    }

    // --------------------------------------------
    // 10 MB limit
    // --------------------------------------------

    const maxSize =
      10 * 1024 * 1024

    if (
      file.size >
      maxSize
    ) {
      setDocumentError(
        'File size must be less than 10 MB.'
      )

      event.target.value =
        ''

      setUploadingDocKey(null)

      return
    }

    try {
      await uploadDocument(
        uploadingDocKey,
        file
      )
    } catch (error) {
      console.error(
        'File upload error:',
        error
      )
    } finally {
      setUploadingDocKey(
        null
      )

      // Allows same file to be selected again.
      event.target.value =
        ''
    }
  }

  // ====================================================
  // PREVIEW DOCUMENT
  // ====================================================

  async function handlePreviewDocument(
    doc
  ) {
    setPreviewDoc(doc)

    setPreviewUrl('')

    setPreviewLoading(
      true
    )

    setPageError('')

    setDocumentError('')

    try {
      const state =
        docState[
          doc.key
        ]

      if (!state) {
        throw new Error(
          'Document state was not found.'
        )
      }

      // ==================================================
      // LOCAL UPLOAD PREVIEW
      // ==================================================

      if (
        state.source ===
          'upload' &&
        state.previewUrl
      ) {
        setPreviewUrl(
          state.previewUrl
        )

        return
      }

      // ==================================================
      // VAULT DOCUMENT PREVIEW
      // ==================================================

      const documentId =
        state.documentId

      if (!documentId) {
        throw new Error(
          'Document could not be found.'
        )
      }

      const data =
        await apiRequest(
          `/api/documents/${documentId}/url`,
          {
            headers: {
              Authorization:
                `Bearer ${localStorage.getItem(
                  'formfiller_access_token'
                )}`,
            },
          }
        )

      if (
        !data?.url
      ) {
        throw new Error(
          'Unable to generate secure document URL.'
        )
      }

      setPreviewUrl(
        data.url
      )
    } catch (error) {
      console.error(
        'Document preview error:',
        error
      )

      setDocumentError(
        error?.message ||
          'Unable to preview this document.'
      )
    } finally {
      setPreviewLoading(
        false
      )
    }
  }

  // ====================================================
  // CLOSE PREVIEW
  // ====================================================

  function closePreview() {
    setPreviewDoc(null)

    setPreviewUrl('')

    setPreviewLoading(
      false
    )
  }

  // ====================================================
  // NEXT
  // ====================================================

  async function handleNext() {
    if (
      !jeeApplication
    ) {
      setPageError(
        'Your application is still loading. Please wait a moment.'
      )

      return
    }

    if (
      !allReady
    ) {
      setPageError(
        'Please complete all required documents before continuing.'
      )

      return
    }

    setPageError('')

    try {
      // Move application to step 2.
      //
      // If backend supports currentStep,
      // store.jsx will update it.
      //
      // We intentionally do not block navigation
      // if only the step-update API is unavailable.

      const updateStep =
        window.__FORMFILLER_UPDATE_STEP__

      if (
        typeof updateStep ===
        'function'
      ) {
        await updateStep(2)
      }
    } catch (error) {
      console.warn(
        'Application step update warning:',
        error
      )
    }

    navigate(
      '/forms/jee-main/application'
    )
  }

  // ====================================================
  // NOT LOGGED IN
  // ====================================================

  if (!user) {
    return (
      <ApplicantShell
        title="JEE Main"
        subtitle="Step 1 of 6 · Documents"
      >
        <div className="max-w-content">
          <Card>
            <div className="py-10 text-center">
              <h2 className="font-display text-xl font-bold text-ink">
                Login required
              </h2>

              <p className="text-sm text-ink-faint mt-2">
                Please login before uploading or
                accessing your documents.
              </p>
            </div>
          </Card>
        </div>
      </ApplicantShell>
    )
  }

  // ====================================================
  // RENDER
  // ====================================================

  return (
    <ApplicantShell
      title="JEE Main"
      subtitle="Step 1 of 6 · Documents"
    >
      <div className="max-w-content">

        {/* ==========================================
            PROGRESS
        ========================================== */}

        <ProgressSteps
          steps={STEPS}
          current={0}
        />

        {/* ==========================================
            HEADER
        ========================================== */}

        <div className="mt-8 mb-6">
          <h2 className="font-display text-2xl font-bold text-ink">
            Documents required
          </h2>

          <p className="text-ink-faint text-sm mt-1">
            Upload your documents or allow FormFiller
            to use documents already stored in your Vault.
          </p>
        </div>

        {/* ==========================================
            APPLICATION LOADING
        ========================================== */}

        {applicationLoading && (
          <div className="mb-5 rounded-lg border border-brand-200 bg-brand-50 px-4 py-3 text-sm text-brand-700">
            Preparing your JEE Main application…
          </div>
        )}

        {/* ==========================================
            APPLICATION READY
        ========================================== */}

        {!applicationLoading &&
          jeeApplication && (
            <div className="mb-6 rounded-xl border border-line bg-surface px-5 py-4">

              <div className="flex items-center justify-between gap-4">

                <div>
                  <p className="text-xs text-ink-faint">
                    Application ID
                  </p>

                  <p className="text-sm font-medium text-ink mt-1 break-all">
                    {jeeApplication.id}
                  </p>
                </div>

                <Badge tone="blue">
                  {jeeApplication.status ||
                    'draft'}
                </Badge>

              </div>

            </div>
          )}

        {/* ==========================================
            ERROR
        ========================================== */}

        {(pageError ||
          documentError) && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3">

            <p className="text-sm font-medium text-red-700">
              {pageError ||
                documentError}
            </p>

          </div>
        )}

        {/* ==========================================
            HIDDEN FILE INPUT
        ========================================== */}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,application/pdf"
          className="hidden"
          onChange={
            handleFileSelect
          }
        />

        {/* ==========================================
            DOCUMENT CARDS
        ========================================== */}

        <div className="space-y-4">

          {jeeMainForm.documents.map(
            (doc) => {
              const state =
                docState[
                  doc.key
                ] || {
                  permission:
                    false,

                  status:
                    'not_uploaded',

                  file:
                    null,

                  previewUrl:
                    null,

                  source:
                    null,
                }

              const isOptional =
                doc.key ===
                  'caste_certificate' ||
                doc.required ===
                  false

              const isReady =
                state.status ===
                'ready'

              const isImage =
                state.file?.type?.startsWith(
                  'image/'
                ) ||
                state.mime_type?.startsWith(
                  'image/'
                )

              const hasPreview =
                !!state.previewUrl ||
                !!state.documentId

              return (
                <Card
                  key={
                    doc.key
                  }
                >

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">

                    {/* ==================================
                        LEFT
                    ================================== */}

                    <div className="flex items-start gap-4 min-w-0">

                      <div className="w-11 h-11 rounded-xl bg-brand-50 flex items-center justify-center shrink-0">

                        <svg
                          className="w-5 h-5 text-brand-500"
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <path
                            d="M7 3h7l4 4v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinejoin="round"
                          />

                          <path
                            d="M14 3v5h5"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinejoin="round"
                          />
                        </svg>

                      </div>

                      <div className="min-w-0">

                        <div className="flex items-center gap-2 flex-wrap">

                          <p className="text-sm font-medium text-ink">
                            {doc.label}
                          </p>

                          {isOptional && (
                            <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
                              Optional
                            </span>
                          )}

                        </div>

                        <p className="text-xs text-ink-faint mt-1">
                          {doc.hint}
                        </p>

                        {state.permission && (
                          <p className="text-xs mt-2 flex items-center gap-1.5">

                            <StatusDot
                              status={
                                state.status
                              }
                            />

                            <span className="text-ink-soft">
                              {
                                STATUS_LABEL[
                                  state.status
                                ] ||
                                state.status
                              }
                            </span>

                          </p>
                        )}

                        {state.file && (
                          <p className="text-xs text-ink-faint mt-1 truncate max-w-[320px]">
                            {state.file.name}
                          </p>
                        )}

                      </div>

                    </div>

                    {/* ==================================
                        RIGHT ACTIONS
                    ================================== */}

                    <div className="flex items-center gap-2 shrink-0 flex-wrap">

                      {/* PREVIEW */}

                      {isReady &&
                        hasPreview && (
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() =>
                              handlePreviewDocument(
                                doc
                              )
                            }
                          >
                            Preview
                          </Button>
                        )}

                      {/* USE FROM VAULT */}

                      {!state.permission &&
                        doc.inVault && (
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() =>
                              setPermissionDoc(
                                doc
                              )
                            }
                          >
                            Use from Vault
                          </Button>
                        )}

                      {/* DIRECT UPLOAD */}

                      {!state.permission && (
                        <Button
                          size="sm"
                          onClick={() =>
                            handleUploadClick(
                              doc.key
                            )
                          }
                        >
                          Upload Document
                        </Button>
                      )}

                      {/* RE-UPLOAD */}

                      {state.permission &&
                        state.status ===
                          'ready' && (
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() =>
                              handleUploadClick(
                                doc.key
                              )
                            }
                          >
                            Replace
                          </Button>
                        )}

                      {/* READY */}

                      {isReady && (
                        <Badge tone="green">
                          Ready
                        </Badge>
                      )}

                      {/* PROCESSING */}

                      {state.permission &&
                        !isReady && (
                          <Badge tone="blue">
                            In progress
                          </Badge>
                        )}

                    </div>

                  </div>

                </Card>
              )
            }
          )}

        </div>

        {/* ==========================================
            REQUIRED DOCUMENT INFO
        ========================================== */}

        <div className="mt-6 rounded-lg border border-line bg-surface-soft px-4 py-3">

          <p className="text-xs text-ink-faint">
            Required documents must be ready before
            you can continue.
          </p>

          <p className="text-xs text-ink-faint mt-1">
            Optional documents, such as a caste
            certificate when not applicable, will not
            block the application.
          </p>

        </div>

        {/* ==========================================
            NEXT
        ========================================== */}

        <div className="flex justify-between items-center mt-8">

          <Button
            variant="secondary"
            onClick={() =>
              navigate(
                '/dashboard'
              )
            }
          >
            Back
          </Button>

          <Button
            size="lg"
            disabled={
              !allReady ||
              !jeeApplication ||
              applicationLoading
            }
            onClick={
              handleNext
            }
          >
            Review & Continue
          </Button>

        </div>

        {/* ==========================================
            VAULT PERMISSION MODAL
        ========================================== */}

        <Modal
          open={
            !!permissionDoc
          }
          onClose={() =>
            setPermissionDoc(
              null
            )
          }
          title="Allow document access"
          footer={
            <>
              <Button
                variant="secondary"
                onClick={() =>
                  setPermissionDoc(
                    null
                  )
                }
              >
                Cancel
              </Button>

              <Button
                onClick={async () => {
                  if (
                    !permissionDoc
                  ) {
                    return
                  }

                  const success =
                    await grantPermission(
                      permissionDoc.key
                    )

                  if (
                    success
                  ) {
                    setPermissionDoc(
                      null
                    )
                  }
                }}
              >
                Allow & Continue
              </Button>
            </>
          }
        >
          <div className="space-y-4">

            <p className="text-sm text-ink-soft">
              FormFiller wants permission to use the
              following document from your Cloud Vault:
            </p>

            <div className="rounded-lg border border-line bg-surface-soft p-4">

              <p className="text-sm font-medium text-ink">
                {
                  permissionDoc?.label
                }
              </p>

              <p className="text-xs text-ink-faint mt-1">
                {
                  permissionDoc?.hint
                }
              </p>

            </div>

            <div className="rounded-lg bg-brand-50 border border-brand-100 p-4">

              <p className="text-xs text-brand-700">
                <strong>
                  Your permission matters.
                </strong>{' '}
                A document stored in your Vault is not
                automatically used for this application.
              </p>

            </div>

          </div>
        </Modal>

        {/* ==========================================
            PREVIEW MODAL
        ========================================== */}

        <Modal
          open={
            !!previewDoc
          }
          onClose={
            closePreview
          }
          title={
            previewDoc?.label ||
            'Document Preview'
          }
          footer={
            <Button
              variant="secondary"
              onClick={
                closePreview
              }
            >
              Close
            </Button>
          }
        >
          <div className="min-h-[300px] flex items-center justify-center">

            {previewLoading && (
              <div className="text-sm text-ink-faint">
                Loading secure preview…
              </div>
            )}

            {!previewLoading &&
              previewUrl &&
              (
                previewDoc?.key ===
                  'photo' ||
                previewDoc?.key ===
                  'photograph' ||
                docState[
                  previewDoc?.key
                ]?.file?.type?.startsWith(
                  'image/'
                )
              ) && (
                <img
                  src={
                    previewUrl
                  }
                  alt={
                    previewDoc?.label ||
                    'Document preview'
                  }
                  className="max-h-[60vh] max-w-full rounded-lg object-contain"
                />
              )}

            {!previewLoading &&
              previewUrl &&
              !(
                previewDoc?.key ===
                  'photo' ||
                previewDoc?.key ===
                  'photograph' ||
                docState[
                  previewDoc?.key
                ]?.file?.type?.startsWith(
                  'image/'
                )
              ) && (
                <iframe
                  src={
                    previewUrl
                  }
                  title={
                    previewDoc?.label ||
                    'PDF preview'
                  }
                  className="w-full h-[60vh] rounded-lg border border-line"
                />
              )}

            {!previewLoading &&
              !previewUrl && (
                <div className="text-sm text-red-500">
                  Preview unavailable.
                </div>
              )}

          </div>
        </Modal>

      </div>
    </ApplicantShell>
  )
}