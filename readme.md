# Outrealm

[![npm version](https://img.shields.io/npm/v/outrealm.svg?style=flat-square)](https://www.npmjs.com/package/outrealm)
[![Build Status](https://img.shields.io/github/actions/workflow/status/yourusername/outrealm/ci.yml?branch=main&style=flat-square)](https://github.com/yourusername/outrealm/actions)
[![License](https://img.shields.io/npm/l/outrealm?style=flat-square)](LICENSE)
[![Downloads](https://img.shields.io/npm/dm/outrealm.svg?style=flat-square)](https://www.npmjs.com/package/outrealm)
[![GitHub Stars](https://img.shields.io/github/stars/yourusername/outrealm?style=flat-square)](https://github.com/yourusername/outrealm/stargazers)
[![GitHub Issues](https://img.shields.io/github/issues/yourusername/outrealm?style=flat-square)](https://github.com/yourusername/outrealm/issues)

---

## What is Outrealm?

**Outrealm** is a lightweight JavaScript library for creating seamless inter-domain portals between 3D web experiences.  
It enables transferring player state — including position, rotation, and more — between separate Three.js projects with smooth transitions.

Perfect for modular virtual worlds, multi-scene portfolios, or any app requiring immersive teleportation across domains.

---

## Features

- Store and transfer user state securely via backend API
- Seamless fade transition effect between domains
- Built-in `ThirdPersonPlayer` class with smooth WASD movement and third-person camera
- Optional GLTF animation support
- Easy integration with any Three.js project

---

## Installation

```bash
npm install outrealm
```

---

## Usage

### Creating a Portal

```js
import { createPortal } from "outrealm";

const destination = "https://my-other-experience.com";
const playerState = {
  position: { x: 1, y: 0, z: 3 },
  rotation: { y: Math.PI / 2 },
};

await createPortal(destination, playerState);
```

### Receiving User State

```js
import { receivePortalUserState } from "outrealm";

const userState = await receivePortalUserState();
if (userState) {
  // Apply position, rotation, etc. to player
  player.model.position.set(
    userState.position.x,
    userState.position.y,
    userState.position.z
  );
  player.model.rotation.y = userState.rotation.y;
}
```

### Using the Built-in ThirdPersonPlayer

```js
import { ThirdPersonPlayer } from "outrealm";

const player = new ThirdPersonPlayer({
  model: gltf.scene,
  camera: camera,
  walkAnimationClip: gltf.animations[0], // optional
});

// In your animation loop
function animate(delta) {
  player.update(delta);
}
```

---

## API

### `createPortal(destinationUrl, userState, options?)`

Saves the current user state and transitions to a new domain.

- `destinationUrl` (string): The URL to redirect the user to
- `userState` (object): The state object to transfer (e.g. position, rotation)
- `options` (object, optional): Options passed to the transition animation

### `receivePortalUserState()`

Returns a promise that resolves with the user state received from the backend, or `null` if invalid.

### `ThirdPersonPlayer({ model, camera, walkAnimationClip })`

A WASD-movement based third-person controller class.

- `model` (THREE.Object3D): The 3D character model
- `camera` (THREE.Camera): The camera to follow the player
- `walkAnimationClip` (THREE.AnimationClip, optional): An optional walk animation

---

## License

MIT License. See [LICENSE](./lib/LICENSE) for details.

---

## Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

---

## Acknowledgments

- [Three.js](https://threejs.org/) for powering 3D
- [seamless-interdomain-transition](https://www.npmjs.com/package/seamless-interdomain-transition) for domain switching
- [Vercel](https://vercel.com) for backend hosting

---

## Author

[Dheer Jain](https://github.com/calcifer-3118)

---

Enjoy building seamless virtual experiences with **Outrealm**!
