import { Link, useNavigate } from 'react-router-dom'
import { PublicHeader } from '../../components/layout/PublicChrome'
import { Button, Input, Card, Checkbox } from '../../components/ui'
import { useApp } from '../../lib/store'

export default function Signup() {
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
          <h1 className="font-display text-2xl font-bold text-ink">Create your account</h1>
          <p className="text-sm text-ink-faint mt-1.5 mb-7">Store your documents once, reuse them everywhere.</p>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <Input label="Full name" placeholder="As per your documents" defaultValue="Ishaan Verma" required />
            <Input label="Email" type="email" placeholder="you@example.com" defaultValue="ishaan.verma@gmail.com" required />
            <Input label="Mobile number" type="tel" placeholder="10-digit number" defaultValue="98XXXXXX21" required />
            <Input label="Password" type="password" placeholder="At least 8 characters" required />
            <Checkbox label={<>I agree to the <a className="text-brand-600" href="#">Terms</a> and <a className="text-brand-600" href="#">Privacy Policy</a></>} defaultChecked required />
            <Button type="submit" className="w-full" size="lg">Create account</Button>
          </form>
          <p className="text-sm text-ink-faint mt-6 text-center">
            Already have an account? <Link to="/login" className="text-brand-600 font-medium hover:text-brand-700">Log in</Link>
          </p>
        </Card>
      </div>
    </div>
  )
}
