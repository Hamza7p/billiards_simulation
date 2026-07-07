import { useEffect, useRef } from 'react';
import cueImage from '@/assets/imgs/cue.png';

const MIN_J = 0.1, MAX_J = 2.7, TICK_COUNT = 10;

export default function ImpulseControl({ value, onChange, disabled, onShoot }) {
  
  const intervalRef = useRef(null);
  const heldRef     = useRef(false);
  const onChangeRef = useRef(onChange);
  const onShootRef  = useRef(onShoot);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    onShootRef.current = onShoot;
  }, [onShoot]);

  const pct  = (value - MIN_J) / (MAX_J - MIN_J);
  const fill = `linear-gradient(to top, #e52d27, #f12711, #f5af19, #f8b500)`;
  const offset = pct * 130;

  // Space bar charge
  useEffect(() => {
    if (disabled) return;

    let currentImpulse = MIN_J;

    function onDown(e) {
      if (e.code !== 'Space' || heldRef.current) return;
      e.preventDefault();
      heldRef.current = true;
      currentImpulse = MIN_J;
      onChangeRef.current({ shotImpulse: Number(currentImpulse.toFixed(2)) });

      const rate = (MAX_J - MIN_J) / 2.5;
      intervalRef.current = window.setInterval(() => {
        currentImpulse = Math.min(currentImpulse + rate * 0.05, MAX_J);
        onChangeRef.current({ shotImpulse: Number(currentImpulse.toFixed(2)) });
      }, 30);
    }

    function onUp(e) {
      if (e.code !== 'Space') return;
      e.preventDefault();
      heldRef.current = false;
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      onChangeRef.current({ shotImpulse: Number(currentImpulse.toFixed(2)) });
      onShootRef.current();
    }

    window.addEventListener('keydown', onDown);
    window.addEventListener('keyup', onUp);
    return () => {
      window.removeEventListener('keydown', onDown);
      window.removeEventListener('keyup', onUp);
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [disabled]);

  const set = (v) => {
    const clamped = Math.max(MIN_J, Math.min(MAX_J, parseFloat(parseFloat(v).toFixed(2))));
    if (!isNaN(clamped)) onChange({ shotImpulse: clamped });
  };

  return (
    <div className="hud-panel impulse-panel">
      <div className="hud-label">Impulse <kbd>Space</kbd></div>
      <div className="impulse-row">

        <div className="impulse-bar-wrap">
          <div className="impulse-bar-fill" style={{ height: `100%`, background: fill }} />
          <img src={cueImage} className="cue-image" 
            style={{
              transform: `
                translateY(${offset}px)
                rotate(-45deg)

              `
            }}
          />  
        </div>

        <div className="impulse-right">
          <div>
            <div className="impulse-val">{value.toFixed(2)}</div>
            <div className="impulse-unit">Δv = J / m</div>
          </div>
          <input
            className="impulse-input"
            type="number" min={MIN_J} max={MAX_J} step="0.1"
            value={value.toFixed(1)}
            disabled={disabled}
            onChange={(e) => set(e.target.value)}
          />
          <div className="tick-row">
            {Array.from({ length: TICK_COUNT }, (_, i) => (
              <div
                key={i}
                className={`tick ${i < Math.round(pct * TICK_COUNT) ? 'lit' : ''}`}
                onClick={() => !disabled && set((i + 1) / TICK_COUNT * MAX_J)}
              />
            ))}
          </div>
        </div>
      </div>
      <input
        type="range" 
        min={MIN_J} 
        max={MAX_J} 
        step="0.1"
        value={value} 
        disabled={disabled}
        onChange={(e) => set(e.target.value)}
        className="impulse-range"
      />
      <button className="button shoot-btn" disabled={disabled} onClick={onShoot}>
        Shoot
      </button>
    </div>
  );
}