import {
  useState,
} from 'react'

import {
  Link,
  useNavigate,
} from 'react-router-dom'

import {
  PublicHeader,
} from '../../components/layout/PublicChrome'

import {
  Button,
  Input,
  Card,
} from '../../components/ui'

import {
  useApp,
} from '../../lib/store'

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  'http://localhost:5000'

export default function Login() {
  const navigate =
    useNavigate()

  const {
    setRole,
    setAuthSession,
  } = useApp()

  const [
    email,
    setEmail,
  ] = useState(
    'test@formfiller.com'
  )

  const [
    password,
    setPassword,
  ] = useState('')

  const [
    loading,
    setLoading,
  ] = useState(false)

  const [
    error,
    setError,
  ] = useState('')

  async function handleSubmit(
    event
  ) {
    event.preventDefault()

    setError('')

    if (!email.trim()) {
      setError(
        'Email is required.'
      )

      return
    }

    if (!password) {
      setError(
        'Password is required.'
      )

      return
    }

    try {
      setLoading(true)

      // ==================================================
      // REAL BACKEND LOGIN
      // ==================================================

      const response =
        await fetch(
          `${API_BASE_URL}/api/auth/login`,
          {
            method: 'POST',

            headers: {
              'Content-Type':
                'application/json',
            },

            body: JSON.stringify({
              email:
                email.trim(),
              password,
            }),
          }
        )

      const data =
        await response.json()

      if (!response.ok) {
        throw new Error(
          data?.message ||
            'Login failed.'
        )
      }

      // ==================================================
      // VERIFY SESSION
      // ==================================================

      if (
        !data?.session
          ?.access_token
      ) {
        throw new Error(
          'Login succeeded but no authentication token was returned.'
        )
      }

      // ==================================================
      // SAVE SESSION
      // ==================================================

      setAuthSession({
        user: data.user,
        profile:
          data.profile ||
          null,
        session:
          data.session,
      })

      setRole(
        data?.profile?.role ||
          'applicant'
      )

      // ==================================================
      // GO TO DASHBOARD
      // ==================================================

      navigate(
        '/dashboard',
        {
          replace: true,
        }
      )
    } catch (err) {
      console.error(
        'Login error:',
        err
      )

      setError(
        err?.message ||
          'Unable to login. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">

      <PublicHeader />

      <div className="flex-1 flex items-center justify-center px-6 py-16">

        <Card className="w-full max-w-sm p-8">

          <h1 className="font-display text-2xl font-bold text-ink">
            Log in
          </h1>

          <p className="text-sm text-ink-faint mt-1.5 mb-7">
            Welcome back to FormFiller.
          </p>

          {error && (
            <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
              <p className="text-sm text-red-700">
                {error}
              </p>
            </div>
          )}

          <form
            className="space-y-4"
            onSubmit={
              handleSubmit
            }
          >

            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(
                event
              ) =>
                setEmail(
                  event.target.value
                )
              }
              required
              disabled={loading}
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(
                event
              ) =>
                setPassword(
                  event.target.value
                )
              }
              required
              disabled={loading}
            />

            <div className="flex justify-end">

              <Link
                to="/forgot-password"
                className="text-xs text-brand-600 hover:text-brand-700"
              >
                Forgot password?
              </Link>

            </div>

            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={loading}
            >
              {loading
                ? 'Logging in...'
                : 'Log in'}
            </Button>

          </form>

          <p className="text-sm text-ink-faint mt-6 text-center">

            New to FormFiller?

            {' '}

            <Link
              to="/signup"
              className="text-brand-600 font-medium hover:text-brand-700"
            >
              Create an account
            </Link>

          </p>

        </Card>

      </div>

    </div>
  )
}