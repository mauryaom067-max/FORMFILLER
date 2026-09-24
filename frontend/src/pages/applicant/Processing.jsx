import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ApplicantShell } from '../../components/layout/ApplicantShell'
import { Card, Button, Timeline, Badge } from '../../components/ui'
import { Chat } from '../../components/Chat'
import { useApp } from '../../lib/store'

export default function Processing() {
  const navigate = useNavigate()
  const { timeline, chatMessages, addChatMessage } = useApp()
  const [photoStep, setPhotoStep] = useState('none') // none -> requested -> qr -> waiting -> received

  useEffect(() => {
    const t = setTimeout(() => {
      addChatMessage({ from: 'system', text: 'Live photograph required', tone: 'blue' })
      setPhotoStep('requested')
    }, 2500)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function handleSend(text) {
    addChatMessage({ from: 'applicant', text })
    if (/otp/i.test(text)) {
      setTimeout(() => addChatMessage({ from: 'operator', text: 'Sending an OTP request now \u2014 keep an eye on your phone.' }), 700)
    } else {
      setTimeout(() => addChatMessage({ from: 'operator', text: 'Noted, thanks for confirming.' }), 900)
    }
  }

  return (
    <ApplicantShell title="JEE Main" subtitle="Application in progress">
      <div className="max-w-content grid lg:grid-cols-[1fr_380px] gap-6 items-start">
        <div>
          <h2 className="font-display text-2xl font-bold text-ink mb-1">Application tracking</h2>
          <p className="text-ink-faint text-sm mb-6">APP-10432 \u00b7 Operator: Priya Sharma</p>

          <Card>
            <Timeline items={timeline} />
          </Card>

          {photoStep !== 'none' && (
            <Card className="mt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium text-ink">Live photograph required</h3>
                <Badge tone="blue">Action needed</Badge>
              </div>
              <LivePhotoFlow step={photoStep} setStep={setPhotoStep} onComplete={() => addChatMessage({ from: 'system', text: 'Photo received', tone: 'blue' })} />
            </Card>
          )}

          <div className="mt-6 flex justify-end">
            <Button variant="secondary" onClick={() => navigate('/forms/jee-main/review')}>
              View final review (demo)
            </Button>
          </div>
        </div>

        <Card padded={false} className="h-[560px] flex flex-col overflow-hidden sticky top-24">
          <Chat
            messages={chatMessages}
            onSend={handleSend}
            selfRole="applicant"
            otherName="Priya Sharma \u00b7 Operator"
            quickReplies={['Send my OTP', 'Any update?']}
          />
        </Card>
      </div>
    </ApplicantShell>
  )
}

function LivePhotoFlow({ step, setStep, onComplete }) {
  if (step === 'requested') {
    return (
      <div>
        <p className="text-sm text-ink-soft">Please keep your phone ready. You\u2019ll scan a QR code to take a live photograph.</p>
        <Button className="mt-4" onClick={() => setStep('qr')}>Show QR code</Button>
      </div>
    )
  }
  if (step === 'qr') {
    return (
      <div className="flex items-center gap-6">
        <div className="w-28 h-28 bg-surface border border-line rounded-lg grid grid-cols-4 grid-rows-4 gap-0.5 p-2 shrink-0">
          {Array.from({ length: 16 }).map((_, i) => (
            <div key={i} className={`${(i * 7) % 3 === 0 ? 'bg-ink' : 'bg-transparent'} rounded-[1px]`} />
          ))}
        </div>
        <div>
          <p className="text-sm text-ink-soft">Scan this QR code with your phone\u2019s camera to continue.</p>
          <Button className="mt-3" size="sm" onClick={() => setStep('camera')}>Simulate scan</Button>
        </div>
      </div>
    )
  }
  if (step === 'camera') {
    return (
      <div className="flex flex-col items-center py-4">
        <div className="w-40 h-52 bg-ink rounded-lg flex items-center justify-center text-white/60 text-xs mb-4">
          Camera preview
        </div>
        <Button onClick={() => setStep('captured')}>Capture photo</Button>
      </div>
    )
  }
  if (step === 'captured') {
    return (
      <div className="flex flex-col items-center py-4">
        <div className="w-40 h-52 bg-brand-50 border border-brand-200 rounded-lg flex items-center justify-center text-brand-600 text-xs mb-4">
          Preview captured
        </div>
        <Button onClick={() => { setStep('received'); onComplete() }}>Submit</Button>
      </div>
    )
  }
  if (step === 'received') {
    return (
      <div className="flex items-center gap-3 text-success text-sm py-2">
        <span className="text-lg">&#10003;</span> Photo received \u2014 no further action needed right now.
      </div>
    )
  }
  return null
}
