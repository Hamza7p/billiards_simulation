import { BALL, SURFACE } from "@/config/constants";

export function createControls() {
  return {
    shotImpulse: 1,
    aimDeg: 0,
    muSliding: SURFACE.muSliding,
    gravity: SURFACE.gravity,
    ballMass: BALL.mass,
    ballRadius: BALL.radius,
restitutionBallBall: 0.93,///   

    restitutionBallWall: 0.75,  
    muCollision: 0.2,            
  };

}

