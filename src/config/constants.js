
export const BALL = {
  mass: 0.17,
  radius: 0.028575,
};

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
  background: 0x444446, 
  table: 0x1b502f,
  tableWood: 0x603a24,
  tableWoodAccent: 0x8c5b3f,
  tableRail: 0x1238bc, //0x163921,
  cushion: 0x17372f,
  pocket: 0x090806,
  pocketLeather: 0x1f1910,
  ball: 0xffffff,
  aim: 0xfff600,
  cue: 0xc4a574,
  cueTip: 0x1e6b3d,
  highlight: 0xf8f1d4,
};


export const TABLE = {
  width: 2.54,
  height: 1.27,
  thickness: 0.12,
  railWidth: 0.07,
  cushionHeight: 0.035,
  pocketRadius: 0.06,
  pocketDepth: 0.055,
  surfaceZ: 0.122,
};

export const CAMERA = {
  defaultPosition:{ x: 0, y: -2.3, z: 2.5 },
  defaultTarget: { x: 0, y: 0, z: 0 },
  minDistance: 1.0,
  maxDistance: 6.0,
  minPolar: 0, //Math.PI * 0.22,
  maxPolar: Math.PI * 2, // 0.48,
  minAzimuth: -Math.PI,
  maxAzimuth: Math.PI,
  fov: 42,
};

export const SIZES = {
  tableWidth: Math.abs(TABLE.maxX) + Math.abs(TABLE.minX),
  tableHeight: Math.abs(TABLE.maxY) + Math.abs(TABLE.minY),
  railWidth: 0.07,
  tableThickness: 0.12,
  cushionHeight: 0.035,
  pocketRadius: 0.06,
  pocketLipRadius: 0.08,
  view: 1.5,
  perspectiveFov: 42,
  tableEdgeRadius: 0.03,
};

// export const SIZES = {
//   perspectiveFov: 42,
//   view: 1.5,
// };

export const TABLE_SURFACE_Z = SIZES.tableThickness - 0.004;
