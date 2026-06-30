import { BALL, RACK_FOOT_SPOT } from "./constants";


export const RACK_ORDER = [
  1,
  9,  2,
  3,  8,  10,
  4,  14,  7,  6,
  11,  5, 15, 12, 13,
];

const D  = BALL.radius * 2;
const DX = D * Math.cos(Math.PI / 6) + 0.0005;
const DY = D + 0.0005;

export function calcRackPositions() {
  const positions = [];
  
  for (let row = 0; row < 5; row++) {
    for (let col = 0; col <= row; col++) {
      positions.push({
        x: RACK_FOOT_SPOT.x + row * DX,
        y: (col - row / 2) * DY,        // physics Y = Three -Z
      });
    }
  }
  return positions;
}

