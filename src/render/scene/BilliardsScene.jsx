import { forwardRef, useEffect, useImperativeHandle, useRef,} from 'react';
import * as THREE from 'three';
import { COLORS, TABLE, BALL, SURFACE_Y,} from '@/global/constants.js';
import { createLights } from './Lights.js';
import { createTable } from '../objects/createTable.js';
import { createBalls } from '../objects/createBalls.js';
import { Camera } from './Camera.js';

const BilliardsScene = forwardRef(function BilliardsScene(_, ref) {
  const mountRef = useRef(null);
  const contextRef = useRef(null);

  useImperativeHandle(ref, () => ({
   
    sync(allBallStates, controls) {
      const ctx = contextRef.current;
      if (!ctx) return;

      // allBallStates = [ {position, orientation}, ... ]
      // index 0 = cue ball, يطابق ctx.ballsData.all
      allBallStates.forEach((state, i) => {
        const mesh = ctx.ballsData.all[i];
        if (!mesh || !state) return;

        mesh.position.set(
          state.position.x,
          SURFACE_Y + BALL.radius + 0.0002, // TODO jumps
          -state.position.y,
        );

        mesh.quaternion.set(
          state.orientation.x,
          state.orientation.z,
          -state.orientation.y,
          state.orientation.w,
        );
      });
    },

    resetCamera() {
      const ctx = contextRef.current;

      if (!ctx) return;

      ctx.camera.reset();
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

    const ballsData = createBalls(scene);
    const ball = ballsData.cueBall;

    /*
     * Debug Contact Marker
     */
    const contactMarker = new THREE.Mesh(
      new THREE.SphereGeometry(
        0.006,
        8,
        8
      ),
      new THREE.MeshStandardMaterial({
        color: COLORS.aim,
        emissive: COLORS.aim,
        emissiveIntensity: 0.4,
      })
    );

    contactMarker.visible = false;

    scene.add(contactMarker);

    /*
     * Shared Context
     */
    contextRef.current = {
      scene,
      renderer,
      camera,
      ball,
      ballsData,
      contactMarker,
      currentBallRadius: BALL.radius,
    };

    /*
     * Resize
     */
    const handleResize = () => {

      const width = mount.clientWidth;
      const height = mount.clientHeight;

      camera.resize(
        width,
        height
      );

      renderer.setSize(
        width,
        height
      );
    };

    window.addEventListener(
      'resize',
      handleResize
    );

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
      cancelAnimationFrame(
        animationId
      );

      window.removeEventListener(
        'resize',
        handleResize
      );

      camera.dispose();

      renderer.dispose();

      mount.removeChild(
        renderer.domElement
      );

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