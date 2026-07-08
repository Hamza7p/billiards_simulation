import { BALL, PHYSICS, SURFACE } from '@/global/constants';

export function createControls() {
  return {
    shotImpulse: 0.6,
    aimDeg: 0,
    cueElevDeg: 5,
    contactX: 0,
    contactY: 0,
    muSliding: SURFACE.muSliding,
    muRolling: SURFACE.muRolling,
    spinDamping: SURFACE.spinDamping,
    gravity: SURFACE.gravity,
    ballMass: BALL.mass,
    ballRadius: BALL.radius,
    eBall: PHYSICS.ballRestitution ?? 0.95,
    eCushion: PHYSICS.railRestitution ?? 0.65,
    eFloor: PHYSICS.floorRestitution ?? 0.3,
  };
}
