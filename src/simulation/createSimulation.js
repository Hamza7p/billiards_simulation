import * as vec3 from '../physics/math/Vector3';
import { Engine } from '../physics/core/Engine';
import { Ball } from '../physics/bodies/Ball';
import { SurfaceMaterial } from '../physics/bodies/Surface';
import { applyImpulseAtContact } from '@/physics/systems/impulse';
import { computeStrike } from '@/physics/systems/strike';
import { updateSimulation } from './updateSimulation';
import { createControls } from '../physics/metrics/controls';
import { START_POINT, PHYSICS } from '@/config/constants';
import { calculateMetrics } from '@/physics/metrics/metrics';

export function createSimulation() {
  const controls = createControls();
  let simulationTime = 0;
  let isRunning = false;

  const cueBall = Ball({
    radius: controls.ballRadius,
    mass: controls.ballMass,
  });

  const world = {
    balls: [cueBall],
  };

  const surface = SurfaceMaterial({
    gravity: controls.gravity,
    muSliding: controls.muSliding,
    muRolling: controls.muRolling,
    spinDamping: controls.spinDamping,
  });

  const engine = new Engine((dt) => {
    cueBall.mass = controls.ballMass;
    cueBall.radius = controls.ballRadius;

    surface.muSliding = controls.muSliding;
    surface.muRolling = controls.muRolling;
    surface.spinDamping = controls.spinDamping;
    surface.gravity = controls.gravity;

    if (isRunning) {
      simulationTime += dt;
    }

    updateSimulation({ world, surface, dt });

    const speed = Math.hypot(cueBall.velocity.x, cueBall.velocity.y);
    const spin = vec3.length(cueBall.angularVelocity);

    if (speed < PHYSICS.stopSpeed && spin < PHYSICS.stopAngular && isRunning) {
      vec3.zero(cueBall.velocity);
      vec3.zero(cueBall.angularVelocity);
      isRunning = false;
    }
  });

  function shoot() {
    simulationTime = 0;
    isRunning = true;

    const { impulse, r } = computeStrike(cueBall, controls);

    applyImpulseAtContact(cueBall, impulse, r);
  }

  function reset() {
    vec3.set(
      cueBall.position,
      START_POINT.x,
      START_POINT.y,
      START_POINT.z
    );

    vec3.zero(cueBall.velocity);
    vec3.zero(cueBall.angularVelocity);
    vec3.zero(cueBall.orientation);

    cueBall.distanceTraveled = 0;
    simulationTime = 0;
    isRunning = false;
  }

  return {
    engine,
    controls,
    world,
    cueBall,
    shoot,
    reset,
    getSimulationTime: () => simulationTime,
    getMetrics: () =>
      calculateMetrics({
        ball: cueBall,
        surface,
        simulationTime,
      }),
  };
}
