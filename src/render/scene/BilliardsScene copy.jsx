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
  const placementHandlerRef = useRef(null);
  const placementEnabledRef = useRef(false);

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

      const pocketDisplay = new Map();
      allBallStates.forEach((state, i) => {
        const mesh = ctx.ballsData.all[i];
        if (!mesh || !state) return;

        const pocketKey = state.pocketed && state.pocketedBy
          ? `${state.pocketedBy.x}:${state.pocketedBy.y}`
          : '__none__';

        const shouldShowPocketed = Boolean(state.pocketed && (
          !pocketDisplay.has(pocketKey) ||
          (state.pocketedAt ?? 0) >= (pocketDisplay.get(pocketKey).pocketedAt ?? 0)
        ));

        if (state.pocketed) {
          if (shouldShowPocketed) {
            pocketDisplay.set(pocketKey, { index: i, pocketedAt: state.pocketedAt ?? 0 });
            mesh.visible = true;
            mesh.position.set(
              state.position.x,
              state.position.z + SURFACE_Y + controls.ballRadius + 0.0002,
              -state.position.y,
            );
          } else {
            mesh.visible = false;
          }
          if (ctx.ballShadows?.[i]) ctx.ballShadows[i].visible = false;
          return;
        }

        mesh.visible = true;
        const worldY = state.position.z + SURFACE_Y + controls.ballRadius + 0.0002;
        mesh.position.set(
          state.position.x,
          worldY,
          -state.position.y,
        );

        const shadow = ctx.ballShadows?.[i];
        if (shadow) {
          const isAirborne = state.position.z > 0.0002;
          shadow.visible = isAirborne;
          if (isAirborne) {
            shadow.position.set(state.position.x, SURFACE_Y + 0.001, -state.position.y);
            const scale = Math.max(0.2, 1 - state.position.z * 0.18);
            shadow.scale.setScalar(scale);
          }
        }

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

    setPlacementResolver(handler) {
      placementHandlerRef.current = handler;
    },

    setPlacementEnabled(enabled) {
      placementEnabledRef.current = enabled;
      const ctx = contextRef.current;
      if (!ctx?.placementMarker) return;
      ctx.placementMarker.visible = enabled;
      ctx.renderer.domElement.style.cursor = enabled ? 'crosshair' : 'default';
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
    const ballShadows = ballsData.all.map((mesh) => {
      const shadowGeo = new THREE.CircleGeometry(0.03, 24);
      const shadowMat = new THREE.MeshBasicMaterial({
        color: 0x000000,
        transparent: true,
        opacity: 0.22,
        depthWrite: false,
      });
      const shadow = new THREE.Mesh(shadowGeo, shadowMat);
      shadow.rotation.x = -Math.PI / 2;
      shadow.position.set(mesh.position.x, SURFACE_Y + 0.001, mesh.position.z);
      shadow.visible = false;
      scene.add(shadow);
      return shadow;
    });
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
      placementMarker: null,
      ballShadows,
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

    const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -SURFACE_Y);
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    const placementPoint = new THREE.Vector3();
    const placementMarker = new THREE.Mesh(
      new THREE.CircleGeometry(0.0285, 24),
      new THREE.MeshBasicMaterial({
        color: 0xFFF8B5,
        transparent: true,
        opacity: 0.7,
        depthWrite: false,
      })
    );
    placementMarker.rotation.x = -Math.PI / 2;
    placementMarker.position.y = SURFACE_Y + 0.001;
    placementMarker.visible = false;
    scene.add(placementMarker);
    contextRef.current.placementMarker = placementMarker;

    const updatePlacementFromPointer = (event) => {
      if (!placementEnabledRef.current || !placementHandlerRef.current) return;
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera.camera);
      if (!raycaster.ray.intersectPlane(plane, placementPoint)) return;
      placementMarker.position.set(placementPoint.x, SURFACE_Y + 0.001, placementPoint.z);
      placementMarker.visible = true;
      if (event.type === 'pointerdown') {
        placementHandlerRef.current({
          x: placementPoint.x,
          y: -placementPoint.z,
        });
      }
    };

    renderer.domElement.addEventListener('pointermove', updatePlacementFromPointer);
    renderer.domElement.addEventListener('pointerdown', updatePlacementFromPointer);

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