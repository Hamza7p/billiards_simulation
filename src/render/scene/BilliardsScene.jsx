import { forwardRef, useEffect, useImperativeHandle, useRef,} from 'react';
import * as THREE from 'three';
import { COLORS, BALL, SURFACE_Y } from '@/global/constants.js';
import { createLights } from './Lights.js';
import { createTable } from '../objects/createTable.js';
import { createBalls } from '../objects/createBalls.js';
import { Camera } from './Camera.js';
import { createCue } from '../objects/createCue.js';
import { createGuidanceBeam } from '../objects/createGuidanceBeam.js';

const BilliardsScene = forwardRef(function BilliardsScene(_, ref) {
  const mountRef = useRef(null);
  const contextRef = useRef(null);

  useImperativeHandle(ref, () => ({
   
    sync(allBallStates, controls, isMoving) {

      const ctx = contextRef.current;
      if (!ctx) return;

      // update radius of ball
      if (ctx.currentBallRadius !== controls.ballRadius) {
        ctx.currentBallRadius = controls.ballRadius;
        const newGeometry = new THREE.SphereGeometry(controls.ballRadius, 32, 32);
        ctx.ballsData.all.forEach((mesh) => {
          if (!mesh?.geometry) return;
          mesh.geometry.dispose();
          mesh.geometry = newGeometry;
        });
      }

      allBallStates.forEach((state, i) => {
        const mesh = ctx.ballsData.all[i];
        if (!mesh || !state) return;

        if (state.pocketed) {
          mesh.visible = false;
          return;
        }

        mesh.visible = true;
        mesh.position.set(
          state.position.x,
          state.position.z + SURFACE_Y + controls.ballRadius + 0.0002,
          -state.position.y,
        );

        mesh.quaternion.set(
          state.orientation.x,
          state.orientation.z,
          -state.orientation.y,
          state.orientation.w,
        );

        const cueBallState = allBallStates[0];
        if (!cueBallState || cueBallState.pocketed) {
          ctx.cue.hide();
          ctx.beam.hide();
          // ctx.trajectory.hide();
          return;
        }

        // Three.js world position of cue ball
        const ballWorldPos = ctx.ballsData.all[0].position;   // already updated above

        if (isMoving) {
          ctx.cue.hide();
          ctx.beam.hide();
          // ctx.trajectory.hide();
        } else {
          ctx.cue.update(ballWorldPos, controls.aimDeg, controls.cueElevDeg, controls.shotImpulse, controls.ballRadius);
          ctx.beam.update(ballWorldPos, controls.aimDeg);
          // ctx.trajectory.update(
          //   { x: cueBallState.position.x, y: cueBallState.position.y },
          //   controls
          // );
        }

      });
    },

    resetCamera() {
      const ctx = contextRef.current;

      if (!ctx) return;

      ctx.camera.reset();
    },

    playStrike(controls, onComplete) {
      const ctx = contextRef.current;
      if (!ctx) return;

      const ballWorldPos = ctx.ballsData.all[0].position;
      ctx.beam.hide();
      // ctx.trajectory.hide();
      ctx.cue.playStrike(
        ballWorldPos,
        controls.aimDeg,
        controls.cueElevDeg,
        controls.shotImpulse,
        onComplete,
        controls.ballRadius,
      );
    },

  }));

  useEffect(() => {

    const mount = mountRef.current;
    if (!mount) return;

    /*
     * Scene
     */
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(COLORS.background);

    /*
     * Renderer
     */
    const renderer = new THREE.WebGLRenderer({
        antialias: true,
      });

    renderer.setSize(
      mount.clientWidth,
      mount.clientHeight
    );

    renderer.setPixelRatio(
      Math.min(window.devicePixelRatio, 2)
    );

    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    mount.appendChild(renderer.domElement);

    /*
     * Camera
     */
    const camera = new Camera(
      mount.clientWidth,
      mount.clientHeight,
      renderer.domElement
    );

    /*
     * World
     */
    createLights(scene);
    createTable(scene);
    // ball 
    const ballsData = createBalls(scene);
    const ball = ballsData.cueBall;
    // cue helers 
    const cue      = createCue(scene);
    const beam     = createGuidanceBeam(scene);
    // const trajectory = createTrajectory(scene);


    /*
     * Shared Context
     */
    contextRef.current = {
      scene,
      renderer,
      camera,
      ball,
      ballsData,
      cue,
      beam,
      // trajectory,
      currentBallRadius: BALL.radius,
    };

    /*
     * Resize
     */
    let resizeTimer = null;
    
    const resizeObserver = new ResizeObserver(() => {
      const width = mount.clientWidth;
      const height = mount.clientHeight;

      camera.resize(width, height);
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        renderer.setSize(width, height);
      }, 10); 
    });

    resizeObserver.observe(mount);

    /*
     * Render Loop
     */
    let animationId;

    const animate = () => {
      animationId =
        requestAnimationFrame(
          animate
        );

      camera.update();

      renderer.render(
        scene,
        camera.camera
      );
    };

    animate();

    /*
     * Cleanup
     */
    return () => {
      cancelAnimationFrame(animationId);
      resizeObserver.disconnect();  
      camera.dispose();
      renderer.dispose();
      mount.removeChild(renderer.domElement);
      contextRef.current = null;
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