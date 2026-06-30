import * as THREE from 'three';
import { CAMERA } from '@/global/constants.js';

export class Camera {
  constructor(width, height, domElement) {
    this.width = width;
    this.height = height;
    this.domElement = domElement;

    // Circle Camera System: theta, phi, radius
    this.theta = CAMERA.initialTheta;
    this.phi = CAMERA.initialPhi;
    this.radius = CAMERA.initialRadius;

    // track mouse dragging
    this.dragging = false;
    this.prevX = 0;
    this.prevY = 0;
    this.touchPoint = null;

    this.camera = this._createCamera();
    this._updateCameraPosition();
    this._bindEvents();
  }

  _createCamera() {
    const camera = new THREE.PerspectiveCamera(
      CAMERA.fov,
      this.width / this.height,
      0.1,
      100
    );
    return camera;
  }

  _updateCameraPosition() {
    // calculate camera position based on spherical coordinates
    this.camera.position.set(
      this.radius * Math.sin(this.theta) * Math.sin(this.phi),
      this.radius * Math.cos(this.phi),
      this.radius * Math.cos(this.theta) * Math.sin(this.phi)
    );
    
    // look at a point on the table
    this.camera.lookAt(
      CAMERA.lookAtPoint.x,
      CAMERA.lookAtPoint.y,
      CAMERA.lookAtPoint.z
    );
  }

  _bindEvents() {
    // mouse events
    this.domElement.addEventListener('mousedown', (e) => this._onMouseDown(e));
    window.addEventListener('mouseup', (e) => this._onMouseUp(e));
    window.addEventListener('mousemove', (e) => this._onMouseMove(e));
    
    // wheel events
    this.domElement.addEventListener('wheel', (e) => this._onWheel(e), { passive: false });
    
    // touch events
    this.domElement.addEventListener('touchstart', (e) => this._onTouchStart(e));
    this.domElement.addEventListener('touchmove', (e) => this._onTouchMove(e), { passive: false });
  }

  _onMouseDown(e) {
    this.dragging = true;
    this.prevX = e.clientX;
    this.prevY = e.clientY;
  }

  _onMouseUp() {
    this.dragging = false;
  }

  _onMouseMove(e) {
    if (!this.dragging) return;
    
    // update theta and phi based on mouse movement
    this.theta -= (e.clientX - this.prevX) * CAMERA.rotationSpeed;
    this.phi = Math.max(
      CAMERA.minPhi,
      Math.min(CAMERA.maxPhi, this.phi - (e.clientY - this.prevY) * CAMERA.tiltSpeed)
    );
    
    this.prevX = e.clientX;
    this.prevY = e.clientY;
    this._updateCameraPosition();
  }

  _onWheel(e) {
    // zoom in/out when using the mouse wheel
    this.radius = Math.max(
      CAMERA.minRadius,
      Math.min(CAMERA.maxRadius, this.radius + e.deltaY * CAMERA.zoomSpeed)
    );
    e.preventDefault();
    this._updateCameraPosition();
  }

  _onTouchStart(e) {
    if (e.touches.length > 0) {
      this.touchPoint = e.touches[0];
    }
  }

  _onTouchMove(e) {
    if (!this.touchPoint) return;
    
    const touch = e.touches[0];
    this.theta -= (touch.clientX - this.touchPoint.clientX) * CAMERA.rotationSpeed;
    this.phi = Math.max(
      CAMERA.minPhi,
      Math.min(CAMERA.maxPhi, this.phi - (touch.clientY - this.touchPoint.clientY) * CAMERA.tiltSpeed)
    );
    
    this.touchPoint = touch;
    e.preventDefault();
    this._updateCameraPosition();
  }

  // Public methods to control the camera
  rotateLeft() {
    this.theta -= 0.38;
    this._updateCameraPosition();
  }

  rotateRight() {
    this.theta += 0.38;
    this._updateCameraPosition();
  }

  rotateTop() {
    this.phi = 0.38;
    this.radius = 8;
    this._updateCameraPosition();
  }

  reset() {
    this.theta = CAMERA.initialTheta;
    this.phi = CAMERA.initialPhi;
    this.radius = CAMERA.initialRadius;
    this._updateCameraPosition();
  }

  resize(width, height) {
    this.width = width;
    this.height = height;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
  }

  update() {
    // update camera position each frame
  }

  dispose() {
    this.domElement.removeEventListener('mousedown', (e) => this._onMouseDown(e));
    window.removeEventListener('mouseup', (e) => this._onMouseUp(e));
    window.removeEventListener('mousemove', (e) => this._onMouseMove(e));
    this.domElement.removeEventListener('wheel', (e) => this._onWheel(e));
    this.domElement.removeEventListener('touchstart', (e) => this._onTouchStart(e));
    this.domElement.removeEventListener('touchmove', (e) => this._onTouchMove(e));
  }
}