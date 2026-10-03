import { useEffect, useState } from 'react'
import StickFigure from './StickFigure'
import './AdminPanel.css'

async function fetchJson(url) {
  const res = await fetch(url, { credentials: 'include' })
  if (!res.ok) {
    throw new Error(`${url} failed (${res.status})`)
  }
  return res.json()
}

async function postJson(url, body) {
  const res = await fetch(url, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data.error || `${url} failed (${res.status})`)
  }
  return data
}

/** Mini live preview of a chat room (last lines from /api). */
function ChatPreview({ path }) {
  const [lines, setLines] = useState([])

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const data = await fetchJson(`/api/${path}/messages`)
        if (!cancelled) setLines((data.messages || []).slice(-4))
      } catch {
        if (!cancelled) setLines([])
      }
    }
    load()
    const id = setInterval(load, 4000)
    return () => {
      cancelled = true
      clearInterval(id)
    }
  }, [path])

  return (
    <div className="preview-inner preview-chat" aria-hidden="true">
      <div className="preview-chat-head">
        <span className="preview-chat-title">Room chat</span>
        <span className="preview-chat-meta">room {path}</span>
      </div>
      <ul className="preview-chat-log">
        {lines.length === 0 ? (
          <li className="empty">No messages yet.</li>
        ) : (
          lines.map((line, i) => (
            <li key={`${i}-${line.slice(0, 16)}`}>{line}</li>
          ))
        )}
      </ul>
      <div className="preview-chat-composer">
        <span className="preview-fake-input">Type a message…</span>
        <span className="preview-fake-btn">Send</span>
      </div>
    </div>
  )
}

/** Miniature of the admin layout (no nested live admin). */
function AdminPreview() {
  return (
    <div className="preview-inner preview-admin" aria-hidden="true">
      <div className="preview-admin-bar preview-admin-rooms" />
      <div className="preview-admin-bar preview-admin-guests" />
      <div className="preview-admin-floor">
        <span>Admin</span>
      </div>
    </div>
  )
}

/** Miniature stick-man for character rtype previews. */
function CharacterPreview() {
  return (
    <div className="preview-inner preview-character" aria-hidden="true">
      <StickFigure
        phase="idle"
        styleName="classic"
        gear="none"
        size="mini"
        label="Stick"
      />
    </div>
  )
}

function RoomPreviewCard({ room, wanderHere }) {
  const isAdmin = room.rtype === 'admin'
  const isCharacter = room.rtype === 'character'
  const isAi = room.rtype === 'ai'
  return (
    <a
      className={`room-preview-card ${wanderHere ? 'has-wander' : ''}`}
      href={`/room/${room.path}`}
      title={`Open ${room.path} (${room.rtype})`}
    >
      <div className="room-preview-stage">
        {isAdmin ? (
          <AdminPreview />
        ) : isCharacter || isAi ? (
          <CharacterPreview />
        ) : (
          <ChatPreview path={room.path} />
        )}
        {wanderHere ? (
          <div className="wander-on-card" title={wanderHere.caption || 'Wander'}>
            <StickFigure
              phase={wanderHere.phase || 'visiting'}
              styleName="neon"
              gear="pack"
              size="mini"
              label="Wander"
            />
          </div>
        ) : null}
      </div>
      <div className="room-preview-caption">
        <span className="room-preview-name">{room.path}</span>
        <span className="room-preview-type">{room.rtype}</span>
      </div>
    </a>
  )
}

function ConfirmGrantModal({ guest, busy, onYes, onNo }) {
  if (!guest) return null
  const label = guest.session || '?'
  return (
    <div className="admin-modal-backdrop" role="presentation" onClick={onNo}>
      <div
        className="admin-modal"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="grant-admin-title"
        aria-describedby="grant-admin-desc"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 id="grant-admin-title">Grant admin key?</h3>
        <p id="grant-admin-desc">
          Give key <strong>999</strong> to guest <code>{label}</code>? They will
          be able to open the admin panel.
        </p>
        <div className="admin-modal-actions">
          <button
            type="button"
            className="admin-modal-no"
            onClick={onNo}
            disabled={busy}
          >
            No
          </button>
          <button
            type="button"
            className="admin-modal-yes"
            onClick={onYes}
            disabled={busy}
          >
            {busy ? 'Granting…' : 'Yes'}
          </button>
        </div>
      </div>
    </div>
  )
}

const LETTERS = 'abcdefghijklmnopqrstuvwxyz'.split('')

function KnockLetterMap({ flashes }) {
  return (
    <div className="knock-letter-map" aria-hidden="true">
      {LETTERS.map((ch) => {
        const flashId = flashes[ch] || 0
        return (
          <span
            key={`${ch}-${flashId}`}
            className={`knock-map-letter${flashId ? ' lit' : ''}`}
            data-letter={ch}
          >
            {ch}
          </span>
        )
      })}
    </div>
  )
}

export default function AdminPanel() {
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [rooms, setRooms] = useState([])
  const [guests, setGuests] = useState([])
  const [wander, setWander] = useState(null)
  const [flashes, setFlashes] = useState({})
  const [confirmGuest, setConfirmGuest] = useState(null)
  const [granting, setGranting] = useState(false)

  useEffect(() => {
    let cancelled = false
    let afterId = 0
    let primed = false

    async function load() {
      try {
        const [roomsData, guestsData, knocksData] = await Promise.all([
          fetchJson('/api/admin/rooms'),
          fetchJson('/api/admin/guests'),
          fetchJson(`/api/admin/knocks?after=${afterId}`),
        ])
        if (cancelled) return
        setRooms(roomsData.rooms || [])
        setWander(roomsData.wander || null)
        setGuests(guestsData.guests || [])

        const fresh = knocksData.knocks || []
        if (fresh.length) {
          afterId = fresh[fresh.length - 1].id
          if (primed) {
            setFlashes((prev) => {
              const next = { ...prev }
              for (const knock of fresh) {
                const ch = String(knock.letter || '')
                  .toLowerCase()
                  .slice(0, 1)
                if (ch >= 'a' && ch <= 'z') {
                  next[ch] = (next[ch] || 0) + 1
                }
              }
              return next
            })
          }
        }
        primed = true
        setError('')
      } catch (err) {
        if (!cancelled) setError(err.message || 'Load failed')
      }
    }

    load()
    const id = setInterval(load, 1500)
    return () => {
      cancelled = true
      clearInterval(id)
    }
  }, [])

  async function confirmGrant() {
    if (!confirmGuest?.session || granting) return
    setGranting(true)
    setNotice('')
    try {
      await postJson('/api/admin/grant-admin-key', {
        session: confirmGuest.session,
      })
      setNotice(`Admin key granted to ${confirmGuest.session}`)
      setConfirmGuest(null)
      const guestsData = await fetchJson('/api/admin/guests')
      setGuests(guestsData.guests || [])
    } catch (err) {
      setError(err.message || 'Grant failed')
      setConfirmGuest(null)
    } finally {
      setGranting(false)
    }
  }

  return (
    <main className="admin-shell">
      <KnockLetterMap flashes={flashes} />

      <header className="admin-hero">
        <p className="admin-brand">Knocknok</p>
        <h1>Admin panel</h1>
        <p className="admin-lead">Live rooms and guests behind the door.</p>
      </header>

      {error ? <p className="error">{error}</p> : null}
      {notice ? <p className="admin-notice">{notice}</p> : null}

      <section className="admin-block rooms-block" aria-labelledby="rooms-heading">
        <div className="admin-block-head">
          <h2 id="rooms-heading">Rooms</h2>
          <p>
            Small previews of how each room looks inside.
            {wander?.target
              ? ` Wander is at ${wander.target}.`
              : ' Wander is at HQ / between rooms.'}
          </p>
        </div>
        <div className="preview-row">
          {rooms.length === 0 ? (
            <p className="admin-empty">No rooms yet.</p>
          ) : (
            rooms.map((room) => (
              <RoomPreviewCard
                key={room.id}
                room={room}
                wanderHere={
                  wander?.target &&
                  String(wander.target).toLowerCase() ===
                    String(room.path).toLowerCase()
                    ? wander
                    : null
                }
              />
            ))
          )}
        </div>
      </section>

      <section className="admin-block guests-block" aria-labelledby="guests-heading">
        <div className="admin-block-head">
          <h2 id="guests-heading">Guests</h2>
          <p>Sessions currently holding a pocket. Grant admin key with confirm.</p>
        </div>
        <div className="guest-row">
          {guests.length === 0 ? (
            <p className="admin-empty">No guests online.</p>
          ) : (
            guests.map((guest, i) => (
              <div
                key={`${guest.session}-${i}`}
                className="guest-chip"
                title={`pocket: ${guest.pocket}`}
              >
                <span className="guest-chip-id">{guest.session || '?'}</span>
                <span className="guest-chip-pocket">{guest.pocket || '—'}</span>
                <button
                  type="button"
                  className="guest-grant-btn"
                  onClick={() => {
                    setError('')
                    setNotice('')
                    setConfirmGuest(guest)
                  }}
                >
                  Grant admin
                </button>
              </div>
            ))
          )}
        </div>
      </section>

      <ConfirmGrantModal
        guest={confirmGuest}
        busy={granting}
        onYes={confirmGrant}
        onNo={() => !granting && setConfirmGuest(null)}
      />
    </main>
  )
}
