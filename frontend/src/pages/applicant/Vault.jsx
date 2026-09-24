import { useState } from 'react'
import { ApplicantShell } from '../../components/layout/ApplicantShell'
import { Card, Button, Badge, Modal } from '../../components/ui'
import { vaultDocuments } from '../../lib/mockData'

export default function Vault() {
  const [uploadOpen, setUploadOpen] = useState(false)

  return (
    <ApplicantShell title="Document Vault" subtitle="Stored privately. Used only with your permission.">
      <div className="max-w-content">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-display text-2xl font-bold text-ink">Your documents</h2>
            <p className="text-ink-faint mt-1 text-sm">Uploading here does not share a document with any application.</p>
          </div>
          <Button onClick={() => setUploadOpen(true)}>Upload document</Button>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {vaultDocuments.map((d) => (
            <Card key={d.id} className="p-5 flex items-start justify-between">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-lg bg-brand-50 flex items-center justify-center shrink-0">
                  <svg className="w-4.5 h-4.5 text-brand-500" viewBox="0 0 16 16" fill="none">
                    <path d="M4 2h6l3 3v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-ink">{d.label}</p>
                  <p className="text-xs text-ink-faint mt-1">{d.type} \u00b7 {d.size} \u00b7 Added {d.addedOn}</p>
                  {d.masked && <p className="text-xs text-ink-faint mt-1 mono-data">{d.masked}</p>}
                </div>
              </div>
              <Badge tone="gray">Not shared</Badge>
            </Card>
          ))}
        </div>

        <Modal
          open={uploadOpen}
          onClose={() => setUploadOpen(false)}
          title="Upload a document"
          footer={
            <>
              <Button variant="secondary" onClick={() => setUploadOpen(false)}>Cancel</Button>
              <Button onClick={() => setUploadOpen(false)}>Upload</Button>
            </>
          }
        >
          <div className="border-2 border-dashed border-line rounded-card p-8 text-center">
            <p className="text-sm text-ink-soft">Drag and drop a file, or click to browse</p>
            <p className="text-xs text-ink-faint mt-1">PDF, JPG or PNG \u00b7 up to 10 MB</p>
          </div>
          <p className="text-xs text-ink-faint mt-4">
            This document will stay private to your Vault until you grant an application access to it.
          </p>
        </Modal>
      </div>
    </ApplicantShell>
  )
}
