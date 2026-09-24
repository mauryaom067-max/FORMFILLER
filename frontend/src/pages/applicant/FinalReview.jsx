import { useState } from 'react'
import { ApplicantShell } from '../../components/layout/ApplicantShell'
import { Card, Button, Badge, Modal, ProgressSteps } from '../../components/ui'
import { Chat } from '../../components/Chat'
import { extractedFields, vaultDocuments } from '../../lib/mockData'
import { useApp } from '../../lib/store'

const STEPS = ['Documents', 'Application', 'Payment', 'Processing', 'Review', 'Submitted']

export default function FinalReview() {
  const { reviewApproved, setReviewApproved, correctionRequested, requestCorrection, chatMessages, addChatMessage } = useApp()
  const [chatOpen, setChatOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [correctionText, setCorrectionText] = useState('')
  const [submitted, setSubmitted] = useState(false)

  function sendCorrection() {
    if (!correctionText.trim()) return
    requestCorrection(correctionText.trim())
    setCorrectionText('')
  }

  if (submitted) {
    return (
      <ApplicantShell title="JEE Main" subtitle="Step 6 of 6 \u00b7 Submitted">
        <div className="max-w-content max-w-xl">
          <ProgressSteps steps={STEPS} current={5} />
          <Card className="mt-8 text-center py-14">
            <div className="w-12 h-12 rounded-full bg-success-bg text-success flex items-center justify-center mx-auto mb-4 text-xl">
              &#10003;
            </div>
            <h2 className="font-display text-xl font-bold text-ink">Application submitted successfully</h2>
            <p className="text-sm text-ink-faint mt-2">Your JEE Main application (APP-10432) has been submitted by your operator.</p>
          </Card>
        </div>
      </ApplicantShell>
    )
  }

  return (
    <ApplicantShell title="JEE Main" subtitle="Step 5 of 6 \u00b7 Final review">
      <div className="max-w-content">
        <ProgressSteps steps={STEPS} current={4} />

        <div className="flex items-center justify-between mt-8 mb-1">
          <h2 className="font-display text-2xl font-bold text-ink">Your application is ready for final review</h2>
        </div>
        <p className="text-ink-faint text-sm mb-6">Check every section carefully before approving.</p>

        {correctionRequested && (
          <div className="mb-6 flex items-center gap-2.5 bg-warning-bg text-warning text-sm px-4 py-3 rounded-card">
            <span className="w-1.5 h-1.5 rounded-full bg-warning" /> Correction requested \u2014 an updated review will appear here shortly.
          </div>
        )}

        {reviewApproved && (
          <div className="mb-6 flex items-center gap-2.5 bg-success-bg text-success text-sm px-4 py-3 rounded-card">
            <span className="w-1.5 h-1.5 rounded-full bg-success" /> Review complete. Ready for final submission.
          </div>
        )}

        <div className="space-y-4">
          <ReviewSection title="Personal Details">
            {extractedFields.locked.slice(0, 3).map((f) => <FieldRow key={f.label} label={f.label} value={f.value} />)}
          </ReviewSection>
          <ReviewSection title="Academic Details">
            <FieldRow label="10th Marksheet" value="94.2% \u00b7 CBSE Board" />
            <FieldRow label="School" value="Delhi Public School, Ghaziabad" />
          </ReviewSection>
          <ReviewSection title="Application Details">
            {extractedFields.editable.map((f) => <FieldRow key={f.label} label={f.label} value={f.value} />)}
          </ReviewSection>
          <ReviewSection title="Uploaded Documents">
            <div className="grid sm:grid-cols-2 gap-3">
              {vaultDocuments.slice(0, 3).map((d) => (
                <div key={d.id} className="flex items-center justify-between border border-line rounded-lg px-4 py-3">
                  <span className="text-sm text-ink">{d.label}</span>
                  <Badge tone="green">Verified</Badge>
                </div>
              ))}
            </div>
          </ReviewSection>
          <ReviewSection title="Photograph & Signature">
            <div className="grid grid-cols-2 gap-4 max-w-xs">
              <div className="aspect-[3/4] bg-brand-50 border border-brand-200 rounded-lg flex items-center justify-center text-brand-600 text-xs">Photo</div>
              <div className="aspect-[3/4] bg-brand-50 border border-brand-200 rounded-lg flex items-center justify-center text-brand-600 text-xs">Signature</div>
            </div>
          </ReviewSection>
        </div>

        <div className="flex items-center justify-between mt-8 sticky bottom-0 bg-surface py-4">
          <Button variant="ghost" onClick={() => setChatOpen(true)}>Open chat with operator</Button>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setChatOpen(true)}>Report an Error</Button>
            <Button size="lg" disabled={correctionRequested} onClick={() => { setReviewApproved(true); setConfirmOpen(true) }}>
              Everything is Correct
            </Button>
          </div>
        </div>

        <Modal
          open={confirmOpen}
          onClose={() => setConfirmOpen(false)}
          title="Approve & submit"
          footer={
            <>
              <Button variant="secondary" onClick={() => setConfirmOpen(false)}>Cancel</Button>
              <Button onClick={() => { setConfirmOpen(false); setSubmitted(true) }}>Approve & Submit</Button>
            </>
          }
        >
          Please confirm that you have reviewed your application and the information is correct. Once approved, your operator will complete the final submission.
        </Modal>

        <Modal open={chatOpen} onClose={() => setChatOpen(false)} title="Report an error" width="max-w-lg">
          <div className="h-96 -m-6 border-t border-line">
            <Chat
              messages={chatMessages}
              onSend={(t) => sendCorrectionFromChat(t)}
              selfRole="applicant"
              otherName="Priya Sharma \u00b7 Operator"
              quickReplies={["Father's name is incorrect.", 'My address needs to be updated.']}
            />
          </div>
        </Modal>
      </div>
    </ApplicantShell>
  )

  function sendCorrectionFromChat(text) {
    requestCorrection(text)
  }
}

function ReviewSection({ title, children }) {
  return (
    <Card>
      <h3 className="font-medium text-ink mb-4">{title}</h3>
      <div className="space-y-3">{children}</div>
    </Card>
  )
}

function FieldRow({ label, value }) {
  return (
    <div className="flex items-center justify-between text-sm border-b border-line/70 last:border-0 pb-3 last:pb-0">
      <span className="text-ink-faint">{label}</span>
      <span className="text-ink font-medium">{value}</span>
    </div>
  )
}
