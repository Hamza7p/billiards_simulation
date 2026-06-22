import { TABLE } from '@/config/constants';

const HALF_W = TABLE.width / 2;
const HALF_H = TABLE.height / 2;

export const TABLE_LAYOUT = {
  playfield: {
    left: -HALF_W,
    right: HALF_W,
    bottom: -HALF_H,
    top: HALF_H,
  },

  pockets: [
    { id: 'tl', x: -HALF_W, y: HALF_H },
    { id: 'tm', x: 0, y: HALF_H },
    { id: 'tr', x: HALF_W, y: HALF_H },

    { id: 'bl', x: -HALF_W, y: -HALF_H },
    { id: 'bm', x: 0, y: -HALF_H },
    { id: 'br', x: HALF_W, y: -HALF_H },
  ],
};