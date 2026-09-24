import { useState } from 'react'
import { Link } from 'react-router-dom'
import { PublicHeader } from '../../components/layout/PublicChrome'
import { Button, Input, Card } from '../../components/ui'

export default function ForgotPassword() {
  const [sent, setSent] = useState(false)

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <PublicHeader />
      <div className="flex-1 flex items-center justify-center px-6 py-16">
        <Card className="w-full max-w-sm p-8">
          {!sent ? (
            <>
              <h1 className="font-display text-2xl font-bold text-ink">Reset your password</h1>
              <p className="text-sm text-ink-faint mt-1.5 mb-7">We\u2019ll email you a link to reset it.</p>
              <form
                className="space-y-4"
                onSubmit={(e) => { e.preventDefault(); setSent(true) }}
              >
                <Input label="Email" type="email" placeholder="you@example.com" defaultValue="ishaan.verma@gmail.com" required />
                <Button type="submit" className="w-full" size="lg">Send reset link</Button>
              </form>
            </>
          ) : (
            <div className="text-center py-4">
              <div className="w-11 h-11 rounded-full bg-success-bg text-success flex items-center justify-center mx-auto mb-4">
                &#10003;
              </div>
              <h1 className="font-display text-xl font-bold text-ink">Check your email</h1>
              <p className="text-sm text-ink-faint mt-2">
                If an account exists for that address, a reset link has been sent.
              </p>
            </div>
          )}
          <p className="text-sm text-ink-faint mt-6 text-center">
            <Link to="/login" className="text-brand-600 font-medium hover:text-brand-700">Back to log in</Link>
          </p>
        </Card>
      </div>
    </div>
  )
}
