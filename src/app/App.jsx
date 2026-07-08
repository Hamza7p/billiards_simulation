import { useEffect, useRef, useState } from 'react';
import BilliardsScene from '../render/scene/BilliardsScene';
import SimulationPanel from '../ui/panels/SimulationPanel';
import { createSimulation } from '../simulation/createSimulation';
import { createControls } from '../physics/metrics/controls';
import { initialMetrics } from '@/physics/metrics/metrics';
import { resolveBallReturn } from '@/physics/systems/collisions';
import { findNearestFreePosition } from '../simulation/ballPlacement';
import { ArrowLeft } from "@deemlol/next-icons"
import CueHUD from '@/ui/components/Cue/CueHUD';

export default function App() {
  const sceneRef = useRef(null);
  const simRef = useRef(null);
  const animationRef = useRef(0);
  const placementActiveRef = useRef(false);

  const [controls, setControls] = useState(createControls());
  const [metrics, setMetrics] = useState(initialMetrics());
  const [slidingOpen, setSlidingOpen] = useState(false);
  const [isMoving, setIsMoving] = useState(false);

  useEffect(() => {
    const sim = createSimulation();
    simRef.current = sim;
    sim.engine.start();

    // Wire the scene's click-to-place UI to the actual cue-ball reset.
    sceneRef.current?.setPlacementResolver((clickPoint) => {
      placeCueBall(sim, clickPoint);
      sceneRef.current?.setPlacementEnabled(false);
      placementActiveRef.current = false;
    });

    function renderLoop() {
      const states = sim.world.balls.map(b => ({
        position:    b.position,
        orientation: b.orientation,
      }));

      const speed = sim.world.balls.reduce((s, b) =>
        s + Math.hypot(b.velocity?.x ?? 0, b.velocity?.y ?? 0), 0
      );
      const checkIsMoving = speed > 0.001;

      autoReturnJumpedObjectBalls(sim);
      syncCuePlacementMode(sim, sceneRef.current, checkIsMoving, placementActiveRef);

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

// ── Ball-in-hand placement (cue ball only) ─────────────────────────────────
// The cue ball needs manual placement once it's pocketed or jumps off the
// table. Enables/disables the scene's click-to-place UI only when the need
// actually changes state (no redundant calls every frame).

function syncCuePlacementMode(sim, scene, isMoving, placementActiveRef) {
  const cueBall = sim.world.balls[0];
  const needsPlacement = !isMoving && (cueBall.pocketed || cueBall.jumpedOff);

  if (needsPlacement === placementActiveRef.current) return;

  placementActiveRef.current = needsPlacement;
  scene?.setPlacementEnabled(needsPlacement);
}

function placeCueBall(sim, clickPoint) {
  const cueBall = sim.world.balls[0];
  const target = findNearestFreePosition(
    clickPoint,
    sim.controls.ballRadius,
    sim.world.balls,
    cueBall,
  );

  resolveBallReturn(cueBall, { x: target.x, y: target.y, z: 0 });
}

// ── Auto-return for jumped object balls ────────────────────────────────────
// Object balls that jump off the table are put back automatically at the
// nearest legal spot — no user interaction needed. Balls legally pocketed
// are left untouched.

function autoReturnJumpedObjectBalls(sim) {
  const cueBall = sim.world.balls[0];

  sim.world.balls.forEach((ball) => {
    if (ball === cueBall) return;   // cue ball is handled via manual placement
    if (!ball.jumpedOff) return;

    const target = findNearestFreePosition(
      { x: ball.position.x, y: ball.position.y },
      sim.controls.ballRadius,
      sim.world.balls,
      ball,
    );

    resolveBallReturn(ball, { x: target.x, y: target.y, z: 0 });
  });
}