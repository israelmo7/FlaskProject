/** Simple cartoon props keyed by room path — example only. */

const DEFAULT = {
  label: 'ROOM',
  sky: ['#7eb8c9', '#5a9aab'],
  wall: '#f0e2c8',
  floor: ['#c4a574', '#a88858'],
  accent: '#d97845',
  props: 'default',
}

const THEMES = {
  lobby: {
    label: 'LOBBY',
    sky: ['#8eb4c8', '#6a96aa'],
    wall: '#ebe3d4',
    floor: ['#b89a6e', '#967a52'],
    accent: '#c4a35a',
    props: 'lobby',
  },
  garden: {
    label: 'GARDEN',
    sky: ['#87c4e0', '#6aa8c4'],
    wall: '#d8ecc8',
    floor: ['#7a9a4a', '#5e7a36'],
    accent: '#e07a3a',
    props: 'garden',
  },
  studio: {
    label: 'STUDIO',
    sky: ['#d4c4b0', '#b8a090'],
    wall: '#f5efe6',
    floor: ['#d0c0a8', '#b0a088'],
    accent: '#5a7ab8',
    props: 'studio',
  },
}

export function themeForRoom(roomPath) {
  const key = String(roomPath || '')
    .trim()
    .toLowerCase()
  return { ...DEFAULT, ...(THEMES[key] || {}), key: key || 'room' }
}
