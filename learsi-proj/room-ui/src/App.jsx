import Chat from './Chat'
import AdminPanel from './AdminPanel'

/**
 * Flask sets data-room-type on #root (from rooms.rtype).
 * React only picks which page to show — auth stays on the server.
 *
 * Add more types later the same way:
 *   board → <BoardGame />
 */

function readRoomType() {
  const fromDom = document.getElementById('root')?.dataset?.roomType
  if (fromDom) return fromDom
  const q = new URLSearchParams(window.location.search).get('type')
  return q || 'chat'
}

export default function App() {
  const roomType = readRoomType()

  if (roomType === 'admin') {
    return <AdminPanel />
  }

  // default / chat (and unknown types fall back to chat for now)
  return <Chat />
}
