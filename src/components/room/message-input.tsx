'use client'

import { useState } from 'react'
import { parseRollExpression, type RollRequest } from '@lambersond/3d-dice-core'
import { Send } from 'lucide-react'
import { Button } from '@/components/common'

type Props = {
  disabled?: boolean
  onSendMessage: (text: string) => void
  onRollRequest: (request: RollRequest) => void
}

/** Returns the dice expression body if `text` starts with `/r` or `/roll`. */
function extractRollCommand(text: string): string | undefined {
  const lower = text.toLowerCase()
  if (lower === '/r' || lower === '/roll') return ''
  if (lower.startsWith('/r ')) return text.slice(3).trimStart()
  if (lower.startsWith('/roll ')) return text.slice(6).trimStart()
  return undefined
}

export function MessageInput({
  disabled = false,
  onSendMessage,
  onRollRequest,
}: Readonly<Props>) {
  const [text, setText] = useState('')
  const [error, setError] = useState<string | undefined>()

  const trimmed = text.trim()
  const canSend = !!trimmed && !disabled

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSend) return

    const rollExpr = extractRollCommand(trimmed)
    if (rollExpr !== undefined) {
      const result = parseRollExpression(rollExpr)
      if (!result.ok) {
        setError(result.error)
        return
      }
      onRollRequest(result.request)
      setError(undefined)
      setText('')
      return
    }

    onSendMessage(trimmed)
    setError(undefined)
    setText('')
  }

  return (
    <form
      onSubmit={handleSubmit}
      className='flex flex-col gap-1 border-t border-border-light bg-paper px-3 py-2'
    >
      <div className='flex items-center gap-2'>
        <input
          type='text'
          value={text}
          onChange={e => {
            setText(e.target.value)
            if (error) setError(undefined)
          }}
          placeholder='Say something or /roll 2d6+3'
          disabled={disabled}
          aria-label='Message or /roll command'
          className='flex-1 rounded-md border border-border-light bg-card px-3 py-2 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:cursor-not-allowed disabled:opacity-50'
        />
        <Button
          intent='primary'
          icon={Send}
          type='submit'
          disabled={!canSend}
          aria-label='Send'
        >
          Send
        </Button>
      </div>
      {error && (
        <p className='text-xs italic text-danger' role='alert'>
          {error}
        </p>
      )}
    </form>
  )
}
