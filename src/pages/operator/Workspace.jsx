import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { OperatorShell } from '../../components/layout/OperatorShell'
import { Card, Button, Badge } from '../../components/ui'
import { Chat } from '../../components/Chat'
import { applicantDataPanel } from '../../lib/mockData'
import { useApp } from '../../lib/store'

export default function OperatorWorkspace() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { chatMessages, addChatMessage, operatorSentForReview, setOperatorSentForReview, livePhotoState, setLivePhotoState } = useApp()
  const [reviewState, setReviewState] = useState('working') // working -> sent -> waiting -> approved -> submitted

  function sendForReview() {
    setReviewState('sent')
    setOperatorSentForReview(true)
    addChatMessage({ from: 'system', text: 'Final review ready', tone: 'blue' })
    setTimeout(() => setReviewState('waiting'), 400)
  }

  function simulateApplicantApproved() {
    setReviewState('approved')
    addChatMessage({ from: 'system', text: 'Applicant approved final application', tone: 'blue' })
  }

  function finalSubmit() {
    setReviewState('submitted')
    addChatMessage({ from: 'system', text: 'Application submitted', tone: 'blue' })
  }

  return (
    <OperatorShell title={`Application ${id}`} subtitle="JEE Main \u00b7 Ishaan Verma">
      <div className="grid grid-cols-[300px_1fr_320px] gap-5 h-[calc(100vh-8rem)] -m-2">
        <div className="overflow-y-auto p-2">
          <ApplicantDataPanel />
        </div>

        <div className="overflow-y-auto p-2 space-y-4">
          <FormWorkspace
            reviewState={reviewState}
            onSendForReview={sendForReview}
            onSimulateApproved={simulateApplicantApproved}
            onFinalSubmit={finalSubmit}
            livePhotoState={livePhotoState}
            setLivePhotoState={setLivePhotoState}
          />
        </div>

        <Card padded={false} className="overflow-hidden flex flex-col">
          <Chat
            messages={chatMessages}
            onSend={(t) => addChatMessage({ from: 'operator', text: t })}
            selfRole="operator"
            otherName="Ishaan Verma \u00b7 Applicant"
            quickReplies={['Please share your OTP', 'Live photograph required', 'Could you confirm your address?']}
          />
        </Card>
      </div>
    </OperatorShell>
  )
}

function ApplicantDataPanel() {
  const [copied, setCopied] = useState(null)
  const fields = [
    ['Name', applicantDataPanel.name],
    ['Date of Birth', applicantDataPanel.dob],
    ["Father's Name", applicantDataPanel.father],
    ['Gender', applicantDataPanel.gender],
    ['Aadhaar', applicantDataPanel.aadhaar],
    ['Address', applicantDataPanel.address],
    ['Category', applicantDataPanel.category],
    ['School', applicantDataPanel.school],
    ['10th Marks', applicantDataPanel.marks10],
    ['Exam City 1', applicantDataPanel.city1],
    ['Exam City 2', applicantDataPanel.city2],
  ]

  function copy(label, value) {
    navigator.clipboard?.writeText(value).catch(() => {})
    setCopied(label)
    setTimeout(() => setCopied(null), 1200)
  }

  return (
    <Card className="h-full">
      <h3 className="font-medium text-ink mb-1">Applicant data</h3>
      <p className="text-xs text-ink-faint mb-4">Assisted copy \u2014 paste into the official form yourself.</p>
      <div className="space-y-3">
        {fields.map(([label, value]) => (
          <div key={label} className="border border-line rounded-lg px-3.5 py-2.5">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs text-ink-faint">{label}</p>
              <button
                onClick={() => copy(label, value)}
                className="text-[11px] font-medium text-brand-600 hover:text-brand-700 shrink-0"
              >
                {copied === label ? 'Copied' : 'Copy'}
              </button>
            </div>
            <p className="text-sm text-ink font-medium mt-0.5 break-words">{value}</p>
          </div>
        ))}
      </div>
    </Card>
  )
}

function FormWorkspace({ reviewState, onSendForReview, onSimulateApproved, onFinalSubmit, livePhotoState, setLivePhotoState }) {
  return (
    <>
      <Card padded={false}>
        <div className="flex items-center justify-between px-5 py-3 border-b border-line bg-surface rounded-t-card">
          <div className="flex items-center gap-2 text-xs text-ink-faint">
            <span className="w-2.5 h-2.5 rounded-full bg-danger/60" />
            <span className="w-2.5 h-2.5 rounded-full bg-warning/60" />
            <span className="w-2.5 h-2.5 rounded-full bg-success/60" />
            <span className="ml-3 mono-data">jeemain.nta.nic.in/application</span>
          </div>
          <Badge tone="gray">Official form workspace</Badge>
        </div>
        <div className="p-6 min-h-[360px] bg-white">
          <p className="text-xs text-ink-faint mb-4">This area represents the official government application form, opened by the operator to complete manually using the applicant data on the left.</p>
          <div className="space-y-4 max-w-md">
            {['Full Name', 'Date of Birth', "Father's Name", 'Aadhaar Number'].map((f) => (
              <div key={f}>
                <p className="text-xs text-ink-faint mb-1">{f}</p>
                <div className="border border-line rounded-lg px-3 py-2 text-sm text-ink bg-surface">Pasted from applicant data</div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      <LivePhotoOperatorFlow state={livePhotoState} setState={setLivePhotoState} />

      <Card>
        <h3 className="font-medium text-ink mb-1">Final review</h3>
        {reviewState === 'working' && (
          <>
            <p className="text-sm text-ink-faint mb-4">Once the official form is complete, send it to the applicant for their review.</p>
            <Button onClick={onSendForReview}>Send for Applicant Review</Button>
          </>
        )}
        {reviewState === 'sent' && <p className="text-sm text-ink-faint">Sending\u2026</p>}
        {reviewState === 'waiting' && (
          <>
            <Badge tone="amber">Waiting for Applicant Approval</Badge>
            <p className="text-sm text-ink-faint mt-3">You cannot submit until the applicant approves the reviewed application.</p>
            <Button className="mt-4" variant="secondary" size="sm" onClick={onSimulateApproved}>
              Simulate: applicant approved
            </Button>
          </>
        )}
        {reviewState === 'approved' && (
          <>
            <Badge tone="green">Applicant Approved Final Application</Badge>
            <p className="text-sm text-ink-faint mt-3">You can now complete the final submission on the official portal.</p>
            <Button className="mt-4" onClick={onFinalSubmit}>Final Submit</Button>
          </>
        )}
        {reviewState === 'submitted' && (
          <div className="flex items-center gap-2 text-success text-sm">
            <span>&#10003;</span> Application submitted successfully.
          </div>
        )}
      </Card>
    </>
  )
}

function LivePhotoOperatorFlow({ state, setState }) {
  return (
    <Card>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-medium text-ink">Live photograph</h3>
        {state === 'idle' && <Badge tone="gray">Not requested</Badge>}
        {state === 'qr' && <Badge tone="blue">QR generated</Badge>}
        {state === 'waiting' && <Badge tone="amber">Waiting for applicant</Badge>}
        {state === 'received' && <Badge tone="green">Photo received</Badge>}
      </div>
      {state === 'idle' && (
        <Button size="sm" variant="secondary" onClick={() => setState('qr')}>Generate QR Code</Button>
      )}
      {state === 'qr' && (
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 bg-surface border border-line rounded-lg grid grid-cols-4 grid-rows-4 gap-0.5 p-1.5 shrink-0">
            {Array.from({ length: 16 }).map((_, i) => (
              <div key={i} className={`${(i * 5) % 3 === 0 ? 'bg-ink' : 'bg-transparent'} rounded-[1px]`} />
            ))}
          </div>
          <Button size="sm" onClick={() => setState('waiting')}>Share QR with Applicant</Button>
        </div>
      )}
      {state === 'waiting' && (
        <div className="flex items-center gap-2 text-sm text-ink-faint">
          <span className="w-1.5 h-1.5 rounded-full bg-warning animate-pulse" /> Waiting for applicant photo\u2026
          <Button size="sm" variant="secondary" className="ml-auto" onClick={() => setState('received')}>Simulate received</Button>
        </div>
      )}
      {state === 'received' && (
        <div className="flex items-center gap-2 text-success text-sm">
          <span>&#10003;</span> Photo received and attached to the application.
        </div>
      )}
    </Card>
  )
}
