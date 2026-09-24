import { createContext, useContext, useState, useCallback } from 'react'
import { jeeMainForm, applicationTimeline, initialChatMessages } from './mockData'

const AppCtx = createContext(null)

const initialDocState = Object.fromEntries(
  jeeMainForm.documents.map((d) => [d.key, { permission: false, status: d.inVault ? 'idle' : 'not_uploaded' }])
)

export function AppProvider({ children }) {
  const [role, setRole] = useState(null) // 'applicant' | 'operator' | 'admin'
  const [docState, setDocState] = useState(initialDocState)
  const [flowStep, setFlowStep] = useState(0) // index into ['Documents','Application','Payment','Processing','Review','Submitted']
  const [paymentStatus, setPaymentStatus] = useState('unpaid')
  const [timeline, setTimeline] = useState(applicationTimeline)
  const [chatMessages, setChatMessages] = useState(initialChatMessages)
  const [reviewApproved, setReviewApproved] = useState(false)
  const [correctionRequested, setCorrectionRequested] = useState(false)
  const [operatorSentForReview, setOperatorSentForReview] = useState(false)
  const [livePhotoState, setLivePhotoState] = useState('idle') // idle -> qr -> waiting -> received

  const grantPermission = useCallback((key) => {
    setDocState((s) => ({ ...s, [key]: { ...s[key], permission: true, status: 'uploading' } }))
    setTimeout(() => setDocState((s) => ({ ...s, [key]: { ...s[key], status: 'processing' } })), 700)
    setTimeout(() => setDocState((s) => ({ ...s, [key]: { ...s[key], status: 'extracting' } })), 1600)
    setTimeout(() => setDocState((s) => ({ ...s, [key]: { ...s[key], status: 'ready' } })), 2500)
  }, [])

  const uploadDocument = useCallback((key) => {
    setDocState((s) => ({ ...s, [key]: { ...s[key], permission: true, status: 'uploading' } }))
    setTimeout(() => setDocState((s) => ({ ...s, [key]: { ...s[key], status: 'processing' } })), 800)
    setTimeout(() => setDocState((s) => ({ ...s, [key]: { ...s[key], status: 'extracting' } })), 1800)
    setTimeout(() => setDocState((s) => ({ ...s, [key]: { ...s[key], status: 'ready' } })), 2800)
  }, [])

  const addChatMessage = useCallback((msg) => {
    setChatMessages((m) => [...m, { id: m.length + 1, time: 'Just now', ...msg }])
  }, [])

  const requestCorrection = useCallback((text) => {
    setCorrectionRequested(true)
    setReviewApproved(false)
    addChatMessage({ from: 'applicant', text })
    setTimeout(() => addChatMessage({ from: 'system', text: 'Correction requested', tone: 'amber' }), 500)
    setTimeout(() => addChatMessage({ from: 'operator', text: "Got it — I'll fix this and share an updated review shortly." }), 1400)
    setTimeout(() => {
      addChatMessage({ from: 'system', text: 'Updated review available', tone: 'blue' })
      setCorrectionRequested(false)
    }, 3200)
  }, [addChatMessage])

  const value = {
    role, setRole,
    docState, grantPermission, uploadDocument,
    flowStep, setFlowStep,
    paymentStatus, setPaymentStatus,
    timeline, setTimeline,
    chatMessages, addChatMessage,
    reviewApproved, setReviewApproved,
    correctionRequested, requestCorrection,
    operatorSentForReview, setOperatorSentForReview,
    livePhotoState, setLivePhotoState,
  }

  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>
}

export function useApp() {
  const ctx = useContext(AppCtx)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
