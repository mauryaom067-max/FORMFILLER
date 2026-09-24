import { Link, useNavigate } from 'react-router-dom'
import { Logo, Button, Input, Card } from '../../components/ui'
import { useApp } from '../../lib/store'

export default function OperatorLogin() {
  const navigate = useNavigate()
  const { setRole } = useApp()

  function handleSubmit(e) {
    e.preventDefault()
    setRole('operator')
    navigate('/operator')
  }

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <div className="h-16 flex items-center px-8"><Link to="/"><Logo /></Link></div>
      <div className="flex-1 flex items-center justify-center px-6 pb-16">
        <Card className="w-full max-w-sm p-8">
          <p className="text-xs font-medium text-brand-600 mb-2">Operator access</p>
          <h1 className="font-display text-2xl font-bold text-ink">Operator log in</h1>
          <p className="text-sm text-ink-faint mt-1.5 mb-7">Access is provisioned by your FormFiller admin.</p>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <Input label="Work email" type="email" placeholder="you@formfiller.in" defaultValue="priya.sharma@formfiller.in" required />
            <Input label="Password" type="password" placeholder="\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022" defaultValue="password123" required />
            <Button type="submit" className="w-full" size="lg">Log in</Button>
          </form>
        </Card>
      </div>
    </div>
  )
}
