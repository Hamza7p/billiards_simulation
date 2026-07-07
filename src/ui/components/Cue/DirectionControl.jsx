import { useEffect, useRef } from 'react';

export default function DirectionControl({ aimDeg, elevDeg, onChange, disabled }) {
  const discRef = useRef(null);
  const dragging = useRef(false);

  const applyClick = (e) => {
    const r = discRef.current.getBoundingClientRect();
    const dx = e.clientX - (r.left + r.width  / 2);
    const dy = e.clientY - (r.top  + r.height / 2);
    const deg = Math.round(Math.atan2(dx, -dy) * 180 / Math.PI);
    onChange({ aimDeg: Math.max(-180, Math.min(180, deg)) });
  };

  useEffect(() => {
    const onMove = (e) => { if (dragging.current) applyClick(e); };
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
    function onKey(e) {
      if (e.code === 'ArrowLeft')  { e.preventDefault(); onChange({ aimDeg: aimDeg - 2 }); }
      if (e.code === 'ArrowRight') { e.preventDefault(); onChange({ aimDeg: aimDeg + 2 }); }
      if (e.code === 'ArrowUp')    { e.preventDefault(); onChange({ cueElevDeg: Math.min(elevDeg + 1, 80) }); }
      if (e.code === 'ArrowDown')  { e.preventDefault(); onChange({ cueElevDeg: Math.max(elevDeg - 1, 1) }); }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [disabled, aimDeg, elevDeg, onChange]);

  return (
    <div className="hud-panel dir-panel">
      <div className="hud-label">Direction <kbd>← →</kbd></div>

      <div
        ref={discRef}
        className="dir-disc"
        onMouseDown={(e) => { if (!disabled) { dragging.current = true; applyClick(e); } }}
        onClick={(e)      => { if (!disabled)  applyClick(e); }}
      >
        <svg viewBox="0 0 120 120" width="100%" height="100%">
          <circle cx="60" cy="60" r="56" fill="none" stroke="var(--border)" strokeWidth="0.5"/>
          <circle cx="60" cy="60" r="38" fill="none" stroke="var(--border)" strokeWidth="0.5" strokeDasharray="3 3"/>
          <circle cx="60" cy="60" r="18" fill="none" stroke="var(--border)" strokeWidth="0.5"/>
          {[['60','10','60','18'],['60','102','60','110'],['10','60','18','60'],['102','60','110','60']].map(([x1,y1,x2,y2],i)=>(
            <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="var(--border-strong)" strokeWidth="1"/>
          ))}
          <text x="60" y="9"   textAnchor="middle" fontSize="8" fill="var(--text-muted)">0°</text>
          <text x="115" y="63" textAnchor="middle" fontSize="8" fill="var(--text-muted)">90°</text>
          <text x="5"   y="63" textAnchor="middle" fontSize="8" fill="var(--text-muted)">-90°</text>

          {/* arrow */}
          <g transform={`rotate(${aimDeg}, 60, 60)`}>
            <line x1="60" y1="60" x2="60" y2="18" stroke="var(--fill-accent)" strokeWidth="2"/>
            <polygon points="56,20 60,12 64,20" fill="var(--fill-accent)"/>
          </g>
        </svg>
      </div>

      <div className="dir-vals">
        <div className="dir-val-row">
          <span className="dir-val-label">φ aim</span>
          <span className="dir-val-num">{aimDeg.toFixed(1)}°</span>
        </div>
        <div className="dir-val-row">
          <span className="dir-val-label">θ elev</span>
          <span className="dir-val-num">{elevDeg.toFixed(1)}°</span>
        </div>
      </div>

      <div className="elev-row">
        <div>
          <span className="dir-val-label" style={{whiteSpace:'nowrap'}}>Elev <kbd>↑ ↓</kbd></span>
          <span className="dir-val-num" style={{minWidth:28,textAlign:'right', marginLeft: '15px'}}>{elevDeg}°</span>
        </div>
        <input
          type="range" min="5" max="80" step="1"
          value={elevDeg} disabled={disabled}
          onChange={(e) => onChange({ cueElevDeg: parseInt(e.target.value) })}
          className="elev-range"
        />
      </div>
    </div>
  );
}