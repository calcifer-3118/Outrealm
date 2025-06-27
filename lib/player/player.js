import * as THREE from "three";

export class ThirdPersonPlayer {
  constructor({ model, camera, walkAnimationClip = null }) {
    if (!model || !camera) throw new Error("model and camera required");

    this.model = model;
    this.camera = camera;
    this.speed = 5;
    this.turnSpeed = 2; // rotation speed
    this.keys = {};

    this.mixer = null;
    this.walkAction = null;

    if (walkAnimationClip) {
      this.mixer = new THREE.AnimationMixer(model);
      this.walkAction = this.mixer.clipAction(walkAnimationClip);
      this.walkAction.loop = THREE.LoopRepeat;
      this.walkAction.clampWhenFinished = true;
    }

    // Keyboard input
    window.addEventListener("keydown", (e) => {
      this.keys[e.key.toLowerCase()] = true;
    });
    window.addEventListener("keyup", (e) => {
      this.keys[e.key.toLowerCase()] = false;
    });
  }

  update(delta) {
    if (this.mixer) this.mixer.update(delta);

    let isMoving = false;

    if (this.keys["a"]) {
      this.model.rotation.y += this.turnSpeed * delta;
    }

    if (this.keys["d"]) {
      this.model.rotation.y -= this.turnSpeed * delta;
    }

    if (this.keys["w"]) {
      const forward = new THREE.Vector3(
        Math.sin(this.model.rotation.y),
        0,
        Math.cos(this.model.rotation.y)
      );
      this.model.position.addScaledVector(forward, this.speed * delta);
      isMoving = true;
    }

    if (this.keys["s"]) {
      const backward = new THREE.Vector3(
        -Math.sin(this.model.rotation.y),
        0,
        -Math.cos(this.model.rotation.y)
      );
      this.model.position.addScaledVector(backward, this.speed * delta);
      isMoving = true;
    }

    if (this.walkAction) {
      if (isMoving && !this.walkAction.isRunning()) {
        this.walkAction.reset().play();
      } else if (!isMoving && this.walkAction.isRunning()) {
        this.walkAction.stop();
      }
    }

    // Third-person camera placement
    const cameraOffset = new THREE.Vector3(0, 5, -6);
    cameraOffset.applyAxisAngle(
      new THREE.Vector3(0, 1, 0),
      this.model.rotation.y
    );
    const targetPosition = this.model.position.clone().add(cameraOffset);
    this.camera.position.lerp(targetPosition, 0.1); // smooth camera follow
    this.camera.lookAt(
      this.model.position.clone().add(new THREE.Vector3(0, 1.5, 0))
    );
  }
}
