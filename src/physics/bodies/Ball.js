
import { BALL, START_POINT } from '@/global/constants.js';
import * as vec3 from '../math/Vector3.js';
import { Quaternion } from 'three';

/** @param {object} [opts] */
export const Ball = (opts = {}) => {
  const mass = opts.mass ?? BALL.mass;
  const radius = opts.radius ?? BALL.radius;

  return {
    mass,
    radius,
    position: opts.position != null
      ? vec3.clone(opts.position)
      : vec3.create(START_POINT.x, START_POINT.y, START_POINT.z),
    velocity: opts.velocity != null
      ? vec3.clone(opts.velocity)
      : vec3.create(0, 0, 0),
    angularVelocity: vec3.create(0, 0, 0),
    orientation: new Quaternion(),
    distanceTraveled: 0,
  };
};
