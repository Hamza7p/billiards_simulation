import * as vec2 from '../math/Vector2';
import { BALL, START_POINT, SURFACE } from "@/config/constants";


export function calculateMetrics({
  ball,
  surface,
  simulationTime,
}) {

  const speed = vec2.length(ball.velocity);

  const momentum =
    ball.mass *
    speed;

  const kineticEnergy =
    0.5 *
    ball.mass *
    speed *
    speed;

  const frictionForce =
    surface.muSliding *
    ball.mass *
    surface.gravity;

  const acceleration = frictionForce / ball.mass;

  return {
    speed,
    momentum,
    kineticEnergy,
    frictionForce,
    acceleration,
    distanceTraveled: ball.distanceTraveled ?? 0,
    simulationTime,
    position : {
      x : ball.position.x,
      y : ball.position.y
    }
  };
}

export function initialMetrics() {

    const frictionForce = 
      (SURFACE.muSliding ?? 0 ) *
      (SURFACE.gravity ?? 0) *
      (BALL.mass ?? 0);

    const acceleration = frictionForce / (BALL.mass ?? 0);

    return {
      speed: 0,
      momentum: 0,
      kineticEnergy: 0,
      frictionForce: frictionForce,
      acceleration: acceleration,
      distanceTraveled: 0,
      simulationTime: 0,
      position : {
        x : START_POINT.x,
        y : START_POINT.y
      }
    }
}