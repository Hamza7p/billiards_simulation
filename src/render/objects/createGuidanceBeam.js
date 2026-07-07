import * as THREE from 'three';
import { SURFACE_Y, BALL, COLORS } from '@/global/constants';

const BEAM_LENGTH    = 0.25;    // metres ahead of ball
const ARROW_HEAD_LEN = 0.045;
const ARROW_HEAD_W   = 0.022;
const Y_OFFSET       = SURFACE_Y + BALL.radius;  

// One flat arrow shape in XZ plane
function buildArrowMesh() {
  const mat = new THREE.MeshBasicMaterial({
    color:       COLORS.aim,
    transparent: true,
    opacity:     0.82,
    depthWrite:  false,
    side:        THREE.DoubleSide,
  });

  const group = new THREE.Group();

  // shaft — thin flat box
  const shaftGeo = new THREE.PlaneGeometry(0.008, BEAM_LENGTH - ARROW_HEAD_LEN);
  const shaft    = new THREE.Mesh(shaftGeo, mat);
  shaft.rotation.x = Math.PI / 2;
  // center shaft so its near end starts at 0
  shaft.position.set(0, 0, -(BEAM_LENGTH - ARROW_HEAD_LEN) / 2 - BALL.radius - 0.01);
  group.add(shaft);

  // arrowhead — triangle
  const headShape = new THREE.Shape();
  headShape.moveTo(0, 0);
  headShape.lineTo(-ARROW_HEAD_W / 2, ARROW_HEAD_LEN);
  headShape.lineTo( ARROW_HEAD_W / 2, ARROW_HEAD_LEN);
  headShape.closePath();

  const headGeo = new THREE.ShapeGeometry(headShape);
  const head    = new THREE.Mesh(headGeo, mat);
  head.rotation.x = Math.PI / 2;
  head.position.set(0, 0, -(BEAM_LENGTH + BALL.radius + 0.01));
  group.add(head);

  return group;
}

export function createGuidanceBeam(scene) {
  const beam = buildArrowMesh();
  beam.visible = false;
  scene.add(beam);

  /**
   * @param {THREE.Vector3} ballWorldPos
   * @param {number}        aimDeg
   */
  function update(ballWorldPos, aimDeg) {
    beam.visible = true;
    beam.position.set(ballWorldPos.x, Y_OFFSET, ballWorldPos.z);
    beam.rotation.y = (aimDeg * Math.PI) / 180 - Math.PI / 2;
  }

  function hide() {
    beam.visible = false;
  }

  return { update, hide };
}