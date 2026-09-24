import { Link, useNavigate } from 'react-router-dom'
import { PublicHeader } from '../../components/layout/PublicChrome'
import { Button, Input, Card } from '../../components/ui'
import { useApp } from '../../lib/store'

export default function Login() {
  const navigate = useNavigate()
  const { setRole } = useApp()

  function handleSubmit(e) {
    e.preventDefault()
    setRole('applicant')
    navigate('/dashboard')
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <PublicHeader />
      <div className="flex-1 flex items-center justify-center px-6 py-16">
        <Card className="w-full max-w-sm p-8">
          <h1 className="font-display text-2xl font-bold text-ink">Log in</h1>
          <p className="text-sm text-ink-faint mt-1.5 mb-7">Welcome back to FormFiller.</p>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <Input label="Email" type="email" placeholder="you@example.com" defaultValue="ishaan.verma@gmail.com" required />
            <Input label="Password" type="password" placeholder="\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022" defaultValue="password123" required />
            <div className="flex justify-end">
              <Link to="/forgot-password" className="text-xs text-brand-600 hover:text-brand-700">Forgot password?</Link>
            </div>
            <Button type="submit" className="w-full" size="lg">Log in</Button>
          </form>
          <p className="text-sm text-ink-faint mt-6 text-center">
            New to FormFiller? <Link to="/signup" className="text-brand-600 font-medium hover:text-brand-700">Create an account</Link>
          </p>
        </Card>
      </div>
    </div>
  )
}
