import { themeForRoom } from './roomThemes'
import './CartoonStage.css'

function RoomProps({ kind, label }) {
  if (kind === 'lobby') {
    return (
      <>
        <div className="cartoon-desk">
          <span className="cartoon-desk-top" />
          <span className="cartoon-desk-sign">{label}</span>
        </div>
        <div className="cartoon-coat">
          <span className="cartoon-hook" />
          <span className="cartoon-hook" />
        </div>
        <div className="cartoon-door">
          <span className="cartoon-door-knob" />
          <span className="cartoon-door-sign">IN</span>
        </div>
      </>
    )
  }
  if (kind === 'garden') {
    return (
      <>
        <div className="cartoon-bush b1" />
        <div className="cartoon-bush b2" />
        <div className="cartoon-flower f1" />
        <div className="cartoon-flower f2" />
        <div className="cartoon-flower f3" />
        <div className="cartoon-path-stone" />
        <div className="cartoon-door outdoor">
          <span className="cartoon-door-sign">OUT</span>
        </div>
      </>
    )
  }
  if (kind === 'studio') {
    return (
      <>
        <div className="cartoon-window tall">
          <span className="cartoon-pane" />
          <span className="cartoon-pane" />
          <span className="cartoon-pane" />
          <span className="cartoon-pane" />
        </div>
        <div className="cartoon-easel">
          <span className="cartoon-canvas" />
          <span className="cartoon-leg" />
        </div>
        <div className="cartoon-splat" />
        <div className="cartoon-door">
          <span className="cartoon-door-knob" />
          <span className="cartoon-door-sign">IN</span>
        </div>
      </>
    )
  }
  return (
    <>
      <div className="cartoon-window">
        <span className="cartoon-pane" />
        <span className="cartoon-pane" />
        <span className="cartoon-pane" />
        <span className="cartoon-pane" />
      </div>
      <div className="cartoon-door">
        <span className="cartoon-door-knob" />
        <span className="cartoon-door-sign">IN</span>
      </div>
      <div className="cartoon-plant">
        <span className="cartoon-leaf l1" />
        <span className="cartoon-leaf l2" />
        <span className="cartoon-pot" />
      </div>
    </>
  )
}

/**
 * Cartoon place for Stick/Wander.
 * size: bleed (full screen) | full | side | mini
 * showActor: render children on the stage floor
 */
export default function CartoonStage({
  phase = 'idle',
  size = 'full',
  room = 'lobby',
  name = 'Stick',
  caption = '',
  showActor = true,
  jumping = false,
  children,
}) {
  const theme = themeForRoom(room)
  const pose =
    phase === 'walking' ? 'walking' : phase === 'visiting' ? 'visiting' : 'idle'

  const style = {
    '--stage-sky': theme.sky[0],
    '--stage-sky-deep': theme.sky[1],
    '--stage-wall': theme.wall,
    '--stage-floor': theme.floor[0],
    '--stage-floor-deep': theme.floor[1],
    '--stage-accent': theme.accent,
  }

  return (
    <div
      className={[
        'cartoon-stage',
        `size-${size}`,
        `pose-${pose}`,
        `theme-${theme.props}`,
        jumping ? 'is-jumping' : '',
        showActor ? 'has-actor' : 'no-actor',
      ]
        .filter(Boolean)
        .join(' ')}
      style={style}
      data-room={theme.key}
      aria-live="polite"
    >
      <div className="cartoon-sky" aria-hidden="true">
        <span className="cartoon-cloud c1" />
        <span className="cartoon-cloud c2" />
        <span className="cartoon-sun" />
        <span className="cartoon-room-tag">{theme.label}</span>
      </div>

      <div className="cartoon-mid" aria-hidden="true">
        <RoomProps kind={theme.props} label={theme.label} />
      </div>

      <div className="cartoon-ground" aria-hidden="true">
        <span className="cartoon-rug" />
      </div>

      {showActor ? (
        <div className={`cartoon-actor ${jumping ? 'jump-in' : ''}`}>
          {children}
          <div className="cartoon-speech">
            <span className="cartoon-name">{name}</span>
            {caption ? (
              <span className="cartoon-caption">{caption}</span>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  )
}
