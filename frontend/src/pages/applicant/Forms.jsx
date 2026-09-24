import { Link } from 'react-router-dom'
import { ApplicantShell } from '../../components/layout/ApplicantShell'
import { Card, Badge, Button } from '../../components/ui'

export default function Forms() {
  return (
    <ApplicantShell title="Fill New Form">
      <div className="max-w-content">
        <h2 className="font-display text-2xl font-bold text-ink mb-1">Exam forms</h2>
        <p className="text-ink-faint text-sm mb-6">More forms will be added over time.</p>

        <Card className="p-7 grid md:grid-cols-[1fr_auto] gap-8 items-center">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <h3 className="font-display text-xl font-semibold text-ink">JEE Main</h3>
              <Badge tone="blue">Live</Badge>
            </div>
            <p className="text-sm text-ink-soft max-w-lg">
              Joint Entrance Examination \u2014 Main, Session 2, 2027.
            </p>
            <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-lg text-sm">
              <div>
                <p className="text-ink-faint text-xs mb-1">Application</p>
                <p className="text-ink font-medium">Not started</p>
              </div>
              <div>
                <p className="text-ink-faint text-xs mb-1">Documents</p>
                <p className="text-ink font-medium">4 required</p>
              </div>
              <div>
                <p className="text-ink-faint text-xs mb-1">Processing</p>
                <p className="text-ink font-medium">Automatic</p>
              </div>
              <div>
                <p className="text-ink-faint text-xs mb-1">Status</p>
                <p className="text-ink font-medium">Ready to begin</p>
              </div>
            </div>
          </div>
          <Button as={Link} to="/forms/jee-main/documents" size="lg">Continue</Button>
        </Card>

        <Card className="mt-6 p-7 opacity-60">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="font-display text-xl font-semibold text-ink-faint">More forms</h3>
            <Badge tone="gray">Coming soon</Badge>
          </div>
          <p className="text-sm text-ink-faint max-w-lg">
            Additional exam and application forms will appear here as they become available.
          </p>
        </Card>
      </div>
    </ApplicantShell>
  )
}
