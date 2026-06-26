import { useEffect, useRef, useState } from 'react';

import BilliardsScene from '../render/scene/BilliardsScene';
import SimulationPanel from '../ui/panels/SimulationPanel';
import { createSimulation } from '../simulation/createSimulation';
import { createControls } from '../simulation/controls';
import { TABLE } from '@/config/constants';

export default function App() {

  const sceneRef = useRef(null);
  const simRef = useRef(null);
  const animationRef = useRef(0);

  // =========================
  // UI Reactive State
  // =========================

  const [uiState, setUiState] = useState({

    controls: createControls(),

    stats: {
      speed: 0,
      x: 0,
      y: 0,
      time: 0,
      ballSpeeds: [], 
 
  
    },
  });

  useEffect(() => {

    const sim = createSimulation();
    simRef.current = sim;
    sim.engine.start();

function renderLoop() {
  const cueBall = sim.cueBall;
  const r = cueBall.radius;


  sceneRef.current?.sync(cueBall, sim.controls, sim.world.balls);


const ballSpeeds = sim.world.balls
  .filter(ball => ball.color) // نأخذ الكرات الملونة فقط
  .map((ball) => ({
    color: ball.color,
    speed: Math.hypot(ball.velocity.x, ball.velocity.y),
  }));
  // =========================
  // Update UI State
  // =========================
  setUiState({
    controls: {
      ...sim.controls,
    },
    stats: {
      speed: Math.hypot(cueBall.velocity.x, cueBall.velocity.y),
      x: cueBall.position.x,
      y: cueBall.position.y,
      time: sim.getSimulationTime(),
      ballSpeeds, 
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
  console.log("🔄 Reset clicked!");
  
  // 1. إعادة ضبط الفيزياء (الكرات ترجع للمثلث)
  simRef.current?.reset();
  
  // 2. تحديث المشهد بعد 100ms عشان الكرات تظهر في مكانها
  setTimeout(() => {
    const sim = simRef.current;
    if (sim) {
      sceneRef.current?.sync(
        sim.cueBall,
        sim.controls,
        sim.world.balls
      );
    }
  }, 100);
}

  function updateControls(patch) {

    const sim = simRef.current;

    if (!sim) return;

    Object.assign(
      sim.controls,
      patch
    );

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
          controls={uiState.controls}
          stats={uiState.stats}
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