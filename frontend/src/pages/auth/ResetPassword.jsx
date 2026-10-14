import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { PublicHeader } from '../../components/layout/PublicChrome'
import {
  Button,
  Input,
  Card,
} from '../../components/ui'

import { supabase } from '../../lib/supabase'


export default function ResetPassword() {
  const navigate = useNavigate()

  const [password, setPassword] =
    useState('')

  const [confirmPassword, setConfirmPassword] =
    useState('')

  const [loading, setLoading] =
    useState(false)

  const [checking, setChecking] =
    useState(true)

  const [error, setError] =
    useState('')

  const [success, setSuccess] =
    useState(false)


  // =====================================================
  // CHECK PASSWORD RECOVERY SESSION
  // =====================================================

  useEffect(() => {
    let mounted = true

    async function checkRecoverySession() {
      try {
        const {
          data,
          error,
        } = await supabase.auth.getSession()

        if (error) {
          throw error
        }

        if (!mounted) {
          return
        }

        /*
         * Supabase password recovery link creates
         * a temporary recovery session.
         */

        if (!data?.session) {
          setError(
            'This password reset link is invalid or has expired.'
          )
        }

      } catch (error) {
        console.error(
          'Recovery session error:',
          error
        )

        if (mounted) {
          setError(
            error?.message ||
            'Unable to verify password reset session.'
          )
        }

      } finally {
        if (mounted) {
          setChecking(false)
        }
      }
    }

    checkRecoverySession()

    return () => {
      mounted = false
    }
  }, [])


  // =====================================================
  // UPDATE PASSWORD
  // =====================================================

  async function handleSubmit(e) {
    e.preventDefault()

    setError('')

    if (!password || !confirmPassword) {
      setError(
        'Please enter your new password.'
      )

      return
    }

    if (password.length < 6) {
      setError(
        'Password must be at least 6 characters.'
      )

      return
    }

    if (password !== confirmPassword) {
      setError(
        'Passwords do not match.'
      )

      return
    }

    try {
      setLoading(true)

      const {
        error: updateError,
      } =
        await supabase.auth.updateUser({
          password,
        })

      if (updateError) {
        throw updateError
      }

      setSuccess(true)

    } catch (error) {
      console.error(
        'Password update error:',
        error
      )

      setError(
        error?.message ||
        'Unable to update password.'
      )

    } finally {
      setLoading(false)
    }
  }


  // =====================================================
  // CHECKING
  // =====================================================

  if (checking) {
    return (
      <div className="min-h-screen bg-white flex flex-col">

        <PublicHeader />

        <div className="flex-1 flex items-center justify-center px-6">

          <Card className="w-full max-w-sm p-8 text-center">

            <div className="w-10 h-10 border-4 border-brand-200 border-t-brand-500 rounded-full animate-spin mx-auto" />

            <p className="text-sm text-ink-faint mt-4">
              Verifying password reset link...
            </p>

          </Card>

        </div>

      </div>
    )
  }


  // =====================================================
  // SUCCESS
  // =====================================================

  if (success) {
    return (
      <div className="min-h-screen bg-white flex flex-col">

        <PublicHeader />

        <div className="flex-1 flex items-center justify-center px-6 py-16">

          <Card className="w-full max-w-sm p-8">

            <div className="text-center py-4">

              <div className="w-12 h-12 rounded-full bg-success-bg text-success flex items-center justify-center mx-auto mb-4 text-xl">
                &#10003;
              </div>

              <h1 className="font-display text-xl font-bold text-ink">
                Password updated
              </h1>

              <p className="text-sm text-ink-faint mt-2">
                Your FormFiller password has been changed successfully.
              </p>

              <Button
                className="w-full mt-6"
                size="lg"
                onClick={() =>
                  navigate('/login')
                }
              >
                Go to login
              </Button>

            </div>

          </Card>

        </div>

      </div>
    )
  }


  // =====================================================
  // RESET FORM
  // =====================================================

  return (
    <div className="min-h-screen bg-white flex flex-col">

      <PublicHeader />

      <div className="flex-1 flex items-center justify-center px-6 py-16">

        <Card className="w-full max-w-sm p-8">

          <h1 className="font-display text-2xl font-bold text-ink">
            Create new password
          </h1>

          <p className="text-sm text-ink-faint mt-1.5 mb-7">
            Enter a new password for your FormFiller account.
          </p>


          {/* ERROR */}

          {error && (
            <div className="mb-5 rounded-lg border border-danger/20 bg-danger-bg px-4 py-3">

              <p className="text-sm text-danger">
                {error}
              </p>

            </div>
          )}


          <form
            className="space-y-4"
            onSubmit={handleSubmit}
          >

            <Input
              label="New password"
              type="password"
              placeholder="Enter new password"
              value={password}
              onChange={(e) =>
                setPassword(
                  e.target.value
                )
              }
              autoComplete="new-password"
              required
            />


            <Input
              label="Confirm password"
              type="password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) =>
                setConfirmPassword(
                  e.target.value
                )
              }
              autoComplete="new-password"
              required
            />


            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={loading}
            >
              {loading
                ? 'Updating password...'
                : 'Update password'}
            </Button>

          </form>


          <p className="text-sm text-ink-faint mt-6 text-center">

            <Link
              to="/login"
              className="text-brand-600 font-medium hover:text-brand-700"
            >
              Back to log in
            </Link>

          </p>

        </Card>

      </div>

    </div>
  )
}