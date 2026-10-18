import { data } from "./data/planets.js";
import { missions } from "./data/missions.js";
import { stops } from "./data/tour-stops.js";
import { frameDelta, advanceSimulation, orbitAngle, orbitPosition, missionProgress } from "./domain/simulation.js";
import { createTourState } from "./domain/tour.js";
import { createScene } from "./presentation/scene.js";
import { createPanel } from "./presentation/panel.js";
import { createCameraControls } from "./presentation/camera.js";
import { bindControls } from "./presentation/controls.js";
import { createTour } from "./presentation/tour.js";

const simulation = { paused: false, speed: 1, days: 0 };
const state = {
  selected: 0,
  selectedMission: null,
  following: false,
  azimuth: 0.28,
  elevation: 0.62,
  distance: innerWidth < 650 ? 120 : 105,
  labelsOn: true,
};
const view = createScene({ data, missionData: missions, orbitAngle, orbitPosition, missionProgress });
const panel = createPanel({ data, ...view, select, selectMission });
const cameraControls = createCameraControls({ data, ...view, state, select });
const tour = createTour({ stops, state: createTourState(stops.length), visit: (i) => select(i, true, true) });

function select(i, focus, fromTour = false) {
  if (!fromTour) tour.stop();
  state.selectedMission = null;
  state.selected = i;
  state.following = focus;
  if (focus) state.distance = Math.max(data[i].radius * 9, 11);
  panel.showPlanet(i, focus);
}

function selectMission(i) {
  tour.stop();
  state.selectedMission = i;
  state.following = true;
  state.distance = i === 2 ? 4 : 18;
  panel.showMission(i);
}

select(0, false);
bindControls({ state, simulation, tour, select, selectMission, ...view });
let last = performance.now();
function animate(now) {
  requestAnimationFrame(animate);
  const dt = frameDelta(now, last);
  last = now;
  tour.update(dt);
  advanceSimulation(simulation, dt);
  panel.updateDays(simulation.days);
  view.update(dt, simulation);
  cameraControls.update(dt);
  panel.updateLabels(state.labelsOn);
  view.renderer.render(view.scene, view.camera);
}
requestAnimationFrame(animate);
