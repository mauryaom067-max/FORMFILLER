import { useNavigate } from 'react-router-dom'
import { ApplicantShell } from '../../components/layout/ApplicantShell'
import { Card, Button, ProgressSteps, Input, SectionLabel } from '../../components/ui'
import { extractedFields } from '../../lib/mockData'

const STEPS = ['Documents', 'Application', 'Payment', 'Processing', 'Review', 'Submitted']

export default function ApplicationForm() {
  const navigate = useNavigate()

  return (
    <ApplicantShell title="JEE Main" subtitle="Step 2 of 6 \u00b7 Application">
      <div className="max-w-content">
        <ProgressSteps steps={STEPS} current={1} />

        <h2 className="font-display text-2xl font-bold text-ink mt-8 mb-1">Application details</h2>
        <p className="text-ink-faint text-sm mb-6">Fields imported from your documents are locked for accuracy.</p>

        <Card>
          <SectionLabel>Imported from your verified documents</SectionLabel>
          <div className="grid sm:grid-cols-2 gap-5">
            {extractedFields.locked.map((f) => (
              <Input key={f.label} label={f.label} locked defaultValue={f.value} hint={`Imported from ${f.source}`} />
            ))}
          </div>

          <div className="h-px bg-line my-7" />

          <SectionLabel>Additional details</SectionLabel>
          <div className="grid sm:grid-cols-2 gap-5">
            {extractedFields.editable.map((f) => (
              <Input key={f.label} label={f.label} defaultValue={f.value} />
            ))}
          </div>
        </Card>

        <div className="flex justify-between mt-8">
          <Button variant="secondary" onClick={() => navigate('/forms/jee-main/documents')}>Back</Button>
          <Button size="lg" onClick={() => navigate('/forms/jee-main/payment')}>Review & Continue</Button>
        </div>
      </div>
    </ApplicantShell>
  )
}
