import ImpulseControl  from './ImpulseControl';
import DirectionControl from './DirectionControl';
import ContactControl  from './ContactControl';
import './CueHUD.css';

export default function CueHUD({ controls, onChange, onShoot, isMoving }) {
  if (isMoving) return null;

  return (
    <div className="cue-hud" 
    dir='ltr'
    >
      <ImpulseControl
        value={controls.shotImpulse}
        onChange={onChange}
        onShoot={onShoot}
        disabled={false}
      />
      <DirectionControl
        aimDeg={controls.aimDeg}
        elevDeg={controls.cueElevDeg}
        onChange={onChange}
        disabled={false}
      />
      <ContactControl
        contactX={controls.contactX}
        contactY={controls.contactY}
        onChange={onChange}
        onShoot={onShoot}
        disabled={false}
      />
    </div>
  );
}