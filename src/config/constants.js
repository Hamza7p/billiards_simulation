
export const BALL = {
  mass: 0.17,
  radius: 0.028575,
};

export const BALL_COLORS = [
  0xfefefe, 0xf5a800, 0xcc2200, 0x7030a0, 0xff6600,
  0x1a6620, 0x8b2200, 0x111111, 0xf5e600, 0x2266cc,
  0x993355, 0xcc5500, 0x1a6620, 0x4422aa, 0xaa1111,
];

export const SURFACE = {
  gravity: 9.81,
  muSliding: 0.2,
  muRolling: 0.01,
  spinDamping: 0.02,
};

export const PHYSICS = {
  slipThreshold: 1e-4,
  stopSpeed: 1e-5,
  stopAngular: 1e-3,
  railRestitution: 0.75,
};

export const START_POINT = {
  x: 0,
  y: 0,
  z: 0,
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

// Material constants
export const MATERIALS = {
  body: { color: 0x1e2228, roughness: 0.20, metalness: 0.80 },
  cloth: { color: 0x1254a0, roughness: 0.88, metalness: 0.0 },
  rail: { color: 0x1254a0, roughness: 0.78, metalness: 0.02 },
  bumper: { color: 0x0b3460, roughness: 0.90, metalness: 0.0 },
  black: { color: 0x050608, roughness: 0.95, metalness: 0.05 },
  ring: { color: 0x2a3040, roughness: 0.22, metalness: 0.88 },
  corner: { color: 0x0d1520, roughness: 0.90, metalness: 0.02 },
  trim: { color: 0x353c46, roughness: 0.18, metalness: 0.92 },
  ball: { roughness: 0.06, metalness: 0.08 },
};

export const TABLE = {
  
  // Snooker table dimensions
  width: 1.78,
  length: 3.57,
  thickness: 0.14,
  
  // Edges & Pocket
  railWidth: 0.12,
  railHeight: 0.085,
  pocketRadius: 0.095,
  pocketGap: 0.095 * 1.6,
  
  // Surface
  surfaceZ: 0.07,
  surfaceY: 0.07,
  
};

const CORNER_POCKET_OFFSET = TABLE.railWidth * 0.6;
const SIDE_POCKET_OFFSET = TABLE.railWidth * 0.1;

// table pockets [x, z]
export const TABLE_POCKETS = [
  [-TABLE.length/2 + CORNER_POCKET_OFFSET,  -TABLE.width/2 + CORNER_POCKET_OFFSET],
  [-TABLE.length/2 + CORNER_POCKET_OFFSET,   TABLE.width/2 - CORNER_POCKET_OFFSET],
  [0,             -TABLE.width/2 + SIDE_POCKET_OFFSET],
  [0,              TABLE.width/2 - SIDE_POCKET_OFFSET],
  [ TABLE.length/2 - CORNER_POCKET_OFFSET, -TABLE.width/2 + CORNER_POCKET_OFFSET],
  [ TABLE.length/2 - CORNER_POCKET_OFFSET,  TABLE.width/2 - CORNER_POCKET_OFFSET],
];

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

export const SIZES = {
  tableWidth: 2.54,
  tableHeight: 1.27,
  railWidth: 0.07,
  tableThickness: 0.12,
  cushionHeight: 0.035,
  pocketRadius: 0.06,
  pocketLipRadius: 0.08,
  view: 1.5,
  perspectiveFov: 44,
  tableEdgeRadius: 0.03,
};

