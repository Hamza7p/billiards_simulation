import * as vec2 from '../physics/math/Vector2';
import { Engine } from '../physics/core/Engine';
import { Ball } from '../physics/bodies/Ball';
import { SurfaceMaterial } from '../physics/bodies/Surface';
import { applyImpulse } from '@/physics/systems/impulse';
import { updateSimulation } from './updateSimulation';
import { createControls } from './controls';
import { START_POINT } from '@/config/constants';

export function createSimulation() {

  const controls = createControls();
  let simulationTime = 0;
  let isRunning = false;

  const cueBall = Ball({
    radius: controls.ballRadius,
    mass: controls.ballMass,
  });

  // world contains all the physical bodies in the simulation
  const world = {
    balls: [cueBall],
  };

  const surface = SurfaceMaterial({
    gravity: controls.gravity,
    muSliding: controls.muSliding,
  });

  const engine = new Engine((dt) => {

    cueBall.mass = controls.ballMass;
    cueBall.radius = controls.ballRadius;

    surface.muSliding = controls.muSliding;

    if (isRunning) {
      simulationTime += dt;
    }

    updateSimulation({
      world,
      surface,
      dt,
    });

    // check stop timer
    const speed = vec2.length(cueBall.velocity);

    if (speed < 1e-5 && isRunning) {
      cueBall.velocity.x = 0;
      cueBall.velocity.y = 0;

      isRunning = false;
    }
  });

  function shoot() {

    simulationTime = 0;
    isRunning = true;

    const radian = controls.aimDeg * Math.PI / 180;

    const impulse = vec2.create(
      Math.cos(radian) * controls.shotImpulse,
      Math.sin(radian) * controls.shotImpulse,
    );

    applyImpulse(
      cueBall,
      impulse
    );
  }

  function reset() {

    vec2.set(
      cueBall.position,
      START_POINT.x,
      START_POINT.y
    );

    vec2.set(
      cueBall.velocity,
      0,
      0
    );
  }

  return {
    engine,
    controls,
    world,
    cueBall,
    shoot,
    reset,
    getSimulationTime: () => simulationTime,
  };
}