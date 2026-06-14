import { useEffect, useRef, useState } from 'react';

import BilliardsScene from '../render/scene/BilliardsScene';
import SimulationPanel from '../ui/panels/SimulationPanel';
import { createSimulation } from '../simulation/createSimulation';
import { createControls } from '../physics/metrics/controls';
import { TABLE } from '@/config/constants';
import { initialMetrics } from '@/physics/metrics/metrics';

export default function App() {

  const sceneRef = useRef(null);
  const simRef = useRef(null);
  const animationRef = useRef(0);

  // =========================
  // UI Reactive State
  // =========================

  const [controls, setControls] = useState(createControls());
  const [metrics, setMetrics] = useState(initialMetrics());

  const [uiState, setUiState] = useState({

    controls: createControls(),

    stats: {
      speed: 0,
      x: 0,
      y: 0,
      time: 0,
    },
  });

  useEffect(() => {

    const sim = createSimulation();
    simRef.current = sim;
    sim.engine.start();

    function renderLoop() {

      const cueBall = sim.cueBall;

      const r = cueBall.radius;

      // =========================
      // Wall Collision
      // =========================

      if (cueBall.position.x + r > TABLE.maxX) {

        cueBall.position.x = TABLE.maxX - r;
        cueBall.velocity.x *= -1;
      }

      if (cueBall.position.x - r < TABLE.minX) {

        cueBall.position.x = TABLE.minX + r;
        cueBall.velocity.x *= -1;
      }

      if (cueBall.position.y + r > TABLE.maxY) {

        cueBall.position.y = TABLE.maxY - r;
        cueBall.velocity.y *= -1;
      }

      if (cueBall.position.y - r < TABLE.minY) {

        cueBall.position.y = TABLE.minY + r;
        cueBall.velocity.y *= -1;
      }

      // =========================
      // Sync Three.js
      // =========================

      sceneRef.current?.sync(cueBall,  sim.controls);

      // =========================
      // Update UI State
      // =========================

      setControls(sim.controls);
      setMetrics(sim.getMetrics);

      setUiState({

        controls: {
          ...sim.controls,
        },

        stats: {

          speed: Math.hypot(
            cueBall.velocity.x,
            cueBall.velocity.y
          ),
          x: cueBall.position.x,
          y: cueBall.position.y,
          time: sim.getSimulationTime(),
        }, 
      });

      animationRef.current = requestAnimationFrame(renderLoop);
    }

    renderLoop();

    return () => {

      cancelAnimationFrame(
        animationRef.current 
      );

      sim.engine.stop();
    };

  }, []);

  // =========================
  // Commands
  // =========================

  function shoot() {

    simRef.current?.shoot();
  }

  function reset() {

    simRef.current?.reset();
  }

  function updateControls(patch) {

    const sim = simRef.current;

    if (!sim) return;

    Object.assign(
      sim.controls,
      patch
    );

    setControls(sim.controls);
    setUiState(prev => ({

      ...prev,

      controls: {
        ...sim.controls,
      },
    }));
  }

  return (

    <div className='screen'>

      {/* ========================= */}
      {/* Controls */}
      {/* ========================= */}

      <div className='control-panel'>

        <SimulationPanel
          controls={controls}
          stats={metrics}
          onShoot={shoot}
          onReset={reset}
          onChange={updateControls}
        />
      </div>

      {/* ========================= */}
      {/* Scene */}
      {/* ========================= */}

      <div className='scene'>

        <BilliardsScene
          ref={sceneRef}
        />
      </div>
    </div>
  );
}