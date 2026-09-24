import { createContext, useContext, useState, useCallback } from 'react'

import {
  jeeMainForm,
  applicationTimeline,
  initialChatMessages,
} from './mockData'

const AppCtx = createContext(null)

const initialDocState = Object.fromEntries(
  jeeMainForm.documents.map((d) => [
    d.key,
    {
      permission: false,
      status: d.inVault ? 'idle' : 'not_uploaded',

      // Document information
      file: null,
      previewUrl: null,

      // Where the document came from
      // 'vault' | 'upload' | null
      source: d.inVault ? 'vault' : null,
    },
  ])
)

export function AppProvider({ children }) {
  const [role, setRole] = useState(null)

  const [docState, setDocState] = useState(
    initialDocState
  )

  const [flowStep, setFlowStep] = useState(0)

  const [paymentStatus, setPaymentStatus] =
    useState('unpaid')

  const [timeline, setTimeline] =
    useState(applicationTimeline)

  const [chatMessages, setChatMessages] =
    useState(initialChatMessages)

  const [reviewApproved, setReviewApproved] =
    useState(false)

  const [correctionRequested, setCorrectionRequested] =
    useState(false)

  const [operatorSentForReview, setOperatorSentForReview] =
    useState(false)

  const [livePhotoState, setLivePhotoState] =
    useState('idle')

  /*
  |--------------------------------------------------------------------------
  | Grant permission to use document from Vault
  |--------------------------------------------------------------------------
  */

  const grantPermission = useCallback((key) => {
    setDocState((state) => ({
      ...state,

      [key]: {
        ...state[key],

        permission: true,
        status: 'uploading',

        source: 'vault',

        // Vault document will later receive
        // its real Supabase Storage URL.
        file: null,
        previewUrl: null,
      },
    }))

    setTimeout(() => {
      setDocState((state) => ({
        ...state,

        [key]: {
          ...state[key],
          status: 'processing',
        },
      }))
    }, 700)

    setTimeout(() => {
      setDocState((state) => ({
        ...state,

        [key]: {
          ...state[key],
          status: 'extracting',
        },
      }))
    }, 1600)

    setTimeout(() => {
      setDocState((state) => ({
        ...state,

        [key]: {
          ...state[key],
          status: 'ready',
        },
      }))
    }, 2500)
  }, [])

  /*
  |--------------------------------------------------------------------------
  | Upload document directly
  |--------------------------------------------------------------------------
  */

  const uploadDocument = useCallback(
    (key, file = null) => {
      const previewUrl = file
        ? URL.createObjectURL(file)
        : null

      setDocState((state) => ({
        ...state,

        [key]: {
          ...state[key],

          permission: true,
          status: 'uploading',

          file,
          previewUrl,

          source: 'upload',
        },
      }))

      setTimeout(() => {
        setDocState((state) => ({
          ...state,

          [key]: {
            ...state[key],
            status: 'processing',
          },
        }))
      }, 800)

      setTimeout(() => {
        setDocState((state) => ({
          ...state,

          [key]: {
            ...state[key],
            status: 'extracting',
          },
        }))
      }, 1800)

      setTimeout(() => {
        setDocState((state) => ({
          ...state,

          [key]: {
            ...state[key],
            status: 'ready',
          },
        }))
      }, 2800)
    },
    []
  )

  /*
  |--------------------------------------------------------------------------
  | Chat
  |--------------------------------------------------------------------------
  */

  const addChatMessage = useCallback((msg) => {
    setChatMessages((messages) => [
      ...messages,
      {
        id: messages.length + 1,
        time: 'Just now',
        ...msg,
      },
    ])
  }, [])

  /*
  |--------------------------------------------------------------------------
  | Correction request
  |--------------------------------------------------------------------------
  */

  const requestCorrection = useCallback(
    (text) => {
      setCorrectionRequested(true)
      setReviewApproved(false)

      addChatMessage({
        from: 'applicant',
        text,
      })

      setTimeout(() => {
        addChatMessage({
          from: 'system',
          text: 'Correction requested',
          tone: 'amber',
        })
      }, 500)

      setTimeout(() => {
        addChatMessage({
          from: 'operator',
          text:
            "Got it — I'll fix this and share an updated review shortly.",
        })
      }, 1400)

      setTimeout(() => {
        addChatMessage({
          from: 'system',
          text: 'Updated review available',
          tone: 'blue',
        })

        setCorrectionRequested(false)
      }, 3200)
    },
    [addChatMessage]
  )

  /*
  |--------------------------------------------------------------------------
  | Context value
  |--------------------------------------------------------------------------
  */

  const value = {
    role,
    setRole,

    docState,
    grantPermission,
    uploadDocument,

    flowStep,
    setFlowStep,

    paymentStatus,
    setPaymentStatus,

    timeline,
    setTimeline,

    chatMessages,
    addChatMessage,

    reviewApproved,
    setReviewApproved,

    correctionRequested,
    requestCorrection,

    operatorSentForReview,
    setOperatorSentForReview,

    livePhotoState,
    setLivePhotoState,
  }

  return (
    <AppCtx.Provider value={value}>
      {children}
    </AppCtx.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppCtx)

  if (!ctx) {
    throw new Error(
      'useApp must be used within AppProvider'
    )
  }

  return ctx
}