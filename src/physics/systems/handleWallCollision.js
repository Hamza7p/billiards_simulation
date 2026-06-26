
import * as vec3 from '../math/Vector3.js';
import { TABLE } from '@/config/constants.js';
import { playWallHitSound } from './SoundManager';
// متجهات مساعدة (نتجنب إنشاء objects جديدة كل frame)
const rH = vec3.create();      // r_h = R * n̂  (من مركز الكرة إلى نقطة التماس مع الحافة)
const wxr = vec3.create();     // ω × r_h
const vH = vec3.create();      // سرعة نقطة التماس مع الحافة
const vT = vec3.create();      // المركبة المماسية لسرعة نقطة التماس
const tHat = vec3.create();    // الاتجاه المماسي (عكس الانزلاق)
const nCrossT = vec3.create(); // n̂ × t̂
const nHat = vec3.create();    // المتجه العمودي للحافة


export function handleWallCollision(ball, controls) {

  const R = ball.radius;
  const e = controls.restitutionBallWall;
  const muC = controls.muCollision;

  // الحافة اليمنى (maxX): n̂ = (-1,0,0)
  if (ball.position.x + R > TABLE.maxX) {
    ball.position.x = TABLE.maxX - R;
    vec3.set(nHat, -1, 0, 0);
    resolveWallImpulse(ball, nHat, e, muC);
  }

  // الحافة اليسرى (minX): n̂ = (1,0,0)
  if (ball.position.x - R < TABLE.minX) {
    ball.position.x = TABLE.minX + R;
    vec3.set(nHat, 1, 0, 0);
    resolveWallImpulse(ball, nHat, e, muC);
  }

  // الحافة العليا (maxY): n̂ = (0,-1,0)
  if (ball.position.y + R > TABLE.maxY) {
    ball.position.y = TABLE.maxY - R;
    vec3.set(nHat, 0, -1, 0);
    resolveWallImpulse(ball, nHat, e, muC);
  }

  // الحافة السفلى (minY): n̂ = (0,1,0)
  if (ball.position.y - R < TABLE.minY) {
    ball.position.y = TABLE.minY + R;
    vec3.set(nHat, 0, 1, 0);
    resolveWallImpulse(ball, nHat, e, muC);
  }
}

/**
 * تطبيق الدفع العمودي والمماسي (Jn, Jt) على الكرة عند التصادم مع حافة
 */
function resolveWallImpulse(ball, n, e, muC) {

  // r_h = R * n̂
  vec3.scale(rH, n, ball.radius);

  // v_h = v + ω × r_h
  vec3.cross(wxr, ball.angularVelocity, rH);
  vec3.add(vH, ball.velocity, wxr);

  // v_n = v_h · n̂
  const vn = vec3.dot(vH, n);

  if (vn > 0) return;

  // v_t = v_h - v_n * n̂
  vT.x = vH.x - vn * n.x;
  vT.y = vH.y - vn * n.y;
  vT.z = vH.z - vn * n.z;

  const vtLen = vec3.length(vT);

  if (vtLen > 1e-8) {
    tHat.x = -vT.x / vtLen;
    tHat.y = -vT.y / vtLen;
    tHat.z = -vT.z / vtLen;
  } else {
    vec3.set(tHat, 0, 0, 0);
  }

  // Jn = -m(1+e)(v·n̂)
  const Jn = -ball.mass * (1 + e) * vn;
// الصوت
// صوت التصادم مع الحافة
const intensity = Math.min(Math.abs(Jn) / 2, 1);
playWallHitSound(intensity);

  // Jt = μc * Jn
  const Jt = muC * Jn;

  // v' = v + (Jn*n̂ + Jt*t̂)/m
  ball.velocity.x += (Jn * n.x + Jt * tHat.x) / ball.mass;
  ball.velocity.y += (Jn * n.y + Jt * tHat.y) / ball.mass;
  ball.velocity.z += (Jn * n.z + Jt * tHat.z) / ball.mass;

  // ω' = ω + (5*Jt)/(2*m*R) * (n̂ × t̂)
  vec3.cross(nCrossT, n, tHat);

  const angCoeff = (5 * Jt) / (2 * ball.mass * ball.radius);

  ball.angularVelocity.x += angCoeff * nCrossT.x;
  ball.angularVelocity.y += angCoeff * nCrossT.y;
  ball.angularVelocity.z += angCoeff * nCrossT.z;
}

