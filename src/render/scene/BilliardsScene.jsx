
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { BALL } from '@/config/constants.js';
import { createTable } from './objects/TableMesh.js';
import { createBall } from './objects/BallMesh.js';
import { createAimLine } from './objects/AimLine.js';
import { createLights } from './Lights.js';

const BilliardsScene = forwardRef(function BilliardsScene(_, ref) {
  const mountRef = useRef(null);
  const contextRef = useRef(null);
  const coloredBallsRef = useRef([]);
  const [initialized, setInitialized] = useState(false);

  const keys = useRef({ w: false, s: false, a: false, d: false, ArrowUp: false, ArrowDown: false, ArrowLeft: false, ArrowRight: false });

  // ✅ إنشاء الكرات الملونة (تُستدعى مرة واحدة)
  const createColoredBalls = (scene, worldBalls, controls) => {
    if (!worldBalls || worldBalls.length === 0) return;
    
    // حذف أي كرات قديمة
    coloredBallsRef.current.forEach(ball => {
      if (ball.parent) scene.remove(ball);
    });
    coloredBallsRef.current = [];

    // إنشاء الكرات الجديدة
    worldBalls.forEach((ballData) => {
      if (ballData.color) {
        const coloredBall = createBall(scene, ballData.color);
        coloredBall.position.set(ballData.position.x, ballData.position.y, controls.ballRadius);
        coloredBallsRef.current.push(coloredBall);
      }
    });
    setInitialized(true);
  };

 

  useImperativeHandle(ref, () => ({
    sync(ball, controls, worldBalls) {
      const ctx = contextRef.current;
      if (!ctx) return;

      // تحديث الكرة البيضاء
      if (ctx.currentBallRadius !== controls.ballRadius) {
        const radiusScale = controls.ballRadius / (ctx.currentBallRadius || controls.ballRadius);
        ctx.ball.scale.multiplyScalar(radiusScale);
        ctx.currentBallRadius = controls.ballRadius;
      }
      ctx.ball.position.set(ball.position.x, ball.position.y, controls.ballRadius);

      // ✅ إنشاء الكرات الملونة إذا لم تكن موجودة
      if (worldBalls && worldBalls.length > 0 && !initialized) {
        createColoredBalls(ctx.scene, worldBalls, controls);
      }
     // ✅ تحديث مواقع الكرات الملونة
      if (worldBalls && worldBalls.length > 0 && initialized) {
        let idx = 0;
        worldBalls.forEach((ballData) => {
          if (ballData.color && ballData !== ball) {
            if (coloredBallsRef.current[idx]) {
              coloredBallsRef.current[idx].position.set(
                ballData.position.x,
                ballData.position.y,
                controls.ballRadius
              );
            }
            idx++;
          }
        });
      }

      // خط التصويب
      const angle = controls.aimDeg * Math.PI / 180;
      const dirX = Math.cos(angle);
      const dirY = Math.sin(angle);
      const scale = controls.shotImpulse * 0.5;
      const direction = new THREE.Vector3(dirX, dirY, 0);
      const offset = ball.radius + 0.05;
      const start = new THREE.Vector3(
        ball.position.x + dirX * offset,
        ball.position.y + dirY * offset,
        ball.radius + 0.002
      );

      if (ball.velocity.x === 0 && ball.velocity.y === 0) {
        ctx.aimLine.visible = true;
        ctx.aimLine.position.copy(start);
        ctx.aimLine.setDirection(direction);
        ctx.aimLine.setLength(scale);
      } else {
        ctx.aimLine.visible = false;
      }

      ctx.renderer.render(ctx.scene, ctx.camera);
    },
    //resetColoredBalls, // ✅ تمرير دالة إعادة التعيين
  }));

  useEffect(() => {
    const element = mountRef.current;
    if (!element) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xffb6c1);

    const camera = new THREE.PerspectiveCamera(45, element.clientWidth / element.clientHeight, 0.1, 1000);
    camera.position.set(0, 8, 12);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(element.clientWidth, element.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    element.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enableZoom = true;
    controls.zoomSpeed = 1.2;
    controls.enablePan = true;
    controls.panSpeed = 0.8;
    controls.rotateSpeed = 1.0;
    controls.target.set(0, 0, 0);

    // أحداث الكيبورد
    const handleKeyDown = (e) => {
      const key = e.key;
      if (keys.current.hasOwnProperty(key)) {
        keys.current[key] = true;
        e.preventDefault();
      }
      if (key === 'ArrowUp') {
        controls.target.y += 0.1;
        camera.position.y += 0.1;
      }
      if (key === 'ArrowDown') {
        controls.target.y -= 0.1;
        camera.position.y -= 0.1;
      }
      if (key === 'ArrowLeft') {
        controls.target.x -= 0.1;
        camera.position.x -= 0.1;
      }
      if (key === 'ArrowRight') {
        controls.target.x += 0.1;
        camera.position.x += 0.1;
      }
    };

    const handleKeyUp = (e) => {
      const key = e.key;
      if (keys.current.hasOwnProperty(key)) {
        keys.current[key] = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    const updateKeyboardControls = () => {
      const rotateSpeed = 0.02;
      if (keys.current.a) controls.rotateLeft(rotateSpeed);
      if (keys.current.d) controls.rotateLeft(-rotateSpeed);
      if (keys.current.w) {
        controls.object.position.y += 0.1;
        controls.target.y += 0.1;
      }
      if (keys.current.s) {
        controls.object.position.y -= 0.1;
        controls.target.y -= 0.1;
      }
    };

    createLights(scene);
    createTable(scene);
    const ball = createBall(scene);
    const aimLine = createAimLine(scene);

    function animate() {
      requestAnimationFrame(animate);
      updateKeyboardControls();
      controls.update();
      renderer.render(scene, camera);
    }
    animate();

    contextRef.current = {
      scene,
      camera,
      renderer,
      ball,
      aimLine,
      currentBallRadius: BALL.radius,
    };

    const onResize = () => {
      const width = element.clientWidth;
      const height = element.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      renderer.dispose();
      if (element.contains(renderer.domElement)) {
        element.removeChild(renderer.domElement);
      }
    };
  }, []);

  return <div ref={mountRef} style={{ width: '100%', height: '100%' }} />;
});

export default BilliardsScene;