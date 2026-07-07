import * as vec3 from '../physics/math/Vector3';
import { Engine }          from '../physics/core/Engine';
import { Ball }            from '../physics/bodies/Ball';
import { SurfaceMaterial } from '../physics/bodies/Surface';
import { applyStrike }     from '@/physics/systems/strike';
import { updateSimulation } from './updateSimulation';
import { createControls }  from '../physics/metrics/controls';
import { calculateMetrics } from '@/physics/metrics/metrics';
import { START_POINT, PHYSICS } from '@/global/constants';
import { Quaternion } from 'three';
import { RACK_ORDER, calcRackPositions } from '@/global/ballsTriangle';


// ─── Factory ──────────────────────────────────────────────────────────────
export function createSimulation() {
  const controls = createControls();
  let simulationTime = 0;
  let isRunning = false;

  // cue ball
  const cueBall = Ball({
    radius:   controls.ballRadius,
    mass:     controls.ballMass,
    position: { x: START_POINT.x, y: START_POINT.y, z: START_POINT.z },
  });

  // rack balls
  const rackPositions = calcRackPositions();
  const rackBalls = RACK_ORDER.map((num, i) =>
    Ball({
      radius:   controls.ballRadius,
      mass:     controls.ballMass,
      position: { x: rackPositions[i].x, y: rackPositions[i].y, z: 0 },
    })
  );

  const world = {
    balls: [cueBall, ...rackBalls],   // index 0 = cueBall always
  };

  const surface = SurfaceMaterial({
    gravity:     controls.gravity,
    muSliding:   controls.muSliding,
    muRolling:   controls.muRolling,
    spinDamping: controls.spinDamping,
  });

  // ── Engine tick ───────────────────────────────────────────────────────
  const engine = new Engine((dt) => {
    // sync live controls → physics properties
    cueBall.mass   = controls.ballMass;
    cueBall.radius = controls.ballRadius;

    rackBalls.forEach((ball) => {
      ball.mass = controls.ballMass;
      ball.radius = controls.ballRadius;
    });

    surface.muSliding   = controls.muSliding;
    surface.muRolling   = controls.muRolling;
    surface.spinDamping = controls.spinDamping;
    surface.gravity     = controls.gravity;

    if (isRunning) simulationTime += dt;

    updateSimulation({ world, surface, dt });

    // stop check — only based on cue ball
    const speed = Math.hypot(cueBall.velocity.x, cueBall.velocity.y);
    const spin  = vec3.length(cueBall.angularVelocity);

    if (isRunning && speed < PHYSICS.stopSpeed && spin < PHYSICS.stopAngular) {
      world.balls.forEach(b => {
        if (b.pocketed || b.jumpedOff) return;
        vec3.zero(b.velocity);
        vec3.zero(b.angularVelocity);
      });
      isRunning = false;
    }
  });

  // ── Actions ───────────────────────────────────────────────────────────
  function shoot() {
    if (cueBall.pocketed) return;
    simulationTime = 0;
    isRunning = true;
    applyStrike(cueBall, controls);
  }

  function reset() {
    world.balls.forEach((ball) => {
      ball.pocketed   = false;
      ball.jumpedOff  = false;
      ball.distanceTraveled = 0;
      ball.orientation = new Quaternion();
      vec3.zero(ball.velocity);
      vec3.zero(ball.angularVelocity);
    });

    // cue ball → head spot
    vec3.set(cueBall.position, START_POINT.x, START_POINT.y, 0);

    // rack balls → original positions
    rackPositions.forEach((pos, i) => {
      vec3.set(rackBalls[i].position, pos.x, pos.y, 0);
    });

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
    getMetrics: () => calculateMetrics({ ball: cueBall, surface, simulationTime }),
  };
}