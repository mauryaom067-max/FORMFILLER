import { useNavigate } from 'react-router-dom'
import { ApplicantShell } from '../../components/layout/ApplicantShell'
import { Card, Button, Input } from '../../components/ui'
import { applicant } from '../../lib/mockData'
import { useApp } from '../../lib/store'

export default function Profile() {
  const navigate = useNavigate()
  const { setRole } = useApp()

  return (
    <ApplicantShell title="Profile">
      <div className="max-w-content max-w-xl">
        <h2 className="font-display text-2xl font-bold text-ink mb-6">Profile</h2>

        <Card className="flex items-center gap-4 mb-6">
          <div className="w-14 h-14 rounded-full bg-ink text-white flex items-center justify-center font-semibold text-lg">
            {applicant.avatarInitials}
          </div>
          <div>
            <p className="font-medium text-ink">{applicant.name}</p>
            <p className="text-sm text-ink-faint">Applicant since {applicant.joined}</p>
          </div>
        </Card>

        <Card>
          <h3 className="font-medium text-ink mb-4">Account details</h3>
          <div className="space-y-4">
            <Input label="Full name" defaultValue={applicant.name} />
            <Input label="Email" type="email" defaultValue={applicant.email} />
            <Input label="Phone" defaultValue={applicant.phone} hint="Masked for your privacy" locked />
          </div>
          <div className="flex justify-end mt-6">
            <Button>Save changes</Button>
          </div>
        </Card>

        <Card className="mt-6">
          <h3 className="font-medium text-ink mb-1">Log out</h3>
          <p className="text-sm text-ink-faint mb-4">You\u2019ll need to log in again to access your applications.</p>
          <Button variant="secondary" onClick={() => { setRole(null); navigate('/') }}>Log out</Button>
        </Card>
      </div>
    </ApplicantShell>
  )
}
