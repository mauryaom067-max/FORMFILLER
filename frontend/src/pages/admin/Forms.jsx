import { AdminShell } from '../../components/layout/AdminShell'
import { Card, Badge, Button } from '../../components/ui'

export default function AdminForms() {
  return (
    <AdminShell title="Forms">
      <div className="max-w-content">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-2xl font-bold text-ink">Forms</h2>
          <Button variant="secondary" disabled>Add form</Button>
        </div>

        <Card className="p-7">
          <div className="flex items-center gap-3 mb-5">
            <h3 className="font-display text-lg font-semibold text-ink">JEE Main</h3>
            <Badge tone="blue">Live</Badge>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-6">
            {[
              ['Applications', '5,931'],
              ['Processing', '842'],
              ['Completed', '4,102'],
              ['Review', '312'],
              ['Correction Required', '58'],
            ].map(([label, value]) => (
              <div key={label}>
                <p className="text-2xl font-display font-bold text-ink">{value}</p>
                <p className="text-xs text-ink-faint mt-1">{label}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card className="mt-6 p-7 opacity-60">
          <div className="flex items-center gap-3">
            <h3 className="font-display text-lg font-semibold text-ink-faint">Add another form</h3>
            <Badge tone="gray">Coming soon</Badge>
          </div>
          <p className="text-sm text-ink-faint mt-2 max-w-lg">
            New forms can be configured here with their own document requirements and processing rules.
          </p>
        </Card>
      </div>
    </AdminShell>
  )
}
