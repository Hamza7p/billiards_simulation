

export const SURFACE = {
  gravity: 9.81,
  muSliding: 0.2,
  muRolling: 0.01,
  spinDamping: 0.02,
};

export const COLORS = {
  background: 0x1c1c30, //0x09090d ,
  table: 0x1254a0,
  tableBody: 0x1e2228,
  tableRail: 0x1254a0,
  tableBumper: 0x0b3460,
  tableBlack: 0x050608,
  tableRing: 0x2a3040,
  tableCorner: 0x0d1520,
  tableTrim: 0x353c46,
  pocket: 0x090806,
  pocketLeather: 0x1f1910,
  ball: 0xffffff,
  aim: 0xfff600,
  cue: 0xc4a574,
  cueTip: 0x1e6b3d,
  highlight: 0xf8f1d4,
};

export const CAMERA = {
  // circle system: (theta, phi, r)
  initialTheta: 0.28,
  initialPhi: 0.70,
  initialRadius: 7.2,
  // bounds
  minRadius: 3,
  maxRadius: 13,
  minPhi: 0.15,
  maxPhi: 1.38,
  // speeds
  rotationSpeed: 0.007,
  tiltSpeed: 0.006,
  zoomSpeed: 0.007,
  // look points
  lookAtPoint: { x: 0, y: 0.05, z: 0 },
  // perspective
  defaultPosition:{ x: 0, y: -2.3, z: 2.5 },
  defaultTarget: { x: 0, y: 0, z: 0 },
  minDistance: 1.0,
  maxDistance: 6.0,
  minPolar: 0,
  maxPolar: Math.PI * 2,
  minAzimuth: -Math.PI,
  maxAzimuth: Math.PI,
  fov: 44,
};


// ─── Snooker 9ft Table — World-standard play dimensions ───────────────────────
export const CLOTH_LENGTH = 3.569;   // metres, long axis  (X)
export const CLOTH_WIDTH  = 1.778;   // metres, short axis (Z)

// Y of the cloth surface in world space (balls roll at this height)
export const SURFACE_Y    = 0.855;

// ─── Ball ─────────────────────────────────────────────────────────────────
export const BALL = {
  radius: 0.028575,   // 57.15 mm diameter — WPA standard
  mass:   0.17,       // 170 g
};

// ─── 8-ball rack positions (physics 2D space: x forward, y sideways) ──────
// Foot spot on a 9ft table ≈ +0.635 m from centre along long axis
export const RACK_FOOT_SPOT = { x: 0.635, y: 0 };
export const CUE_BALL_START  = { x: -0.635, y: 0 };   // head spot
export const START_POINT    = {  x: -0.635, y: 0, z: 0 };

// ─── Physics stop thresholds ──────────────────────────────────────────────
export const PHYSICS = {
  slipThreshold: 0.1,
  stopSpeed: 0.001,
  stopAngular: 0.1,
  railRestitution: 0.65,
  ballRestitution: 0.95,
  floorRestitution: 0.3,
};
