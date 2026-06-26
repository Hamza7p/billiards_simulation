
/*import * as vec2 from '../math/Vector2';


const temp = vec2.create();

export function applySlidingFriction(ball, surface, dt) {
  const speed = vec2.length(ball.velocity);

  if (speed < 1e-5) {
    ball.velocity.x = 0;
    ball.velocity.y = 0;
    return;
  }

  // get direction of velocity
  vec2.normalize(temp, ball.velocity);

  // sliding friction opposite to motion
  temp.x *= -1;
  temp.y *= -1;

  // F = μmg
  const frictionForce = surface.muSliding * ball.mass * surface.gravity;

  // a = F/m
  const deceleration = frictionForce / ball.mass;

  // Δv = a * dt (delta time)
  const deltaSpeed = deceleration * dt;

  // prevent reversing direction
  const nextSpeed = Math.max(0, speed - deltaSpeed);

  vec2.scale(
    ball.velocity,
    temp,
    nextSpeed
  );

  // restore correct direction
  ball.velocity.x *= -1;
  ball.velocity.y *= -1;
}
*/
import * as vec3 from '../math/Vector3';

const temp = vec3.create();
console.log("🔥 applySlidingFriction is called!");
export function applySlidingFriction(ball, surface, dt) {
  // ✅ سطر المراقبة: يعرض لون الكرة التي يطبق عليها الاحتكاك
  //console.log("Friction applied to ball with color:", ball.color || "white");

  const speed = vec3.length(ball.velocity);

  if (speed < 1e-5) {
    ball.velocity.x = 0;
    ball.velocity.y = 0;
    ball.velocity.z = 0;
    return;
  }

  // اتجاه السرعة (متجه وحدة)
  vec3.normalize(temp, ball.velocity);

  // الاحتكاك معاكس للحركة
  temp.x *= -1;
  temp.y *= -1;
  temp.z *= -1;

  // F = μmg
  const frictionForce = surface.muSliding * ball.mass * surface.gravity;

  // a = F/m
  const deceleration = frictionForce / ball.mass;

  // Δv = a * dt
  const deltaSpeed = deceleration * dt;

  // السرعة الجديدة (لا تقل عن صفر)
  const nextSpeed = Math.max(0, speed - deltaSpeed);

  // تحديث متجه السرعة
  vec3.scale(ball.velocity, temp, nextSpeed);

  // استعادة الاتجاه الصحيح (لأن temp كان معكوساً)
  ball.velocity.x *= -1;
  ball.velocity.y *= -1;
  ball.velocity.z *= -1;
}
