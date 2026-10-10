import { useCallback, useEffect, useRef, useState } from 'react'
import StickFigure, { useRotatingStick } from './StickFigure'
import CartoonStage from './CartoonStage'
import './chat.css'

function readRoomPath() {
  const fromDom = document.getElementById('root')?.dataset?.roomPath
  if (fromDom) return fromDom
  const q = new URLSearchParams(window.location.search).get('room')
  return q || 'lobby'
}

async function fetchMessages(roomPath) {
  const res = await fetch(`/api/${roomPath}/messages`, {
    credentials: 'include',
  })
  if (!res.ok) {
    throw new Error(`load failed (${res.status})`)
  }
  const data = await res.json()
  return data.messages || []
}

async function postMessage(roomPath, message) {
  const res = await fetch(`/api/${roomPath}/messages`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message }),
  })
  if (!res.ok) {
    throw new Error(`send failed (${res.status})`)
  }
  const data = await res.json()
  return data.messages || []
}

async function fetchPresence(roomPath) {
  const res = await fetch(`/api/${roomPath}/presence`, {
    credentials: 'include',
  })
  if (!res.ok) {
    return null
  }
  const data = await res.json()
  return data.wander || null
}

/** Out exploring the room sketch (not stuck in the mini card). */
function canJumpOut(wander) {
  if (!wander?.present) return false
  const phase = wander.phase || 'idle'
  return phase === 'walking' || phase === 'visiting'
}

function MiniWanderCard({ roomPath, wander, jumpedOut }) {
  const { styleName, gear } = useRotatingStick(3000)
  const phase = wander?.phase || 'idle'
  return (
    <div
      className={`wander-mini-card ${jumpedOut ? 'is-away' : 'is-here'}`}
      aria-live="polite"
    >
      <p className="wander-mini-label">
        {jumpedOut ? 'Wander · out in the room' : 'Wander · peeking in'}
      </p>
      {jumpedOut ? (
        <div className="wander-mini-ghost" title="Jumped into the room sketch">
          <span className="ghost-outline" />
          <span className="ghost-text">jumped out →</span>
        </div>
      ) : (
        <StickFigure
          phase={phase}
          talking={Boolean(wander?.talking)}
          expression={wander?.talking ? null : wander?.expression || null}
          styleName={styleName}
          gear={gear}
          size="mini"
          label="Wander"
        />
      )}
      <p className="wander-mini-caption">
        {wander?.caption || `Waiting near ${roomPath}…`}
      </p>
    </div>
  )
}

function WorldWander({ roomPath, wander, jumping }) {
  const { styleName, gear } = useRotatingStick(3200)
  const phase = wander?.phase || 'visiting'
  return (
    <CartoonStage
      phase={phase}
      size="bleed"
      room={roomPath}
      name="Wander"
      caption={wander?.caption || 'Looking around…'}
      showActor
      jumping={jumping}
    >
      <StickFigure
        phase={phase}
        talking={Boolean(wander?.talking)}
        expression={wander?.talking ? null : wander?.expression || null}
        styleName={styleName}
        gear={gear}
        size="side"
        label="Wander"
      />
    </CartoonStage>
  )
}

export default function Chat() {
  const roomPath = readRoomPath()
  const [messages, setMessages] = useState([])
  const [draft, setDraft] = useState('')
  const [error, setError] = useState('')
  const [sending, setSending] = useState(false)
  const [wander, setWander] = useState(null)
  const [jumping, setJumping] = useState(false)
  const wasOut = useRef(false)

  const load = useCallback(async () => {
    try {
      const [lines, presence] = await Promise.all([
        fetchMessages(roomPath),
        fetchPresence(roomPath),
      ])
      setMessages(lines)
      setWander(presence && presence.present ? presence : null)
      setError('')
    } catch (err) {
      setError(err.message || 'Could not load messages')
    }
  }, [roomPath])

  useEffect(() => {
    load()
    const id = setInterval(load, 2000)
    return () => clearInterval(id)
  }, [load])

  const jumpedOut = canJumpOut(wander)

  useEffect(() => {
    if (jumpedOut && !wasOut.current) {
      setJumping(true)
      const t = window.setTimeout(() => setJumping(false), 750)
      wasOut.current = true
      return () => window.clearTimeout(t)
    }
    if (!jumpedOut) {
      wasOut.current = false
    }
    return undefined
  }, [jumpedOut])

  async function handleOpenWindow() {
    const url = `/room/${roomPath}/app`
    window.open(url, '_blank', 'width=400,height=600')
  }

  async function onSend(e) {
    e.preventDefault()
    const text = draft.trim()
    if (!text || sending) return

    setSending(true)
    setDraft('')
    setMessages((prev) => [...prev, text])
    try {
      const lines = await postMessage(roomPath, text)
      setMessages(lines)
      setError('')
    } catch (err) {
      setError(err.message || 'Send failed')
      await load()
    } finally {
      setSending(false)
    }
  }

  return (
    <main className={`chat-world room-${roomPath}`}>
      {/* Full-screen room sketch — always, themed by room name */}
      {jumpedOut && wander ? (
        <WorldWander roomPath={roomPath} wander={wander} jumping={jumping} />
      ) : (
        <CartoonStage
          phase="idle"
          size="bleed"
          room={roomPath}
          showActor={false}
        />
      )}

      <div className="chat-overlay">
        <header className="chat-overlay-head">
          <h1>Room chat</h1>
          <p className="meta">room {roomPath}</p>
        </header>

        {error ? <p className="error">{error}</p> : null}

        <div className="chat-panel">
          {wander ? (
            <MiniWanderCard
              roomPath={roomPath}
              wander={wander}
              jumpedOut={jumpedOut}
            />
          ) : null}

          <ul className="log" aria-live="polite">
            {messages.length === 0 ? (
              <li className="empty">No messages yet. Say hello.</li>
            ) : (
              messages.map((line, i) => (
                <li key={`${i}-${line.slice(0, 24)}`}>{line}</li>
              ))
            )}
          </ul>

          <form onSubmit={onSend} className="composer">
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              maxLength={500}
              placeholder="Type a message…"
              aria-label="Message"
              disabled={sending}
            />
            <button type="submit" disabled={sending || !draft.trim()}>
              Send
            </button>
          </form>
          <button type="button" className="chat-open-btn" onClick={handleOpenWindow}>
            Open in new window
          </button>
        </div>
      </div>
    </main>
  )
}
