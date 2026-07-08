import * as vec3 from '../physics/math/Vector3';
import { Engine }          from '../physics/core/Engine';
import { Ball }            from '../physics/bodies/Ball';
import { SurfaceMaterial } from '../physics/bodies/Surface';
import { applyStrike }     from '@/physics/systems/strike';
import { updateSimulation } from './updateSimulation';
import { createControls }  from '../physics/metrics/controls';
import { calculateMetrics } from '@/physics/metrics/metrics';
import { START_POINT, PHYSICS } from '@/global/constants';
import { RACK_ORDER, calcRackPositions } from '@/global/ballsTriangle';
import { findNearestFreePosition } from './ballPlacement';


// ─── Factory ──────────────────────────────────────────────────────────────
export function createSimulation() {
  const controls = createControls();
  const defaultControls = createControls();  // Save defaults for reset
  let simulationTime = 0;
  let isRunning = false;
  let pendingRespawn = null;
  let respawnTimer = 0;

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

    if (pendingRespawn) {
      respawnTimer += dt;
      if (respawnTimer >= 0.8) {
        const { ball, position } = pendingRespawn;
        vec3.set(ball.position, position.x, position.y, 0);
        ball.pocketed = false;
        ball.jumpedOff = false;
        ball.pocketedAt = null;
        ball.jumpedOffAt = null;
        pendingRespawn = null;
        respawnTimer = 0;
      }
    }

    updateSimulation({ world, surface, dt, controls });

    // stop check — only active balls must be at rest
    const activeBalls = world.balls.filter((b) => !b.pocketed && !b.jumpedOff);
    const allStopped = activeBalls.length === 0 || activeBalls.every((b) => {
      const speed = vec3.length(b.velocity);
      const spin  = vec3.length(b.angularVelocity);
      return speed < PHYSICS.stopSpeed && spin < PHYSICS.stopAngular;
    });

    if (allStopped && !pendingRespawn) {
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

  function requestBallPlacement(ball, targetPoint) {
    const position = findNearestFreePosition(targetPoint, ball.radius, world.balls, ball);
    pendingRespawn = { ball, position };
    respawnTimer = 0;
    isRunning = false;
  }

  function reset() {
    // Reset all ball states
    world.balls.forEach((ball) => {
      ball.pocketed   = false;
      ball.jumpedOff  = false;
      ball.distanceTraveled = 0;
      vec3.zero(ball.velocity);
      vec3.zero(ball.angularVelocity);
    });

    // cue ball → head spot
    vec3.set(cueBall.position, START_POINT.x, START_POINT.y, 0);

    // rack balls → original positions
    rackPositions.forEach((pos, i) => {
      vec3.set(rackBalls[i].position, pos.x, pos.y, 0);
    });

    // Reset controls to defaults
    Object.assign(controls, defaultControls);

    pendingRespawn = null;
    respawnTimer = 0;
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
    requestBallPlacement,
  };
}