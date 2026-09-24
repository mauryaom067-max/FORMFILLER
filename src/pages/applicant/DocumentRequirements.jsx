import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ApplicantShell } from '../../components/layout/ApplicantShell'
import { Card, Button, Badge, ProgressSteps, Modal } from '../../components/ui'
import { jeeMainForm } from '../../lib/mockData'
import { useApp } from '../../lib/store'

const STEPS = ['Documents', 'Application', 'Payment', 'Processing', 'Review', 'Submitted']

const STATUS_LABEL = {
  idle: 'Available in Vault',
  not_uploaded: 'Not uploaded',
  uploading: 'Uploading\u2026',
  processing: 'Processing\u2026',
  extracting: 'Extracting details\u2026',
  validating: 'Validating\u2026',
  ready: 'Ready',
}

export default function DocumentRequirements() {
  const navigate = useNavigate()
  const { docState, grantPermission, uploadDocument } = useApp()
  const [permissionDoc, setPermissionDoc] = useState(null)
  const [previewDoc, setPreviewDoc] = useState(null)

  const allReady = jeeMainForm.documents.every((d) => docState[d.key].status === 'ready')

  return (
    <ApplicantShell title="JEE Main" subtitle="Step 1 of 6 \u00b7 Documents">
      <div className="max-w-content">
        <ProgressSteps steps={STEPS} current={0} />

        <h2 className="font-display text-2xl font-bold text-ink mt-8 mb-1">Documents required</h2>
        <p className="text-ink-faint text-sm mb-6">Nothing is used until you explicitly allow it below.</p>

        <div className="space-y-3">
          {jeeMainForm.documents.map((doc) => {
            const state = docState[doc.key]
            const isImage = doc.key === 'photo' || doc.key === 'signature'
            return (
              <Card key={doc.key} className="p-5">
                <div className="flex items-center justify-between gap-6">
                  <div className="flex items-start gap-3.5 min-w-0">
                    <div className="w-10 h-10 rounded-lg bg-brand-50 flex items-center justify-center shrink-0">
                      <svg className="w-4.5 h-4.5 text-brand-500" viewBox="0 0 16 16" fill="none">
                        <path d="M4 2h6l3 3v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-ink">{doc.label}</p>
                      <p className="text-xs text-ink-faint mt-1">{doc.hint}</p>
                      {state.permission && (
                        <p className="text-xs mt-1.5 flex items-center gap-1.5">
                          <StatusDot status={state.status} />
                          <span className="text-ink-soft">{STATUS_LABEL[state.status]}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {state.status === 'ready' && isImage && (
                      <Button size="sm" variant="secondary" onClick={() => setPreviewDoc(doc)}>Preview</Button>
                    )}
                    {!state.permission && doc.inVault && (
                      <Button size="sm" variant="secondary" onClick={() => setPermissionDoc(doc)}>Use from Vault</Button>
                    )}
                    {!state.permission && !doc.inVault && (
                      <Button size="sm" onClick={() => uploadDocument(doc.key)}>Upload Document</Button>
                    )}
                    {state.permission && state.status === 'ready' && <Badge tone="green">Ready</Badge>}
                    {state.permission && state.status !== 'ready' && <Badge tone="blue">In progress</Badge>}
                  </div>
                </div>
              </Card>
            )
          })}
        </div>

        <div className="flex justify-end mt-8">
          <Button size="lg" disabled={!allReady} onClick={() => navigate('/forms/jee-main/application')}>
            Next
          </Button>
        </div>

        <Modal
          open={!!permissionDoc}
          onClose={() => setPermissionDoc(null)}
          title="Allow document access"
          footer={
            <>
              <Button variant="secondary" onClick={() => setPermissionDoc(null)}>Cancel</Button>
              <Button onClick={() => { grantPermission(permissionDoc.key); setPermissionDoc(null) }}>Allow</Button>
            </>
          }
        >
          Allow FormFiller to use your <span className="font-medium text-ink">{permissionDoc?.label}</span> for this
          JEE Main application? It will only be used for this application.
        </Modal>

        <Modal
          open={!!previewDoc}
          onClose={() => setPreviewDoc(null)}
          title={`${previewDoc?.label} \u2014 processed`}
          width="max-w-lg"
        >
          <ImageBeforeAfter />
        </Modal>
      </div>
    </ApplicantShell>
  )
}

function StatusDot({ status }) {
  const color = status === 'ready' ? 'bg-success' : status === 'not_uploaded' ? 'bg-ink-faint' : 'bg-brand-500 animate-pulse'
  return <span className={`w-1.5 h-1.5 rounded-full ${color}`} />
}

function ImageBeforeAfter() {
  return (
    <div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="aspect-[3/4] bg-surface border border-line rounded-lg flex items-center justify-center text-ink-faint text-xs">
            Original
          </div>
          <p className="text-xs text-ink-faint mt-2 text-center">Original</p>
        </div>
        <div>
          <div className="aspect-[3/4] bg-brand-50 border border-brand-200 rounded-lg flex items-center justify-center text-brand-600 text-xs">
            Ready for JEE Main
          </div>
          <p className="text-xs text-ink-faint mt-2 text-center">Processed</p>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3 mt-5 text-center">
        <div>
          <p className="text-xs text-ink-faint">Format</p>
          <p className="text-sm font-medium text-ink mt-0.5">JPEG</p>
        </div>
        <div>
          <p className="text-xs text-ink-faint">Dimensions</p>
          <p className="text-sm font-medium text-ink mt-0.5">200 \u00d7 230 px</p>
        </div>
        <div>
          <p className="text-xs text-ink-faint">File size</p>
          <p className="text-sm font-medium text-ink mt-0.5">42 KB</p>
        </div>
      </div>
      <div className="mt-4 flex items-center gap-2 text-success text-sm">
        <span>&#10003;</span> Meets JEE Main requirements
      </div>
    </div>
  )
}
