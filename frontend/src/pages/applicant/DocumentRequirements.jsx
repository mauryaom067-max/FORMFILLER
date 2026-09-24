import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { ApplicantShell } from '../../components/layout/ApplicantShell'
import {
  Card,
  Button,
  Badge,
  ProgressSteps,
  Modal,
} from '../../components/ui'

import { jeeMainForm } from '../../lib/mockData'
import { useApp } from '../../lib/store'

const STEPS = [
  'Documents',
  'Application',
  'Payment',
  'Processing',
  'Review',
  'Submitted',
]

const STATUS_LABEL = {
  idle: 'Available in Vault',
  not_uploaded: 'Not uploaded',
  uploading: 'Uploading…',
  processing: 'Processing…',
  extracting: 'Extracting details…',
  validating: 'Validating…',
  ready: 'Ready',
}

export default function DocumentRequirements() {
  const navigate = useNavigate()

  const {
    docState,
    grantPermission,
    uploadDocument,
  } = useApp()

  const fileInputRef = useRef(null)

  const [permissionDoc, setPermissionDoc] =
    useState(null)

  const [previewDoc, setPreviewDoc] =
    useState(null)

  const [uploadingDocKey, setUploadingDocKey] =
    useState(null)

  /*
  |--------------------------------------------------------------------------
  | Direct upload
  |--------------------------------------------------------------------------
  */

  const handleUploadClick = (docKey) => {
    setUploadingDocKey(docKey)

    fileInputRef.current?.click()
  }

  const handleFileSelect = (event) => {
    const file = event.target.files?.[0]

    if (!file || !uploadingDocKey) {
      return
    }

    uploadDocument(uploadingDocKey, file)

    setUploadingDocKey(null)

    // Allows selecting the same file again later
    event.target.value = ''
  }

  /*
  |--------------------------------------------------------------------------
  | Required documents
  |--------------------------------------------------------------------------
  */

  const requiredDocuments =
    jeeMainForm.documents.filter(
      (document) => document.required
    )

  const allReady = requiredDocuments.every(
    (document) =>
      docState[document.key]?.status === 'ready'
  )

  return (
    <ApplicantShell
      title="JEE Main"
      subtitle="Step 1 of 6 · Documents"
    >
      <div className="max-w-content">
        <ProgressSteps
          steps={STEPS}
          current={0}
        />

        <div className="mt-8 mb-6">
          <h2 className="font-display text-2xl font-bold text-ink">
            Documents required
          </h2>

          <p className="text-ink-faint text-sm mt-1">
            Nothing is used until you explicitly allow it
            below.
          </p>
        </div>

        {/* Hidden file input */}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,.pdf"
          className="hidden"
          onChange={handleFileSelect}
        />

        <div className="space-y-3">
          {jeeMainForm.documents.map((doc) => {
            const state = docState[doc.key]

            if (!state) {
              return null
            }

            return (
              <Card
                key={doc.key}
                className="p-5"
              >
                <div className="flex items-center justify-between gap-6">
                  {/* Document information */}

                  <div className="flex items-start gap-3.5 min-w-0">
                    <div className="w-10 h-10 rounded-lg bg-brand-50 flex items-center justify-center shrink-0">
                      <svg
                        className="w-4.5 h-4.5 text-brand-500"
                        viewBox="0 0 16 16"
                        fill="none"
                      >
                        <path
                          d="M4 2h6l3 3v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1Z"
                          stroke="currentColor"
                          strokeWidth="1.3"
                          strokeLinejoin="round"
                        />

                        <path
                          d="M10 2v3h3"
                          stroke="currentColor"
                          strokeWidth="1.3"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-medium text-ink">
                          {doc.label}
                        </p>

                        {doc.required ? (
                          <span className="text-[10px] font-medium text-danger">
                            Required
                          </span>
                        ) : (
                          <span className="text-[10px] font-medium text-ink-faint">
                            Optional
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-ink-faint mt-1">
                        {doc.hint}
                      </p>

                      {/* Status */}

                      {state.permission && (
                        <p className="text-xs mt-1.5 flex items-center gap-1.5">
                          <StatusDot
                            status={state.status}
                          />

                          <span className="text-ink-soft">
                            {STATUS_LABEL[
                              state.status
                            ] || 'Processing…'}
                          </span>

                          {state.source ===
                            'vault' &&
                            state.status ===
                              'ready' && (
                              <span className="text-ink-faint">
                                · From Vault
                              </span>
                            )}

                          {state.source ===
                            'upload' &&
                            state.status ===
                              'ready' && (
                              <span className="text-ink-faint">
                                · Uploaded
                              </span>
                            )}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions */}

                  <div className="flex items-center gap-3 shrink-0 flex-wrap justify-end">
                    {/* Preview */}

                    {state.status === 'ready' && (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() =>
                          setPreviewDoc(doc)
                        }
                      >
                        Preview
                      </Button>
                    )}

                    {/* Vault permission */}

                    {!state.permission &&
                      doc.inVault && (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() =>
                            setPermissionDoc(doc)
                          }
                        >
                          Use from Vault
                        </Button>
                      )}

                    {/* Direct upload */}

                    {!state.permission &&
                      !doc.inVault && (
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

                    {/* Ready */}

                    {state.permission &&
                      state.status === 'ready' && (
                        <Badge tone="green">
                          Ready
                        </Badge>
                      )}

                    {/* Processing */}

                    {state.permission &&
                      state.status !== 'ready' && (
                        <Badge tone="blue">
                          In progress
                        </Badge>
                      )}
                  </div>
                </div>
              </Card>
            )
          })}
        </div>

        {/* Next */}

        <div className="flex justify-end mt-8">
          <Button
            size="lg"
            disabled={!allReady}
            onClick={() =>
              navigate(
                '/forms/jee-main/application'
              )
            }
          >
            Next
          </Button>
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* Vault permission modal */}
        {/* ---------------------------------------------------------------- */}

        <Modal
          open={!!permissionDoc}
          onClose={() =>
            setPermissionDoc(null)
          }
          title="Allow document access"
          footer={
            <>
              <Button
                variant="secondary"
                onClick={() =>
                  setPermissionDoc(null)
                }
              >
                Cancel
              </Button>

              <Button
                onClick={() => {
                  if (!permissionDoc) return

                  grantPermission(
                    permissionDoc.key
                  )

                  setPermissionDoc(null)
                }}
              >
                Allow
              </Button>
            </>
          }
        >
          <p className="text-sm text-ink-soft leading-6">
            Allow FormFiller to use your{' '}
            <span className="font-medium text-ink">
              {permissionDoc?.label}
            </span>{' '}
            for this JEE Main application?
          </p>

          <p className="text-xs text-ink-faint mt-2">
            It will only be used for this
            application.
          </p>
        </Modal>

        {/* ---------------------------------------------------------------- */}
        {/* Document preview modal */}
        {/* ---------------------------------------------------------------- */}

        <Modal
          open={!!previewDoc}
          onClose={() =>
            setPreviewDoc(null)
          }
          title={
            previewDoc
              ? `${previewDoc.label} — Preview`
              : 'Document Preview'
          }
          width="max-w-3xl"
        >
          <DocumentPreview
            doc={previewDoc}
            state={
              previewDoc
                ? docState[previewDoc.key]
                : null
            }
          />
        </Modal>
      </div>
    </ApplicantShell>
  )
}

/*
|--------------------------------------------------------------------------
| Status dot
|--------------------------------------------------------------------------
*/

function StatusDot({ status }) {
  const color =
    status === 'ready'
      ? 'bg-success'
      : status === 'not_uploaded'
        ? 'bg-ink-faint'
        : 'bg-brand-500 animate-pulse'

  return (
    <span
      className={`w-1.5 h-1.5 rounded-full ${color}`}
    />
  )
}

/*
|--------------------------------------------------------------------------
| Document Preview
|--------------------------------------------------------------------------
*/

function DocumentPreview({ doc, state }) {
  if (!doc || !state) {
    return null
  }

  const file = state.file
  const previewUrl = state.previewUrl

  const isPdf =
    file?.type === 'application/pdf'

  const isImage =
    file?.type?.startsWith('image/')

  /*
  |--------------------------------------------------------------------------
  | Direct uploaded PDF
  |--------------------------------------------------------------------------
  */

  if (previewUrl && isPdf) {
    return (
      <div>
        <div className="border border-line rounded-xl overflow-hidden bg-surface">
          <iframe
            src={previewUrl}
            title={doc.label}
            className="w-full h-[520px]"
          />
        </div>

        <PreviewDetails
          doc={doc}
          state={state}
        />
      </div>
    )
  }

  /*
  |--------------------------------------------------------------------------
  | Direct uploaded image
  |--------------------------------------------------------------------------
  */

  if (previewUrl && isImage) {
    return (
      <div>
        <div className="border border-line rounded-xl overflow-hidden bg-surface p-4">
          <div className="min-h-[420px] flex items-center justify-center">
            <img
              src={previewUrl}
              alt={doc.label}
              className="max-w-full max-h-[500px] object-contain rounded-lg"
            />
          </div>
        </div>

        <PreviewDetails
          doc={doc}
          state={state}
        />
      </div>
    )
  }

  /*
  |--------------------------------------------------------------------------
  | Vault document
  |--------------------------------------------------------------------------
  |
  | Currently Vault is mock data, so there is no real
  | file URL available yet.
  |
  | Later Supabase Storage URL will be shown here.
  |--------------------------------------------------------------------------
  */

  return (
    <div>
      <div className="border border-line rounded-xl bg-surface min-h-[420px] flex items-center justify-center p-8">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 rounded-2xl bg-brand-50 text-brand-500 flex items-center justify-center mx-auto">
            <svg
              className="w-7 h-7"
              viewBox="0 0 24 24"
              fill="none"
            >
              <path
                d="M6 3h8l4 4v14H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z"
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

              <path
                d="m8 16 2.2-2.2L12 15.5l2.2-2.5L16 15"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <h3 className="font-display text-lg font-semibold text-ink mt-5">
            Document selected from Vault
          </h3>

          <p className="text-sm text-ink-faint mt-2 leading-6">
            {doc.label} has been selected from
            your FormFiller Document Vault and is
            ready to be used for this application.
          </p>

          <div className="mt-5 inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-brand-50 text-brand-600 text-xs font-medium">
            <span>✓</span>
            Vault document
          </div>
        </div>
      </div>

      <PreviewDetails
        doc={doc}
        state={state}
      />
    </div>
  )
}

/*
|--------------------------------------------------------------------------
| Preview details
|--------------------------------------------------------------------------
*/

function PreviewDetails({ doc, state }) {
  return (
    <div className="mt-5">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <PreviewInfo
          label="Document"
          value={doc.label}
        />

        <PreviewInfo
          label="Source"
          value={
            state.source === 'vault'
              ? 'Document Vault'
              : 'Direct Upload'
          }
        />

        <PreviewInfo
          label="Status"
          value={
            STATUS_LABEL[state.status] ||
            'Ready'
          }
        />

        <PreviewInfo
          label="Type"
          value={
            state.file?.type ===
            'application/pdf'
              ? 'PDF'
              : state.file?.type?.startsWith(
                    'image/'
                  )
                ? 'Image'
                : 'Document'
          }
        />
      </div>

      <div className="mt-4 flex items-center gap-2 text-success text-sm">
        <span>✓</span>

        <span>
          Document is ready for JEE Main
          application
        </span>
      </div>
    </div>
  )
}

/*
|--------------------------------------------------------------------------
| Preview information box
|--------------------------------------------------------------------------
*/

function PreviewInfo({ label, value }) {
  return (
    <div className="rounded-lg border border-line bg-surface px-3 py-2.5">
      <p className="text-[11px] text-ink-faint">
        {label}
      </p>

      <p className="text-xs font-medium text-ink mt-1 truncate">
        {value}
      </p>
    </div>
  )
}