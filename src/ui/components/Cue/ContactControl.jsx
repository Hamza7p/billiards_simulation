import { useEffect, useRef } from 'react';

export default function ContactControl({ contactX, contactY, onChange, onShoot, disabled }) {
  const wrapRef  = useRef(null);
  const dragging = useRef(false);

  const applyContact = (e) => {
    const r  = wrapRef.current.getBoundingClientRect();
    const nx =  (e.clientX - (r.left + r.width  / 2)) / (r.width  * 0.42);
    const ny = -(e.clientY - (r.top  + r.height / 2)) / (r.height * 0.42);
    if (nx * nx + ny * ny > 1) return;
    onChange({
      contactX: parseFloat(Math.max(-1, Math.min(1, nx)).toFixed(2)),
      contactY: parseFloat(Math.max(-1, Math.min(1, ny)).toFixed(2)),
    });
  };

  useEffect(() => {
    const onMove = (e) => { if (dragging.current) applyContact(e); };
    const onUp   = ()  => { dragging.current = false; };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup',   onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup',   onUp);
    };
  }, [onChange]);

  useEffect(() => {
    if (disabled) return;
    const STEP = 0.05;
    function onKey(e) {
      const cl = (v) => parseFloat(Math.max(-1, Math.min(1, v)).toFixed(2));
      if (e.code === 'KeyW') onChange({ contactY: cl(contactY + STEP) });
      if (e.code === 'KeyS') onChange({ contactY: cl(contactY - STEP) });
      if (e.code === 'KeyA') onChange({ contactX: cl(contactX - STEP) });
      if (e.code === 'KeyD') onChange({ contactX: cl(contactX + STEP) });
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [disabled, contactX, contactY, onChange]);

  const dotX = 50 + contactX * 42;
  const dotY = 50 - contactY * 42;

  return (
    <div className="hud-panel contact-panel">
      <div className="hud-label">Contact <kbd>W A S D</kbd></div>

      <div
        ref={wrapRef}
        className="ball-wrap"
        onMouseDown={(e) => { if (!disabled) { dragging.current = true; applyContact(e); } }}
        onClick={(e)      => { if (!disabled) applyContact(e); }}
      >
        <svg viewBox="0 0 110 110" width="110" height="110">
          <defs>
            <radialGradient id="bg" cx="38%" cy="32%" r="65%">
              <stop offset="0%" stopColor="#f8f8f0"/>
              <stop offset="100%" stopColor="#d0d0c4"/>
            </radialGradient>
            <clipPath id="bClip"><circle cx="55" cy="55" r="46"/></clipPath>
          </defs>
          <circle cx="55" cy="55" r="46" fill="url(#bg)"/>
          <circle cx="55" cy="55" r="46" fill="none" stroke="var(--border-strong)" strokeWidth="0.5"/>
          <g clipPath="url(#bClip)" opacity="0.15">
            <line x1="55" y1="9" x2="55" y2="101" stroke="var(--border-stronger)" strokeWidth="0.5"/>
            <line x1="9" y1="55" x2="101" y2="55" stroke="var(--border-stronger)" strokeWidth="0.5"/>
            <ellipse cx="55" cy="55" rx="23" ry="46" fill="none" stroke="var(--border-stronger)" strokeWidth="0.5"/>
            <ellipse cx="55" cy="55" rx="46" ry="18" fill="none" stroke="var(--border-stronger)" strokeWidth="0.5"/>
          </g>
          {/* centre reference dot */}
          <circle cx="55" cy="55" r="2.5" fill="#cc1111" opacity="0.5"/>
          {/* contact marker */}
          <circle
            cx={55 + contactX * 42}
            cy={55 - contactY * 42}
            r="5" fill="#e24b4a" stroke="#fff" strokeWidth="1.5"
          />
        </svg>
      </div>

      <div className="dir-vals">
        <div className="dir-val-row">
          <span className="dir-val-label">X left/right</span>
          <span className="dir-val-num">{contactX.toFixed(2)}</span>
        </div>
        <div className="dir-val-row">
          <span className="dir-val-label">Y top/bottom</span>
          <span className="dir-val-num">{contactY.toFixed(2)}</span>
        </div>
      </div>

      {/* <button className="shoot-btn" disabled={disabled} onClick={onShoot}>
        Shoot
      </button> */}
    </div>
  );
}