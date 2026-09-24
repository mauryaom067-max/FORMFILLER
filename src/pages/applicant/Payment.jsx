import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ApplicantShell } from '../../components/layout/ApplicantShell'
import { Card, Button, ProgressSteps, Badge } from '../../components/ui'
import { jeeMainForm } from '../../lib/mockData'

const STEPS = ['Documents', 'Application', 'Payment', 'Processing', 'Review', 'Submitted']

export default function Payment() {
  const navigate = useNavigate()
  const [paid, setPaid] = useState(false)
  const [processing, setProcessing] = useState(false)

  function pay() {
    setProcessing(true)
    setTimeout(() => {
      setProcessing(false)
      setPaid(true)
    }, 1200)
  }

  return (
    <ApplicantShell title="JEE Main" subtitle="Step 3 of 6 \u00b7 Payment">
      <div className="max-w-content max-w-xl">
        <ProgressSteps steps={STEPS} current={2} />

        {!paid ? (
          <>
            <h2 className="font-display text-2xl font-bold text-ink mt-8 mb-6">Payment</h2>
            <Card>
              <div className="space-y-3 text-sm">
                <Row label="Application Fee" value={`\u20b9${jeeMainForm.fee.toLocaleString('en-IN')}`} />
                <Row label="FormFiller Service Fee" value={`\u20b9${jeeMainForm.serviceFee.toLocaleString('en-IN')}`} />
                <div className="h-px bg-line my-1" />
                <Row label="Total" value={`\u20b9${(jeeMainForm.fee + jeeMainForm.serviceFee).toLocaleString('en-IN')}`} bold />
              </div>
            </Card>
            <Card className="mt-4">
              <SectionRadio label="UPI" defaultChecked />
              <SectionRadio label="Debit / Credit Card" />
              <SectionRadio label="Net Banking" />
            </Card>
            <div className="flex justify-between mt-8">
              <Button variant="secondary" onClick={() => navigate('/forms/jee-main/application')}>Back</Button>
              <Button size="lg" onClick={pay} disabled={processing}>
                {processing ? 'Processing payment\u2026' : `Pay \u20b9${(jeeMainForm.fee + jeeMainForm.serviceFee).toLocaleString('en-IN')}`}
              </Button>
            </div>
          </>
        ) : (
          <Card className="mt-8 text-center py-12">
            <div className="w-12 h-12 rounded-full bg-success-bg text-success flex items-center justify-center mx-auto mb-4 text-xl">
              &#10003;
            </div>
            <h2 className="font-display text-xl font-bold text-ink">Payment successful</h2>
            <p className="text-sm text-ink-faint mt-2">Your application is moving to processing.</p>
            <Badge tone="green" className="mt-4">Paid</Badge>
            <div className="mt-8">
              <Button size="lg" onClick={() => navigate('/forms/jee-main/processing')}>Continue</Button>
            </div>
          </Card>
        )}
      </div>
    </ApplicantShell>
  )
}

function Row({ label, value, bold }) {
  return (
    <div className="flex items-center justify-between">
      <span className={bold ? 'font-medium text-ink' : 'text-ink-soft'}>{label}</span>
      <span className={bold ? 'font-display font-bold text-ink text-lg' : 'text-ink font-medium'}>{value}</span>
    </div>
  )
}

function SectionRadio({ label, defaultChecked }) {
  return (
    <label className="flex items-center gap-3 py-2.5 cursor-pointer">
      <input type="radio" name="pay" defaultChecked={defaultChecked} className="w-4 h-4 text-brand-500 focus:ring-brand-200" />
      <span className="text-sm text-ink">{label}</span>
    </label>
  )
}
