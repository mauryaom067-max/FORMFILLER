import { useNavigate } from 'react-router-dom'
import { OperatorShell } from '../../components/layout/OperatorShell'
import { Card, Button, Input, Badge } from '../../components/ui'
import { operatorProfile, operatorStats } from '../../lib/mockData'
import { useApp } from '../../lib/store'

export default function OperatorProfile() {
  const navigate = useNavigate()
  const { setRole } = useApp()

  return (
    <OperatorShell title="Profile">
      <div className="max-w-content max-w-xl">
        <h2 className="font-display text-2xl font-bold text-ink mb-6">Profile</h2>

        <Card className="flex items-center gap-4 mb-6">
          <div className="w-14 h-14 rounded-full bg-ink text-white flex items-center justify-center font-semibold text-lg">
            {operatorProfile.avatarInitials}
          </div>
          <div>
            <p className="font-medium text-ink">{operatorProfile.name}</p>
            <p className="text-sm text-ink-faint">{operatorProfile.email}</p>
          </div>
          <Badge tone="green" className="ml-auto">Active since {operatorStats.activeSince}</Badge>
        </Card>

        <Card>
          <h3 className="font-medium text-ink mb-4">Account details</h3>
          <div className="space-y-4">
            <Input label="Full name" defaultValue={operatorProfile.name} />
            <Input label="Work email" defaultValue={operatorProfile.email} locked hint="Managed by your admin" />
          </div>
          <div className="flex justify-end mt-6">
            <Button>Save changes</Button>
          </div>
        </Card>

        <Card className="mt-6">
          <h3 className="font-medium text-ink mb-1">Log out</h3>
          <p className="text-sm text-ink-faint mb-4">You\u2019ll be marked inactive and moved out of the assignment queue.</p>
          <Button variant="secondary" onClick={() => { setRole(null); navigate('/') }}>Log out</Button>
        </Card>
      </div>
    </OperatorShell>
  )
}
