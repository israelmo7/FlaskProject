import Chat from './Chat'
import AdminPanel from './AdminPanel'

/**
 * Room path + type come from Flask:
 *   <div id="root" data-room-id="lobby" data-room-type="chat">
 * Admin rooms use data-room-type="admin" → AdminPanel; else Chat.
 */

function readRoomType() {
  const fromDom = document.getElementById('root')?.dataset?.roomType
  if (fromDom === 'admin' || fromDom === 'chat') return fromDom
  const q = new URLSearchParams(window.location.search).get('type')
  return q === 'admin' ? 'admin' : 'chat'
}

export default function App() {
  const roomType = readRoomType()
  if (roomType === 'admin') {
    return <AdminPanel />
  }
  return <Chat />
}
