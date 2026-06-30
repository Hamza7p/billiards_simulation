import { BALL, SURFACE } from '@/global/constants';

export function createControls() {
  return {
    shotImpulse: 1,
    aimDeg: 0,
    cueElevDeg: 0,
    contactX: 0,
    contactY: 0,
    contactZ: 0,
    muSliding: SURFACE.muSliding,
    muRolling: SURFACE.muRolling,
    spinDamping: SURFACE.spinDamping,
    gravity: SURFACE.gravity,
    ballMass: BALL.mass,
    ballRadius: BALL.radius,
    cameraMode: 'perspective',
  };
}
