import { useEffect, useRef, useState } from 'react';
import BilliardsScene from '../render/scene/BilliardsScene';
import SimulationPanel from '../ui/panels/SimulationPanel';
import { createSimulation } from '../simulation/createSimulation';
import { createControls } from '../physics/metrics/controls';
import { initialMetrics } from '@/physics/metrics/metrics';
import { ArrowLeft } from "@deemlol/next-icons"
import CueHUD from '@/ui/components/Cue/CueHUD';

export default function App() {
  const sceneRef = useRef(null);
  const simRef = useRef(null);
  const animationRef = useRef(0);

  const [controls, setControls] = useState(createControls());
  const [metrics, setMetrics] = useState(initialMetrics());
  const [slidingOpen, setSlidingOpen] = useState(false);
  const [isMoving, setIsMoving] = useState(false);


  useEffect(() => {
    const sim = createSimulation();
    simRef.current = sim;
    sim.engine.start();

    function renderLoop() {
      
      const states = sim.world.balls.map(b => ({
        position:    b.position,
        orientation: b.orientation,
      }));

      const speed = sim.world.balls.reduce((s, b) =>
        s + Math.hypot(b.velocity?.x ?? 0, b.velocity?.y ?? 0), 0
      );
      let checkIsMoving = speed > 0.001;
      sceneRef.current?.sync(states, sim.controls, checkIsMoving);
      setIsMoving(checkIsMoving);

      setControls({ ...sim.controls });
      setMetrics(sim.getMetrics());

      animationRef.current = requestAnimationFrame(renderLoop);
    }

    renderLoop();

    return () => {
      cancelAnimationFrame(animationRef.current);
      sim.engine.stop();
    };
  }, []);

  function shoot() {
    simRef.current?.shoot();
  }

  function reset() {
    simRef.current?.reset();
  }

  function resetCamera() {
    sceneRef.current?.resetCamera();
  }

  function updateControls(patch) {
    const sim = simRef.current;
    if (!sim) return;

    Object.assign(sim.controls, patch);
    setControls({ ...sim.controls });
  }

  return (
    <div className="screen">
      <div className='control-panel'
        style={{
          flex: slidingOpen? 1: undefined,
          minWidth: slidingOpen?"320px": undefined
        }}
      >
 
        {slidingOpen ? 
        <SimulationPanel
          controls={controls}
          stats={metrics}
          onShoot={shoot}
          onReset={reset}
          onResetCamera={resetCamera}
          onChange={updateControls}
          setSliding={setSlidingOpen}
        />
        : <button 
          style={{ position: "absolute", top:1, right:0, zIndex: 10, width: "50px", height: "50px"}}
          onClick={() => setSlidingOpen(true)}
        >
            <ArrowLeft />
          </button>
      }
      </div>

      <div className="scene">
        <BilliardsScene ref={sceneRef} />
        <CueHUD
          controls={controls}
          onChange={updateControls}
          onShoot={shoot}
          isMoving={isMoving}
        />
      </div>

    </div>
  );
}
