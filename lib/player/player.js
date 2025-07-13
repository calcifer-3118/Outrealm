import * as THREE from "three";

export class ThirdPersonPlayer {
  constructor({
    model,
    camera,
    walkAnimationClip = null,
    idleAnimationClip = null,
    enablePointerLock = false,
    pitchLimits = { min: -Math.PI / 4, max: Math.PI / 4 },
    mixer = null,
    existingActions = null,
    useCollision = false,
    sharedGrid = null,
    updateSharedObstacles = null,
  }) {
    if (!model || !camera) throw new Error("model and camera required");

    this.model = model;
    this.camera = camera;
    this.speed = 1.5;
    this.keys = {};
    this.pitchLimits = pitchLimits;
    this.enabled = true;
    this.useCollision = useCollision;
    this.sharedGrid = sharedGrid;
    this.updateSharedObstacles = updateSharedObstacles;

    this.mixer = mixer || new THREE.AnimationMixer(model);

    this.walkAction =
      existingActions?.walkAction ||
      (walkAnimationClip ? this.mixer.clipAction(walkAnimationClip) : null);
    this.idleAction =
      existingActions?.idleAction ||
      (idleAnimationClip ? this.mixer.clipAction(idleAnimationClip) : null);

    if (this.walkAction) this.walkAction.setLoop(THREE.LoopRepeat);
    if (this.idleAction) this.idleAction.setLoop(THREE.LoopRepeat);

    this.activeAction = this.idleAction;
    this.activeAction?.play();

    this.cameraYaw = model.rotation.y;
    this.cameraPitch = 0;
    this.rotationDelta = 0;
    this.pitchDelta = 0;

    this.tmpVec = new THREE.Vector3();

    window.addEventListener("keydown", (e) => {
      this.keys[e.key.toLowerCase()] = true;
    });

    window.addEventListener("keyup", (e) => {
      this.keys[e.key.toLowerCase()] = false;
    });

    if (enablePointerLock) this.initPointerLock();
  }

  initPointerLock() {
    const canvas = document.body;
    canvas.addEventListener("click", () => canvas.requestPointerLock());

    this.onMouseMove = (e) => {
      if (!this.enabled) return;
      const sensitivity = 0.002;
      this.rotationDelta = -e.movementX * sensitivity;
      this.pitchDelta = -e.movementY * sensitivity;
    };

    document.addEventListener("pointerlockchange", () => {
      if (document.pointerLockElement === document.body) {
        document.addEventListener("mousemove", this.onMouseMove);
      } else {
        document.removeEventListener("mousemove", this.onMouseMove);
      }
    });
  }

  fadeToAction(action, duration) {
    if (this.activeAction !== action && action) {
      action.reset();
      action.play();
      this.activeAction.crossFadeTo(action, duration, false);
      this.activeAction = action;
    }
  }

  disable() {
    this.enabled = false;
  }

  enable() {
    this.enabled = true;
  }

  isPositionWalkable(pos) {
    if (!this.useCollision || !this.sharedGrid) return true;
    const { x, z } = this.sharedGrid.worldToGrid(pos);
    const inBounds =
      x >= 0 && z >= 0 && x < this.sharedGrid.cols && z < this.sharedGrid.rows;
    return inBounds && this.sharedGrid.nodes[x][z] === 0;
  }

  update(delta) {
    this.mixer?.update(delta);
    if (this.updateSharedObstacles && this.model.parent) {
      this.updateSharedObstacles(this.model.parent, this.model);
    }

    const yaw = this.enabled ? this.cameraYaw : this.model.rotation.y;
    const camOffset = new THREE.Vector3(0, 1.8, -2).applyAxisAngle(
      new THREE.Vector3(0, 1, 0),
      yaw
    );
    const camTargetPos = this.model.position.clone().add(camOffset);
    this.camera.position.lerp(camTargetPos, 0.1);

    const lookAt = this.model.position
      .clone()
      .add(new THREE.Vector3(0, 1.5 + this.cameraPitch * 5, 0));
    this.camera.lookAt(lookAt);

    if (!this.enabled) return;

    this.cameraYaw += this.rotationDelta;
    this.cameraPitch += this.pitchDelta;
    this.cameraPitch = Math.max(
      this.pitchLimits.min,
      Math.min(this.pitchLimits.max, this.cameraPitch)
    );
    this.rotationDelta = 0;
    this.pitchDelta = 0;

    const isForward = this.keys["w"];
    const isBackward = this.keys["s"];
    const isLeft = this.keys["a"];
    const isRight = this.keys["d"];
    const isMoving = isForward || isBackward || isLeft || isRight;

    const forwardVec = new THREE.Vector3(
      Math.sin(this.cameraYaw),
      0,
      Math.cos(this.cameraYaw)
    );
    const rightVec = new THREE.Vector3()
      .crossVectors(forwardVec, new THREE.Vector3(0, 1, 0))
      .normalize();

    let moveDir = new THREE.Vector3();
    if (isForward) moveDir.add(forwardVec);
    if (isBackward) moveDir.sub(forwardVec);
    if (isLeft) moveDir.sub(rightVec);
    if (isRight) moveDir.add(rightVec);
    moveDir.normalize();

    if (isMoving && moveDir.lengthSq() > 0) {
      const targetYaw = Math.atan2(moveDir.x, moveDir.z);
      let deltaYaw = targetYaw - this.model.rotation.y;
      if (deltaYaw > Math.PI) deltaYaw -= Math.PI * 2;
      if (deltaYaw < -Math.PI) deltaYaw += Math.PI * 2;
      this.model.rotation.y += deltaYaw * 0.1;

      const nextPos = this.model.position
        .clone()
        .add(moveDir.clone().multiplyScalar(this.speed * delta));
      if (this.isPositionWalkable(nextPos)) {
        this.model.position.copy(nextPos);
      }
    }

    this.fadeToAction(isMoving ? this.walkAction : this.idleAction, 0.3);
  }

  dispose() {
    this.mixer?.uncacheRoot(this.model);
  }
}
