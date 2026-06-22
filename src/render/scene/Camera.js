import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { CAMERA } from '@/config/constants.js';

export class Camera {
  constructor(width, height, domElement) {
    this.width = width;
    this.height = height;
    this.domElement = domElement;

    this.moveSpeed = 0.05;

    this.keys = {
      w: false,
      a: false,
      s: false,
      d: false,
    };

    this.camera = this._createCamera();
    this.controls = this._createOrbitControls();

    this._bindEvents();
  }

  _createCamera() {
    const camera = new THREE.PerspectiveCamera(
      CAMERA.fov,
      this.width / this.height,
      0.1,
      100
    );

    camera.position.set(
      CAMERA.defaultPosition.x,
      CAMERA.defaultPosition.y,
      CAMERA.defaultPosition.z
    );

    camera.lookAt(
      CAMERA.defaultTarget.x,
      CAMERA.defaultTarget.y,
      CAMERA.defaultTarget.z
    );

    return camera;
  }

  _createOrbitControls() {
    const controls = new OrbitControls(
      this.camera,
      this.domElement
    );

    controls.enableDamping = true;
    controls.dampingFactor = 0.08;

    controls.enableRotate = true;
    controls.enableZoom = true;
    controls.enablePan = true;

    controls.rotateSpeed = 0.8;
    controls.zoomSpeed = 1.2;
    controls.panSpeed = 0.7;

    controls.minDistance = CAMERA.minDistance;
    controls.maxDistance = CAMERA.maxDistance;

    /*
      5° ≈ شبه علوي
      85° ≈ شبه جانبي

      يمنع النزول تحت الطاولة
    */
    controls.minPolarAngle = THREE.MathUtils.degToRad(0);

    controls.maxPolarAngle = THREE.MathUtils.degToRad(180);

    /*
      دوران كامل حول الطاولة
    */
    controls.minAzimuthAngle = -Infinity;
    controls.maxAzimuthAngle = Infinity;

    controls.target.set(0, 0, 0);

    controls.update();

    return controls;
  }

  _bindEvents() {
    this._onKeyDown = this._onKeyDown.bind(this);
    this._onKeyUp = this._onKeyUp.bind(this);

    window.addEventListener(
      'keydown',
      this._onKeyDown
    );

    window.addEventListener(
      'keyup',
      this._onKeyUp
    );
  }

  _onKeyDown(event) {
    const key = event.key.toLowerCase();

    if (key in this.keys) {
      this.keys[key] = true;
    }

    if (key === 'c') {
      this.reset();
    }
  }

  _onKeyUp(event) {
    const key = event.key.toLowerCase();

    if (key in this.keys) {
      this.keys[key] = false;
    }
  }

  _move() {
    const forward = new THREE.Vector3();

    this.camera.getWorldDirection(forward);

    forward.y = 0;
    forward.normalize();

    const right = new THREE.Vector3()
      .crossVectors(
        forward,
        new THREE.Vector3(0, 1, 0)
      )
      .normalize();

    if (this.keys.w) {
      const delta = forward
        .clone()
        .multiplyScalar(this.moveSpeed);

      this.camera.position.add(delta);
      this.controls.target.add(delta);
    }

    if (this.keys.s) {
      const delta = forward
        .clone()
        .multiplyScalar(-this.moveSpeed);

      this.camera.position.add(delta);
      this.controls.target.add(delta);
    }

    if (this.keys.a) {
      const delta = right
        .clone()
        .multiplyScalar(this.moveSpeed);

      this.camera.position.add(delta);
      this.controls.target.add(delta);
    }

    if (this.keys.d) {
      const delta = right
        .clone()
        .multiplyScalar(-this.moveSpeed);

      this.camera.position.add(delta);
      this.controls.target.add(delta);
    }
  }

  reset() {
    this.camera.position.set(
      CAMERA.defaultPosition.x,
      CAMERA.defaultPosition.y,
      CAMERA.defaultPosition.z
    );

    this.controls.target.set(
      CAMERA.defaultTarget.x,
      CAMERA.defaultTarget.y,
      CAMERA.defaultTarget.z
    );

    this.controls.update();
  }

  resize(width, height) {
    this.width = width;
    this.height = height;

    this.camera.aspect =
      width / height;

    this.camera.updateProjectionMatrix();
  }

  update() {
    this._move();
    this.controls.update();
  }

  dispose() {
    window.removeEventListener(
      'keydown',
      this._onKeyDown
    );

    window.removeEventListener(
      'keyup',
      this._onKeyUp
    );

    this.controls.dispose();
  }
}