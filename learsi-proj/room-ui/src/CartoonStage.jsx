import './CartoonStage.css'

/**
 * Simple cartoon place — example stage for Stick/Wander to stand/walk in.
 * size: 'side' (chat rail) | 'full' (character / brain)
 */
export default function CartoonStage({
  phase = 'idle',
  size = 'full',
  name = 'Stick',
  caption = '',
  children,
}) {
  const pose =
    phase === 'walking' ? 'walking' : phase === 'visiting' ? 'visiting' : 'idle'

  return (
    <div
      className={`cartoon-stage size-${size} pose-${pose}`}
      aria-live="polite"
    >
      <div className="cartoon-sky" aria-hidden="true">
        <span className="cartoon-cloud c1" />
        <span className="cartoon-cloud c2" />
        <span className="cartoon-sun" />
      </div>

      <div className="cartoon-mid" aria-hidden="true">
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
      </div>

      <div className="cartoon-ground" aria-hidden="true">
        <span className="cartoon-rug" />
      </div>

      <div className="cartoon-actor">
        {children}
        <div className="cartoon-speech">
          <span className="cartoon-name">{name}</span>
          {caption ? (
            <span className="cartoon-caption">{caption}</span>
          ) : null}
        </div>
      </div>
    </div>
  )
}
