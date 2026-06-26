
import * as vec3 from '../math/Vector3.js';

const vC = vec3.create();
const wxr = vec3.create();
const rC = vec3.create();
const sHat = vec3.create();

const SLIDE_THRESHOLD = 1e-4;
const MIN_SPEED = 0.09;

export function integrateMotion(ball, dt, surface) {

  const R = ball.radius;
  const g = surface?.gravity ?? 9.81;
  const muK = surface?.muSliding ?? 0.2;
  const muR = surface?.muRolling ?? 0.01;

  // حد أدنى للسرعة — إذا بطيئة جداً نوقفها فوراً
  const currentSpeed = Math.hypot(ball.velocity.x, ball.velocity.y);
  if (currentSpeed < MIN_SPEED) {
    vec3.set(ball.velocity, 0, 0, 0);
    vec3.set(ball.angularVelocity, 0, 0, 0);
    return;
  }

  // r_c = (0, 0, -R)
  vec3.set(rC, 0, 0, -R);

  // v_c = v + ω × r_c
  vec3.cross(wxr, ball.angularVelocity, rC);
  vec3.add(vC, ball.velocity, wxr);

  const vcLen = vec3.length(vC);

  if (vcLen > SLIDE_THRESHOLD) {
    // مرحلة الانزلاق
    vec3.normalize(sHat, vC);

    ball.velocity.x -= muK * g * sHat.x * dt;
    ball.velocity.y -= muK * g * sHat.y * dt;
    ball.velocity.z -= muK * g * sHat.z * dt;

    const tmp = vec3.create();
    vec3.cross(tmp, rC, sHat);
    const angCoeff = (5 * muK * g) / (2 * R);
    ball.angularVelocity.x -= angCoeff * tmp.x * dt;
    ball.angularVelocity.y -= angCoeff * tmp.y * dt;
    ball.angularVelocity.z -= angCoeff * tmp.z * dt;

  } else {
    // مرحلة التدحرج الصرف
    const speed = vec3.length(ball.velocity);

    if (speed > 1e-6) {
      const decel = muR * g * dt;
      const newSpeed = Math.max(0, speed - decel);
      const ratio = newSpeed / speed;

      ball.velocity.x *= ratio;
      ball.velocity.y *= ratio;
      ball.velocity.z *= ratio;

      vec3.cross(wxr, rC, ball.velocity);
      const invR2 = 1 / (R * R);
      ball.angularVelocity.x = wxr.x * invR2;
      ball.angularVelocity.y = wxr.y * invR2;
      ball.angularVelocity.z = wxr.z * invR2;

    } else {
      vec3.set(ball.velocity, 0, 0, 0);
      vec3.set(ball.angularVelocity, 0, 0, 0);
    }
  }

  // تحديث الموضع
  vec3.addScaled(ball.position, ball.position, ball.velocity, dt);
}