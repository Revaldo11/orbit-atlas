import assert from "node:assert/strict";
import { test } from "node:test";
import { frameDelta, advanceSimulation, orbitAngle, orbitPosition, missionProgress } from "../domain/simulation.js";
import { createTourState } from "../domain/tour.js";
import { data } from "../data/planets.js";

test("simulation clamps frame time and respects pause and speed", () => {
  assert.equal(frameDelta(500, 1000), 0);
  assert.equal(frameDelta(2000, 1000), 0.05);
  assert.equal(frameDelta(1016, 1000), 0.016);
  const simulation = { days: 0, paused: false, speed: 1 };
  advanceSimulation(simulation, 0.05);
  assert.ok(Math.abs(simulation.days - 0.6) < 1e-12);
  simulation.paused = true;
  advanceSimulation(simulation, 0.05);
  assert.ok(Math.abs(simulation.days - 0.6) < 1e-12);
  simulation.paused = false;
  simulation.speed = 5;
  advanceSimulation(simulation, 0.05);
  assert.ok(Math.abs(simulation.days - 3.6) < 1e-12);
});

test("each planet returns to its initial orbit position after one period", () => {
  assert.equal(orbitAngle(10, 0, 0), 0);
  for (const [i, planet] of data.entries()) {
    const start = orbitPosition(orbitAngle(0, planet.period, i), planet.orbit);
    const end = orbitPosition(orbitAngle(planet.period, planet.period, i), planet.orbit);
    assert.ok(Math.abs(Math.hypot(...start) - planet.orbit) < 1e-10);
    start.forEach((value, axis) => assert.ok(Math.abs(value - end[axis]) < 1e-10));
  }
});

test("missions preserve loop and out-and-back progress", () => {
  for (const [i, period] of [600, 120, 180].entries()) {
    assert.equal(missionProgress(0, i), 0);
    assert.equal(missionProgress(period / 2, i), i === 1 ? 0.5 : 1);
    assert.equal(missionProgress(period, i), 0);
    assert.equal(missionProgress(period * 0.75, i), i === 1 ? 0.75 : 0.5);
  }
});

test("tour pauses independently, skips hidden time, completes and restarts", () => {
  const tour = createTourState(8);
  assert.equal(tour.update(14, false), undefined);
  tour.start();
  assert.equal(tour.previous(), false);
  assert.equal(tour.update(7, false), "progress");
  tour.togglePause();
  assert.equal(tour.update(14, false), undefined);
  tour.togglePause();
  assert.equal(tour.update(14, true), undefined);
  assert.equal(tour.elapsed, 7);
  assert.equal(tour.update(7, false), "visit");
  assert.equal(tour.index, 1);
  assert.equal(tour.elapsed, 0);
  assert.equal(tour.previous(), true);
  assert.equal(tour.index, 0);
  for (let i = 1; i < 8; i++) {
    assert.equal(tour.update(14, false), "visit");
    assert.equal(tour.index, i);
  }
  assert.equal(tour.update(14, false), "finish");
  assert.equal(tour.complete, true);
  assert.equal(tour.next(), "stop");
  assert.equal(tour.active, false);
  tour.start();
  assert.equal(tour.index, 0);
  assert.equal(tour.complete, false);
  assert.equal(tour.paused, false);
  tour.stop();
  assert.equal(tour.update(14, false), undefined);
});
