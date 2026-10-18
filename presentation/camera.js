import * as THREE from "../vendor/three.module.js";
export function createCameraControls({ renderer, camera, bodies, missions, data, state, select }) {
  let currentDistance = state.distance;
  const target = new THREE.Vector3(),
    desiredTarget = new THREE.Vector3();
  const ray = new THREE.Raycaster(),
    pointer = new THREE.Vector2();
  let drag = null,
    moved = false;
  renderer.domElement.addEventListener("pointerdown", (e) => {
    drag = { x: e.clientX, y: e.clientY };
    moved = false;
    renderer.domElement.setPointerCapture(e.pointerId);
  });
  renderer.domElement.addEventListener("pointermove", (e) => {
    if (!drag) return;
    const dx = e.clientX - drag.x,
      dy = e.clientY - drag.y;
    if (Math.abs(dx) + Math.abs(dy) > 2) moved = true;
    state.azimuth -= dx * 0.005;
    state.elevation = THREE.MathUtils.clamp(state.elevation + dy * 0.004, 0.12, 1.5);
    drag = { x: e.clientX, y: e.clientY };
  });
  renderer.domElement.addEventListener("pointerup", (e) => {
    if (!moved) {
      pointer.set(
        (e.clientX / innerWidth) * 2 - 1,
        (-e.clientY / innerHeight) * 2 + 1,
      );
      ray.setFromCamera(pointer, camera);
      const hits = ray.intersectObjects(
        bodies.map((b) => b.mesh),
        false,
      );
      if (hits.length)
        select(
          bodies.findIndex((b) => b.mesh === hits[0].object),
          true,
        );
    }
    drag = null;
  });
  renderer.domElement.addEventListener("pointercancel", () => (drag = null));
  renderer.domElement.addEventListener(
    "wheel",
    (e) => {
      e.preventDefault();
      state.distance = THREE.MathUtils.clamp(
        state.distance * Math.exp(e.deltaY * 0.001),
        state.following ? (state.selectedMission === null ? data[state.selected].radius * 4 : state.selectedMission === 2 ? 2 : 5) : 12,
        180,
      );
    },
    { passive: false },
  );
  function update(dt) {
    desiredTarget.copy(
      state.following ? (state.selectedMission === null ? bodies[state.selected].mesh.position : missions[state.selectedMission].marker.getWorldPosition(new THREE.Vector3())) : new THREE.Vector3(3, 0, 0),
    );
    const ease = 1 - Math.exp(-dt * 3);
    target.lerp(desiredTarget, ease);
    currentDistance += (state.distance - currentDistance) * ease;
    camera.position.set(
      target.x + Math.sin(state.azimuth) * Math.cos(state.elevation) * currentDistance,
      target.y + Math.sin(state.elevation) * currentDistance,
      target.z + Math.cos(state.azimuth) * Math.cos(state.elevation) * currentDistance,
    );
    camera.lookAt(target);
    camera.updateMatrixWorld();
  }
  return { update };
}
