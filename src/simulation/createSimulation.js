
import * as vec3 from '../physics/math/Vector3';
import { Engine } from '../physics/core/Engine';
import { Ball } from '../physics/bodies/Ball';
import { SurfaceMaterial } from '../physics/bodies/Surface';
import { applyImpulse } from '../physics/systems/applyImpulse';
import { integrateMotion } from '../physics/systems/integrateMotion';
import { createControls } from './controls';
import { START_POINT } from '@/config/constants';
import { handleWallCollision } from '../physics/systems/handleWallCollision';
// الصوت
import { playBallHitSound, playWallHitSound, playCueHitSound } from '../physics/systems/SoundManager';
const originalPositions = [];

function handleCollision(ball1, ball2, e, muC) {
  const dx = ball2.position.x - ball1.position.x;
  const dy = ball2.position.y - ball1.position.y;
  const dist = Math.hypot(dx, dy);
  const minDist = ball1.radius + ball2.radius;

  if (dist >= minDist || dist < 1e-10) return false;

  const nx = dx / dist;
  const ny = dy / dist;

  // تصحيح التداخل
  const overlap = (minDist - dist) / 2;
  ball1.position.x -= nx * overlap;
  ball1.position.y -= ny * overlap;
  ball2.position.x += nx * overlap;
  ball2.position.y += ny * overlap;

  const vrelx = ball1.velocity.x - ball2.velocity.x;
  const vrely = ball1.velocity.y - ball2.velocity.y;
  const vrelDotN = vrelx * nx + vrely * ny;

  if (vrelDotN >= 0) return false;

  const m1 = ball1.mass;
  const m2 = ball2.mass;

  // الدفع العمودي
  const Jn = -(1 + e) * vrelDotN / ((1/m1) + (1/m2));
///// الصوت
const intensity = Math.min(Math.abs(Jn) / 2, 1);
playBallHitSound(intensity);
////
  ball1.velocity.x += (Jn / m1) * nx;
  ball1.velocity.y += (Jn / m1) * ny;
  ball2.velocity.x -= (Jn / m2) * nx;
  ball2.velocity.y -= (Jn / m2) * ny;

  // الدفع المماسي
  const tx = -ny;
  const ty = nx;
  const vrelDotT = vrelx * tx + vrely * ty;
  //const muC = 0.2;
  const Jt = -muC * Math.abs(Jn) * Math.sign(vrelDotT || 0);

  ball1.velocity.x += (Jt / m1) * tx;
  ball1.velocity.y += (Jt / m1) * ty;
  ball2.velocity.x -= (Jt / m2) * tx;
  ball2.velocity.y -= (Jt / m2) * ty;

  // تحديث السرعة الزاوية
  const R = ball1.radius;
  const angCoeff = (5 * Jt) / (2 * m1 * R);
  ball1.angularVelocity.z += angCoeff;
  ball2.angularVelocity.z -= angCoeff;

  return true;
}

export function createSimulation() {
  const controls = createControls();
  let simulationTime = 0;
  let isRunning = false;

  const cueBall = Ball({
    radius: controls.ballRadius,
    mass: controls.ballMass,
    position: vec3.create(START_POINT.x, START_POINT.y, 0),
    velocity: vec3.create(0, 0, 0),
  });

  const triangleStartX = 0;
  const triangleStartZ = 0.4;
  const ballSpacing = 0.065;

  const ballColors = [
    0xffd700, 0x007bff, 0xdc3545, 0x6f42c1, 0xfd7e14,
    0x28a745, 0xff69b4, 0x17a2b8, 0xffc107, 0x20c997,
    0x6610f2, 0xffb6c1, 0xe83e8c, 0xc41e3a,
  ];

  const coloredBalls = [];
  let ballIndex = 0;

  for (let row = 0; row < 5; row++) {
    const ballsInRow = row + 1;
    const rowStartX = triangleStartX - (ballsInRow - 1) * ballSpacing / 2;
    for (let col = 0; col < ballsInRow; col++) {
      if (ballIndex >= ballColors.length) break;
      const x = rowStartX + col * ballSpacing;
      const  y= triangleStartZ + row * ballSpacing * 1.2;
      const ball = Ball({
        position: vec3.create(x, y, 0),
        radius: controls.ballRadius,
        mass: controls.ballMass,
      });
      ball.color = ballColors[ballIndex];
      coloredBalls.push(ball);
      ballIndex++;
    }
  }
  ///////


  coloredBalls.forEach(ball => {
    originalPositions.push({ x: ball.position.x, y: ball.position.y });
  });

  const world = {
    balls: [cueBall, ...coloredBalls],
  };

  const surface = SurfaceMaterial({
    gravity: controls.gravity,
    muSliding: controls.muSliding,
  });

  const engine = new Engine((dt) => {
    cueBall.mass = controls.ballMass;
    cueBall.radius = controls.ballRadius;
    surface.muSliding = controls.muSliding;

    if (isRunning) simulationTime += dt;

    // 1 - تصادم كرة-كرة
    for (let i = 0; i < world.balls.length; i++) {
      for (let j = i + 1; j < world.balls.length; j++) {
           handleCollision(world.balls[i], world.balls[j], controls.restitutionBallBall, controls.muCollision);

       //  handleCollision(world.balls[i], world.balls[j], controls.restitutionBallBall);
      }
    }

    // 2 - تصادم مع الحواف
    for (const ball of world.balls) {
      handleWallCollision(ball, controls);
    }

    // 3 - تحديث المواقع + احتكاك (مرة واحدة فقط)
    for (const ball of world.balls) {
      integrateMotion(ball, dt, surface);
    }

    // 4 - إيقاف عند سرعة صغيرة
    let maxSpeed = 0;
    for (const ball of world.balls) {
      const s = Math.hypot(ball.velocity.x, ball.velocity.y);
      if (s > maxSpeed) maxSpeed = s;
    }

    if (maxSpeed < 0.01 && isRunning) {
      for (const ball of world.balls) {
        vec3.set(ball.velocity, 0, 0, 0);
        vec3.set(ball.angularVelocity, 0, 0, 0);
      }
      isRunning = false;
    }
  });

  function shoot() {
    simulationTime = 0;
    isRunning = true;
    // الصوت
  playCueHitSound(controls.shotImpulse / 2); // ← هنا
    //
    const radian = controls.aimDeg * Math.PI / 180;
    const impulse = vec3.create(
      Math.cos(radian) * controls.shotImpulse,
      Math.sin(radian) * controls.shotImpulse,
      0
    );
    applyImpulse(cueBall, impulse);
  }

  function reset() {
    vec3.set(cueBall.position, START_POINT.x, START_POINT.y, 0);
    vec3.set(cueBall.velocity, 0, 0, 0);
    vec3.set(cueBall.angularVelocity, 0, 0, 0);
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