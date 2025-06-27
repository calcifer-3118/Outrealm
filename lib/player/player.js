import * as THREE from "three";

export class ThirdPersonPlayer {
  constructor({
    model,
    camera,
    walkAnimationClip = null,
    enablePointerLock = false,
    pitchLimits = { min: -Math.PI / 4, max: Math.PI / 4 }, // vertical look limits
  }) {
    if (!model || !camera) throw new Error("model and camera required");

    this.model = model;
    this.camera = camera;
    this.speed = 5;
    this.turnSpeed = 2;
    this.keys = {};
    this.rotationDelta = 0;
    this.pitchDelta = 0;
    this.cameraPitch = 0;
    this.pitchLimits = pitchLimits;

    this.mixer = null;
    this.walkAction = null;

    if (walkAnimationClip) {
      this.mixer = new THREE.AnimationMixer(model);
      this.walkAction = this.mixer.clipAction(walkAnimationClip);
      this.walkAction.loop = THREE.LoopRepeat;
      this.walkAction.clampWhenFinished = true;
    }

    window.addEventListener("keydown", (e) => {
      this.keys[e.key.toLowerCase()] = true;
    });
    window.addEventListener("keyup", (e) => {
      this.keys[e.key.toLowerCase()] = false;
    });

    if (enablePointerLock) {
      this.initPointerLock();
    }
  }

  initPointerLock() {
    const canvas = document.body;
    canvas.addEventListener("click", () => {
      canvas.requestPointerLock();
    });

    document.addEventListener("pointerlockchange", () => {
      if (document.pointerLockElement === canvas) {
        document.addEventListener("mousemove", this.onMouseMove);
      } else {
        document.removeEventListener("mousemove", this.onMouseMove);
      }
    });

    this.onMouseMove = (event) => {
      const sensitivity = 0.002;
      this.rotationDelta = -event.movementX * sensitivity;
      this.pitchDelta = -event.movementY * sensitivity;
    };
  }

  update(delta) {
    if (this.mixer) this.mixer.update(delta);

    let isMoving = false;

    // Mouse rotation
    if (this.rotationDelta) {
      this.model.rotation.y += this.rotationDelta;
      this.rotationDelta = 0;
    }

    if (this.pitchDelta) {
      this.cameraPitch += this.pitchDelta;
      this.cameraPitch = Math.max(
        this.pitchLimits.min,
        Math.min(this.pitchLimits.max, this.cameraPitch)
      );
      this.pitchDelta = 0;
    }

    // Keyboard rotation
    if (this.keys["a"]) {
      this.model.rotation.y += this.turnSpeed * delta;
    }
    if (this.keys["d"]) {
      this.model.rotation.y -= this.turnSpeed * delta;
    }

    // Movement
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
    this.camera.position.lerp(targetPosition, 0.1);

    const lookAtTarget = this.model.position
      .clone()
      .add(new THREE.Vector3(0, 1.5 + this.cameraPitch * 5, 0));
    this.camera.lookAt(lookAtTarget);
  }
}
