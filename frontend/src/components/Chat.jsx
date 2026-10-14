import {
  useEffect,
  useRef,
  useState,
} from 'react'

import { Button } from './ui'

import { supabase } from '../lib/supabase'

import { apiRequest } from '../lib/api/client'


export function Chat({
  applicationId,
  messages: initialMessages = [],
  onSend,
  selfRole = 'applicant',
  otherName = 'FormFiller Operator',
  quickReplies = [],
}) {

  // ==================================================
  // MESSAGE STATE
  // ==================================================

  const [messages, setMessages] =
    useState(initialMessages)

  // ==================================================
  // INPUT STATE
  // ==================================================

  const [input, setInput] =
    useState('')

  // ==================================================
  // SENDING STATE
  // ==================================================

  const [sending, setSending] =
    useState(false)

  // ==================================================
  // REALTIME CONNECTION
  // ==================================================

  const [connected, setConnected] =
    useState(false)

  // ==================================================
  // CHAT ERROR
  // ==================================================

  const [chatError, setChatError] =
    useState('')

  // ==================================================
  // MESSAGE END REF
  // ==================================================

  const messagesEndRef =
    useRef(null)


  // ==================================================
  // NORMALIZE MESSAGE
  // ==================================================

  function normalizeMessage(message) {

    return {

      id:
        message?.id ||
        `${Date.now()}-${Math.random()}`,

      application_id:
        message?.application_id ||
        applicationId,

      sender_id:
        message?.sender_id ||
        null,

      sender_role:
        message?.sender_role ||
        message?.from ||
        'system',

      message:
        message?.message ||
        message?.text ||
        '',

      message_type:
        message?.message_type ||
        message?.messageType ||
        'text',

      created_at:
        message?.created_at ||
        new Date().toISOString(),

      read_at:
        message?.read_at ||
        null,

    }

  }


  // ==================================================
  // LOAD EXISTING MESSAGES
  // ==================================================

  useEffect(() => {

    if (!applicationId) {
      return
    }

    let mounted = true

    async function loadMessages() {

      try {

        setChatError('')

        const response =
          await apiRequest(
            `/api/applications/${applicationId}/messages`
          )

        if (!mounted) {
          return
        }

        const loadedMessages =
          response?.messages ||
          response?.data ||
          []

        setMessages(
          loadedMessages.map(
            normalizeMessage
          )
        )

      } catch (error) {

        console.error(
          'Failed to load chat messages:',
          error
        )

        if (mounted) {

          setChatError(
            error?.message ||
            'Unable to load chat messages.'
          )

        }

      }

    }

    loadMessages()

    return () => {

      mounted = false

    }

  }, [applicationId])


  // ==================================================
  // REALTIME CONNECTION
  // ==================================================

  useEffect(() => {

    if (!applicationId) {
      return
    }

    const channel =
      supabase
        .channel(
          `application-chat-${applicationId}`
        )
        .on(
          'postgres_changes',
          {
            event: 'INSERT',

            schema: 'public',

            table:
              'application_messages',

            filter:
              `application_id=eq.${applicationId}`,
          },

          (payload) => {

            const incoming =
              normalizeMessage(
                payload.new
              )

            setMessages(
              (current) => {

                const alreadyExists =
                  current.some(
                    (message) =>
                      message.id ===
                      incoming.id
                  )

                if (
                  alreadyExists
                ) {

                  return current

                }

                return [
                  ...current,
                  incoming,
                ]

              }
            )

          }
        )
        .subscribe(
          (status) => {

            console.log(
              '💬 Chat realtime status:',
              status
            )

            if (
              status ===
              'SUBSCRIBED'
            ) {

              setConnected(true)

            } else {

              setConnected(false)

            }

          }
        )

    return () => {

      setConnected(false)

      supabase.removeChannel(
        channel
      )

    }

  }, [applicationId])


  // ==================================================
  // AUTO SCROLL
  // ==================================================

  useEffect(() => {

    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth',
    })

  }, [messages])


  // ==================================================
  // SEND MESSAGE
  // ==================================================

  async function sendMessage(
    text,
    messageType = 'text'
  ) {

    const cleanText =
      String(text || '').trim()

    // ----------------------------------------------
    // BASIC VALIDATION
    // ----------------------------------------------

    if (
      !cleanText ||
      !applicationId ||
      sending
    ) {

      return

    }

    try {

      setSending(true)

      setChatError('')


      // ============================================
      // GET LOGIN TOKEN
      // ============================================

      const token =
        localStorage.getItem(
          'formfiller_access_token'
        )


      if (!token) {

        throw new Error(
          'Your login session has expired. Please login again.'
        )

      }


      // ============================================
      // API BASE URL
      // ============================================

      const apiBaseUrl =
        import.meta.env.VITE_API_URL ||
        'http://localhost:5000'


      // ============================================
      // SEND MESSAGE
      // ============================================

      const response =
        await fetch(
          `${apiBaseUrl}/api/applications/${applicationId}/messages`,
          {

            method: 'POST',

            headers: {

              'Content-Type':
                'application/json',

              Authorization:
                `Bearer ${token}`,

            },

            credentials:
              'include',

            body:
              JSON.stringify({

                message:
                  cleanText,

                messageType,

              }),

          }
        )


      // ============================================
      // READ RESPONSE
      // ============================================

      const data =
        await response.json()


      console.log(
        '💬 Chat API response:',
        data
      )


      // ============================================
      // HANDLE API ERROR
      // ============================================

      if (!response.ok) {

        throw new Error(
          data?.message ||
          data?.error ||
          `Unable to send message (${response.status})`
        )

      }


      // ============================================
      // GET SENT MESSAGE
      // ============================================

      const sentMessage =
        data?.chatMessage ||
        data?.message ||
        null


      // ============================================
      // ADD SENT MESSAGE LOCALLY
      // ============================================

      if (sentMessage) {

        const normalized =
          normalizeMessage(
            sentMessage
          )

        setMessages(
          (current) => {

            const exists =
              current.some(
                (message) =>
                  message.id ===
                  normalized.id
              )

            if (exists) {

              return current

            }

            return [
              ...current,
              normalized,
            ]

          }
        )

      }


      // ============================================
      // OPTIONAL CALLBACK
      // ============================================

      if (onSend) {

        onSend(
          cleanText,
          messageType
        )

      }


      // ============================================
      // CLEAR INPUT
      // ============================================

      setInput('')


    } catch (error) {

      console.error(
        '❌ Failed to send message:',
        error
      )


      setChatError(
        error?.message ||
        'Unable to send message.'
      )


    } finally {

      setSending(false)

    }

  }


  // ==================================================
  // INPUT SEND
  // ==================================================

  function handleSubmit(
    event
  ) {

    event.preventDefault()

    sendMessage(
      input,
      'text'
    )

  }


  // ==================================================
  // QUICK MESSAGE TYPE
  // ==================================================

  function getMessageType(
    text
  ) {

    const value =
      String(text)
        .toLowerCase()


    // ----------------------------------------------
    // OTP
    // ----------------------------------------------

    if (
      value.includes('otp')
    ) {

      return 'otp_request'

    }


    // ----------------------------------------------
    // LIVE PHOTO
    // ----------------------------------------------

    if (
      value.includes(
        'live photograph'
      ) ||
      value.includes(
        'live photo'
      )
    ) {

      return 'live_photo_request'

    }


    // ----------------------------------------------
    // ERROR
    // ----------------------------------------------

    if (
      value.includes(
        'error'
      )
    ) {

      return 'error_report'

    }


    return 'text'

  }


  // ==================================================
  // MESSAGE LABEL
  // ==================================================

  function getMessageLabel(
    type
  ) {

    if (
      type ===
      'otp_request'
    ) {

      return 'OTP Request'

    }


    if (
      type ===
      'live_photo_request'
    ) {

      return 'Live Photograph'

    }


    if (
      type ===
      'error_report'
    ) {

      return 'Form Error'

    }


    return null

  }


  // ==================================================
  // UI
  // ==================================================

  return (

    <div className="flex flex-col h-full min-h-0">


      {/* =================================================
          CHAT HEADER
      ================================================= */}

      <div
        className="
          shrink-0
          px-5
          py-4
          border-b
          border-line
          bg-white
        "
      >

        <div className="flex items-center gap-3">

          {/* -----------------------------------------
              AVATAR
          ----------------------------------------- */}

          <div
            className="
              w-10
              h-10
              rounded-full
              bg-brand-50
              text-brand-600
              flex
              items-center
              justify-center
              font-semibold
            "
          >

            {
              otherName
                ?.charAt(0)
                ?.toUpperCase() ||
              'F'
            }

          </div>


          {/* -----------------------------------------
              NAME + STATUS
          ----------------------------------------- */}

          <div className="min-w-0">

            <p
              className="
                text-sm
                font-medium
                text-ink
                truncate
              "
            >

              {otherName}

            </p>


            <div
              className="
                flex
                items-center
                gap-1.5
              "
            >

              <span
                className={`
                  w-2
                  h-2
                  rounded-full
                  ${
                    connected
                      ? 'bg-green-500'
                      : 'bg-gray-400'
                  }
                `}
              />


              <span
                className="
                  text-xs
                  text-ink-faint
                "
              >

                {
                  connected
                    ? 'Connected'
                    : 'Connecting...'
                }

              </span>

            </div>

          </div>

        </div>

      </div>


      {/* =================================================
          ERROR MESSAGE
      ================================================= */}

      {chatError && (

        <div
          className="
            shrink-0
            px-4
            py-2.5
            border-b
            border-red-200
            bg-red-50
          "
        >

          <div
            className="
              flex
              items-start
              justify-between
              gap-3
            "
          >

            <p
              className="
                text-xs
                leading-5
                text-red-600
              "
            >

              {chatError}

            </p>


            <button
              type="button"
              onClick={() =>
                setChatError('')
              }
              className="
                shrink-0
                text-xs
                font-medium
                text-red-500
                hover:text-red-700
              "
            >

              Close

            </button>

          </div>

        </div>

      )}


      {/* =================================================
          MESSAGE AREA
      ================================================= */}

      <div
        className="
          flex-1
          min-h-0
          overflow-y-auto
          px-4
          py-4
          bg-white
        "
      >

        <div className="space-y-3">


          {/* -------------------------------------------
              NO MESSAGES
          ------------------------------------------- */}

          {messages.length === 0 ? (

            <div
              className="
                h-full
                min-h-[260px]
                flex
                items-center
                justify-center
              "
            >

              <div className="text-center">

                <div
                  className="
                    w-10
                    h-10
                    rounded-full
                    bg-brand-50
                    flex
                    items-center
                    justify-center
                    mx-auto
                  "
                >

                  💬

                </div>


                <p
                  className="
                    text-sm
                    font-medium
                    text-ink
                    mt-3
                  "
                >

                  No messages yet

                </p>


                <p
                  className="
                    text-xs
                    text-ink-faint
                    mt-1
                  "
                >

                  Start the conversation with the applicant.

                </p>

              </div>

            </div>

          ) : (


            /* -----------------------------------------
               MESSAGES
            ----------------------------------------- */

            messages.map(
              (message) => {

                const isSelf =
                  message.sender_role ===
                  selfRole


                const label =
                  getMessageLabel(
                    message.message_type
                  )


                return (

                  <div
                    key={
                      message.id
                    }
                    className={`
                      flex
                      ${
                        isSelf
                          ? 'justify-end'
                          : 'justify-start'
                      }
                    `}
                  >

                    <div
                      className={`
                        max-w-[82%]
                        rounded-2xl
                        px-4
                        py-3
                        ${
                          isSelf
                            ? 'bg-brand-600 text-white rounded-br-md'
                            : 'bg-surface text-ink rounded-bl-md'
                        }
                      `}
                    >


                      {/* --------------------------------
                          MESSAGE LABEL
                      -------------------------------- */}

                      {label && (

                        <p
                          className={`
                            text-[10px]
                            font-semibold
                            uppercase
                            tracking-wide
                            mb-1
                            ${
                              isSelf
                                ? 'text-white/75'
                                : 'text-brand-600'
                            }
                          `}
                        >

                          {label}

                        </p>

                      )}


                      {/* --------------------------------
                          MESSAGE TEXT
                      -------------------------------- */}

                      <p
                        className="
                          text-sm
                          leading-5
                          whitespace-pre-wrap
                          break-words
                        "
                      >

                        {message.message}

                      </p>


                      {/* --------------------------------
                          MESSAGE TIME
                      -------------------------------- */}

                      <p
                        className={`
                          text-[10px]
                          mt-1.5
                          ${
                            isSelf
                              ? 'text-white/70'
                              : 'text-ink-faint'
                          }
                        `}
                      >

                        {formatTime(
                          message.created_at
                        )}

                      </p>

                    </div>

                  </div>

                )

              }
            )

          )}


          {/* -------------------------------------------
              AUTO SCROLL TARGET
          ------------------------------------------- */}

          <div
            ref={
              messagesEndRef
            }
          />

        </div>

      </div>


      {/* =================================================
          QUICK REPLIES
      ================================================= */}

      {quickReplies.length > 0 && (

        <div
          className="
            shrink-0
            border-t
            border-line
            bg-white
            px-3
            py-2
          "
        >

          <div
            className="
              flex
              flex-wrap
              gap-1.5
            "
          >

            {quickReplies
              .slice(0, 4)
              .map(
                (reply) => (

                  <button
                    key={reply}
                    type="button"
                    disabled={sending}
                    onClick={() =>
                      sendMessage(
                        reply,
                        getMessageType(
                          reply
                        )
                      )
                    }
                    className="
                      px-2.5
                      py-1.5
                      rounded-full
                      border
                      border-line
                      bg-white
                      text-[11px]
                      leading-4
                      text-ink
                      hover:bg-surface
                      hover:border-brand-200
                      transition
                      disabled:opacity-50
                      disabled:cursor-not-allowed
                    "
                  >

                    {reply}

                  </button>

                )
              )}

          </div>

        </div>

      )}


      {/* =================================================
          MESSAGE INPUT
      ================================================= */}

      <form
        onSubmit={
          handleSubmit
        }
        className="
          shrink-0
          border-t
          border-line
          bg-white
          px-4
          py-3
        "
      >

        <div
          className="
            flex
            items-center
            gap-2
          "
        >


          {/* -----------------------------------------
              INPUT
          ----------------------------------------- */}

          <input
            value={input}
            onChange={(event) =>
              setInput(
                event.target.value
              )
            }
            placeholder="Type a message"
            disabled={
              !applicationId ||
              sending
            }
            className="
              flex-1
              min-w-0
              h-11
              rounded-xl
              border
              border-line
              bg-white
              px-3.5
              text-sm
              text-ink
              outline-none
              focus:border-brand-500
              focus:ring-2
              focus:ring-brand-100
              disabled:bg-surface
            "
          />


          {/* -----------------------------------------
              SEND BUTTON
          ----------------------------------------- */}

          <Button
            type="submit"
            disabled={
              !input.trim() ||
              !applicationId ||
              sending
            }
            className="
              h-11
              shrink-0
            "
          >

            {sending
              ? 'Sending...'
              : 'Send'}

          </Button>

        </div>

      </form>

    </div>

  )

}


/* ======================================================
   TIME FORMAT
====================================================== */

function formatTime(
  value
) {

  if (!value) {
    return ''
  }

  try {

    return new Date(
      value
    ).toLocaleTimeString(
      [],
      {
        hour: '2-digit',
        minute: '2-digit',
      }
    )

  } catch {

    return ''

  }

}