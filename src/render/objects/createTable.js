import * as THREE from 'three';
import { CLOTH_LENGTH, CLOTH_WIDTH, SURFACE_Y } from '@/global/constants.js';
import netImageUrl  from '@/assets/imgs/net.png';
import feltImageUrl from '@/assets/imgs/felt-cloth-light.png';

// ─── Derived table geometry (all relative to cloth dimensions) ────────────
export const RAIL_WIDTH    = CLOTH_WIDTH * 0.0674;   // ≈ 0.12 m
const RAIL_HEIGHT   = CLOTH_WIDTH * 0.0478;   // ≈ 0.085 m
const BODY_HALF_H   = 0.07;                   // half-thickness of the slate body
const POCKET_RADIUS = CLOTH_WIDTH * 0.0534;   // ≈ 0.095 m
export const POCKET_GAP    = POCKET_RADIUS * 1.6;    // cushion cutback around each pocket

// Full outer dimensions (cloth + two rails each side)
const OUTER_LENGTH  = CLOTH_LENGTH + RAIL_WIDTH * 2;
const OUTER_WIDTH   = CLOTH_WIDTH  + RAIL_WIDTH * 2;

// Cloth surface Y — balls roll exactly here (re-exported for physics)
export const BALL_SURFACE_Y = SURFACE_Y;

// ─── Pocket positions in world XZ (used here AND by physics/collision) ────
const CP = RAIL_WIDTH * 0.5;                  // corner pocket offset from outer edge
const SP = RAIL_WIDTH * 0.9;                  // side pocket offset from outer edge

export const POCKET_POSITIONS = [
  // [x, z]  — six pockets
  [-CLOTH_LENGTH / 2 - CP,  -CLOTH_WIDTH / 2 - CP],   // back-left  corner
  [-CLOTH_LENGTH / 2 - CP,   CLOTH_WIDTH / 2 + CP],   // front-left corner
  [0,                        -CLOTH_WIDTH / 2 - SP],   // back  side
  [0,                         CLOTH_WIDTH / 2 + SP],   // front side
  [ CLOTH_LENGTH / 2 + CP,  -CLOTH_WIDTH / 2 - CP],   // back-right  corner
  [ CLOTH_LENGTH / 2 + CP,   CLOTH_WIDTH / 2 + CP],   // front-right corner
];

// ─── Cushion (rail) segments — used by collision system ───────────────────
// Each entry: { axis:'x'|'z', pos, from, to }
// These are the INNER faces of the cushions (where the ball bounces).
export const CUSHION_SEGMENTS = _buildCushionSegments();

function _buildCushionSegments() {
  const halfL = CLOTH_LENGTH / 2;
  const halfW = CLOTH_WIDTH  / 2;
  const g     = POCKET_GAP;
  const cp    = CLOTH_LENGTH / 2 * 0; // corner x extent (pocket centre x)
  const cpx   = halfL + CP;           // corner pocket x
  const cpz   = halfW + CP;           // corner pocket z
  const spz   = halfW + SP;           // side pocket z (not used for x-rails)

  return [
    // Long rails (parallel to X axis) — back (z = -halfW) and front (z = +halfW)
    { axis:'z', z: -(halfW + RAIL_WIDTH/2), xFrom: -cpx + g, xTo: -g            },
    { axis:'z', z: -(halfW + RAIL_WIDTH/2), xFrom:  g,       xTo:  cpx - g      },
    { axis:'z', z:  (halfW + RAIL_WIDTH/2), xFrom: -cpx + g, xTo: -g            },
    { axis:'z', z:  (halfW + RAIL_WIDTH/2), xFrom:  g,       xTo:  cpx - g      },
    // Short rails (parallel to Z axis) — left (x = -halfL) and right (x = +halfL)
    { axis:'x', x: -(halfL + RAIL_WIDTH/2), zFrom: -cpz + g, zTo: cpz - g       },
    { axis:'x', x:  (halfL + RAIL_WIDTH/2), zFrom: -cpz + g, zTo: cpz - g       },
  ];
}

// ─── Texture loader (shared) ──────────────────────────────────────────────
const loader = new THREE.TextureLoader();

function feltTexture(repeatX = 4, repeatY = 4) {
  const t = loader.load(feltImageUrl);
  t.colorSpace  = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(repeatX, repeatY);
  return t;
}

// ─── Materials ────────────────────────────────────────────────────────────
function buildMaterials() {
  const cloth = new THREE.MeshStandardMaterial({
    map:       feltTexture(6, 3),
    color:     0x1254a0,
    roughness: 0.95,
    metalness: 0.0,
  });

  const rail = new THREE.MeshStandardMaterial({
    map:       feltTexture(3, 1),
    color:     0x1254a0,
    roughness: 0.95,
    metalness: 0.0,
  });

  const body = new THREE.MeshStandardMaterial({
    color:     0x1e2228,
    roughness: 0.2,
    metalness: 0.8,
  });

  const trim = new THREE.MeshStandardMaterial({
    color:     0x2a3040,
    roughness: 0.4,
    metalness: 0.6,
  });

  const ring = new THREE.MeshStandardMaterial({
    color:     0x2a3040,
    roughness: 0.3,
    metalness: 0.8,
  });

  const pocketBlack = new THREE.MeshStandardMaterial({
    color:    0x0a0a0a,
    roughness: 0.9,
  });

  return { cloth, rail, body, trim, ring, pocketBlack };
}

// ─── Main ─────────────────────────────────────────────────────────────────
export function createTable(scene) {
  const mat = buildMaterials();
  const T   = new THREE.Group();

  _addBody(T, mat);
  _addCloth(T, mat);
  _addRails(T, mat);
  _addPockets(T, mat);

  scene.add(T);
  return T;
}

// ── 1. Slate body ─────────────────────────────────────────────────────────
function _addBody(T, mat) {
  const bodyY = SURFACE_Y - BODY_HALF_H;

  const body = new THREE.Mesh(
    new THREE.BoxGeometry(OUTER_LENGTH, BODY_HALF_H * 2, OUTER_WIDTH),
    mat.body
  );
  body.position.y  = bodyY;
  body.castShadow  = true;
  body.receiveShadow = true;
  T.add(body);

  // thin metal trim strip around body perimeter
  const TRIM_H = 0.013;
  const TRIM_D = 0.015;
  const trimY  = bodyY;
  [
    [OUTER_LENGTH + 0.01, TRIM_H, TRIM_D, 0,                   trimY, -(OUTER_WIDTH / 2 + 0.008)],
    [OUTER_LENGTH + 0.01, TRIM_H, TRIM_D, 0,                   trimY,   OUTER_WIDTH / 2 + 0.008 ],
    [TRIM_D, TRIM_H, OUTER_WIDTH + 0.01, -(OUTER_LENGTH / 2 + 0.008), trimY, 0                  ],
    [TRIM_D, TRIM_H, OUTER_WIDTH + 0.01,   OUTER_LENGTH / 2 + 0.008,  trimY, 0                  ],
  ].forEach(([w, h, d, x, y, z]) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat.trim);
    m.position.set(x, y, z);
    T.add(m);
  });
}

// ── 2. Cloth surface ──────────────────────────────────────────────────────
function _addCloth(T, mat) {
  const cloth = new THREE.Mesh(
    new THREE.PlaneGeometry(CLOTH_LENGTH, CLOTH_WIDTH),
    mat.cloth
  );
  cloth.rotation.x    = -Math.PI / 2;
  cloth.position.y    = SURFACE_Y + 0.001;
  cloth.receiveShadow = true;
  T.add(cloth);
}

// ── 3. Rails / cushions ───────────────────────────────────────────────────
function _addRails(T, mat) {
  const railY   = SURFACE_Y + RAIL_HEIGHT / 2;
  const halfL   = CLOTH_LENGTH / 2;
  const halfW   = CLOTH_WIDTH  / 2;
  const railCX  = RAIL_WIDTH / 2;   // rail centre offset from cloth edge
  const g       = POCKET_GAP;
  const cornerX = halfL + RAIL_WIDTH * 0.3;    // x of corner pocket centre
  const cornerZ = halfW + RAIL_WIDTH * 0.3;

  // Long rails (Z sides) — each split into two segments by the side pocket
  [-1, 1].forEach(side => {
    const rz = side * (halfW + railCX);

    [ [-cornerX + g, -g],
      [           g,  cornerX - g] ].forEach(([from, to]) => {
      const len = to - from;
      if (len < 0.01) return;
      const seg = new THREE.Mesh(
        new THREE.BoxGeometry(len, RAIL_HEIGHT, RAIL_WIDTH),
        mat.rail
      );
      seg.position.set(from + len / 2, railY, rz);
      seg.castShadow = true;
      T.add(seg);
    });
  });

  // Short rails (X sides) — one segment each, cut at corners
  [-1, 1].forEach(side => {
    const rx  = side * (halfL + railCX);
    const from = -cornerZ + g;
    const to   =  cornerZ - g;
    const len  = to - from;
    if (len < 0.01) return;
    const seg = new THREE.Mesh(
      new THREE.BoxGeometry(RAIL_WIDTH, RAIL_HEIGHT, len),
      mat.rail
    );
    seg.position.set(rx, railY, from + len / 2);
    seg.castShadow = true;
    T.add(seg);
  });
}

// ── 4. Pockets ────────────────────────────────────────────────────────────
function _addPockets(T, mat) {
  const netTexture = loader.load(netImageUrl);
  netTexture.colorSpace = THREE.SRGBColorSpace;
  netTexture.wrapS = netTexture.wrapT = THREE.RepeatWrapping;
  netTexture.repeat.set(2, 2);

  const matNet = new THREE.MeshStandardMaterial({
    map:           netTexture,
    roughness:     0.9,
    metalness:     0.05,
    polygonOffset: true,
    polygonOffsetFactor: -1,
  });

  POCKET_POSITIONS.forEach(([px, pz]) => {
    // Concave net disc
    const discGeo = new THREE.CircleGeometry(POCKET_RADIUS * 1.08, 32);
    _applyConcavity(discGeo, POCKET_RADIUS * 1.08, 0.0015);
    const disc = new THREE.Mesh(discGeo, matNet);
    disc.rotation.x = -Math.PI / 2;
    disc.position.set(px, SURFACE_Y + 0.002, pz);
    T.add(disc);

    // Metal outer ring
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(POCKET_RADIUS + 0.018, 0.01, 8, 36),
      mat.ring
    );
    ring.rotation.x = Math.PI / 2;
    ring.position.set(px, SURFACE_Y + 0.002, pz);
    T.add(ring);

    // Conical cup into the body
    const cup = new THREE.Mesh(
      new THREE.CylinderGeometry(POCKET_RADIUS * 0.95, POCKET_RADIUS * 0.4, 0.2, 28, 1, true),
      mat.pocketBlack
    );
    cup.position.set(px, SURFACE_Y - 0.1, pz);
    T.add(cup);

    // Pit floor
    const floor = new THREE.Mesh(
      new THREE.CircleGeometry(POCKET_RADIUS * 0.38, 24),
      mat.pocketBlack
    );
    floor.rotation.x = Math.PI / 2;
    floor.position.set(px, SURFACE_Y - 0.195, pz);
    T.add(floor);
  });
}

function _applyConcavity(geometry, radius, depth) {
  const pos = geometry.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const r       = Math.hypot(pos.getX(i), pos.getY(i));
    const falloff = 1 - Math.min(r / radius, 1);
    pos.setZ(i, -depth * falloff);
  }
  pos.needsUpdate = true;
}