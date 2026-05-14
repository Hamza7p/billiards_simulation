

export const BALL = {
    mass: 0.17,
    radius: 0.028575,
}

export const SURFACE = {
    gravity: 9.81,
    // μSliding
    muSliding: 0.2,
    // μRolling
    muRolling: 0.01,
    spinDamping: 0.02
}

export const START_POINT = {
  x: 0,
  y: 0,
};

export const COLORS = {
  background: 0x111111,
  table: 0x14532d,
  ball: 0xffffff,
  aim: 0xfff600,
};

// for change table size, just change TABLE_SCALE
const TABLE_SCALE = 0.8;

// 2:1
export const TABLE = {
  minX: -2 * TABLE_SCALE,
  maxX: 2 * TABLE_SCALE,

  minY: -1 * TABLE_SCALE,
  maxY: 1 * TABLE_SCALE,
};

export const SIZES = {
  tableWidth: (Math.abs(TABLE.maxX) + Math.abs(TABLE.minX)),
  tableHeight: (Math.abs(TABLE.maxY) + Math.abs(TABLE.minY)),
  view: 1.5,
};