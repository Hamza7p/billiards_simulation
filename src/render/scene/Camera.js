import * as THREE from 'three';
import { SIZES } from '@/config/constants.js';

export default function Camera(width, height) {
    const aspect = width / height;
    const view = SIZES.view;
    const camera = new THREE.OrthographicCamera(
      -view * aspect,
      view * aspect,
      view,
      -view,
      0.1,
      20
    );

    camera.position.set(0, 0, 5);
    camera.lookAt(0, 0, 0);
    return camera
}