import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
} from 'react';

import * as THREE from 'three';
import { COLORS, SIZES, BALL } from '@/config/constants.js';
import { createTable } from './objects/TableMesh.js';
import { createBall } from './objects/BallMesh.js';
import { createAimLine } from './objects/AimLine.js';
import { createLights } from './Lights.js';
import Camera from './Camera.js';

const BilliardsScene = forwardRef(function BilliardsScene(_, ref) {

  const mountRef = useRef(null);
  const contextRef = useRef(null);

  useImperativeHandle(ref, () => ({

    sync(ball, controls) {

      // ctx is containing all three.js objects and renderer
      const ctx = contextRef.current;
      if (!ctx) return;

      // update ball radius if changed
      if (ctx.currentBallRadius !== controls.ballRadius) {
        const radiusScale = controls.ballRadius / (ctx.currentBallRadius || controls.ballRadius);
        ctx.ball.scale.multiplyScalar(radiusScale);
        ctx.currentBallRadius = controls.ballRadius;
      }

      // ball position
      ctx.ball.position.set(
        ball.position.x,
        ball.position.y,
        controls.ballRadius
      );

      // aim line (arrow)
      const angle = controls.aimDeg * Math.PI / 180;

      const dirX = Math.cos(angle);
      const dirY = Math.sin(angle);

      const scale = controls.shotImpulse * 0.5;

      const direction = new THREE.Vector3(dirX, dirY, 0);
      const offset = ball.radius + 0.05; // Additional offset from ball

      // when ball is currently starting position
      const start = new THREE.Vector3(
          ball.position.x + dirX * offset,
          ball.position.y + dirY * offset,
          ball.radius + 0.002 
        );

      // arrow visibility
      if (ball.velocity.x === 0 && ball.velocity.y === 0) {
        ctx.aimLine.visible = true;
        ctx.aimLine.position.copy(start);
        ctx.aimLine.setDirection(direction);
        ctx.aimLine.setLength(scale);
      } else {
        ctx.aimLine.visible = false;
      }

      // render
      ctx.renderer.render(
        ctx.scene,
        ctx.camera
      );
    },
  }));

  useEffect(() => {

    // element to mount the scene
    const element = mountRef.current;
    if (!element) return;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(COLORS.background);

    // Camera
    const camera = Camera(element.clientWidth, element.clientHeight);

    // Renderer
    const renderer = new THREE.WebGLRenderer({
        antialias: true,
      });

    renderer.setSize(
      element.clientWidth,
      element.clientHeight
    );

    renderer.setPixelRatio(
      Math.min(
        window.devicePixelRatio,
        2
      )
    );

    element.appendChild(renderer.domElement);

    // Create scene objects
    createLights(scene);
    createTable(scene);
    const ball = createBall(scene);
    const aimLine = createAimLine(scene);

    renderer.render(scene, camera);

    contextRef.current = {
      scene,
      camera,
      renderer,
      ball,
      aimLine,
      currentBallRadius: BALL.radius,
    };

    // Resize
    function onResize() {

      const width = element.clientWidth;
      const height = element.clientHeight;
      const view = SIZES.view;

      const aspect = width / height;

      camera.left = -view * aspect;
      camera.right = view * aspect;
      camera.top = view;
      camera.bottom = -view;

      camera.updateProjectionMatrix();

      renderer.setSize(width, height);

      renderer.render(
        scene,
        camera
      );
    }

    window.addEventListener(
      'resize',
      onResize
    );

    return () => {
      window.removeEventListener(
        'resize',
        onResize
      );

      renderer.dispose();

      element.removeChild(
        renderer.domElement
      );
    };

  }, []);

  return (
    <div
      ref={mountRef}
      style={{
        width: '100%',
        height: '100%',
      }}
    />
  );
});

export default BilliardsScene;