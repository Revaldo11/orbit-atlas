import assert from "node:assert/strict";
import { test } from "node:test";
import { createTour } from "../presentation/tour.js";
import { createTourState } from "../domain/tour.js";
import { stops } from "../data/tour-stops.js";

test("tour view preserves navigation, progress, focus and visit callbacks", () => {
  const elements = new Map();
  const classes = new Set();
  const $ = (selector) => {
    if (!elements.has(selector)) elements.set(selector, {
      style: {},
      setAttribute(name, value) { this[name] = value; },
      focus() { document.activeElement = this; },
    });
    return elements.get(selector);
  };
  globalThis.document = {
    hidden: false,
    querySelector: $,
    body: { classList: { add: (name) => classes.add(name), remove: (name) => classes.delete(name) } },
  };
  try {
    const visits = [];
    const tour = createTour({ visit: (i) => visits.push(i), stops, state: createTourState(stops.length) });
    $("#tour-start").onclick();
    assert.deepEqual(visits, [1]);
    assert.equal($("#tour-title").textContent, stops[0][0]);
    assert.equal($("#tour-prev").disabled, true);
    assert.equal(document.activeElement, $("#tour-pause"));
    tour.update(7);
    assert.equal($("#tour-progress").style.width, "50%");
    $("#tour-pause").onclick();
    tour.update(14);
    assert.equal($("#tour-progress").style.width, "50%");
    $("#tour-pause").onclick();
    document.hidden = true;
    tour.update(14);
    assert.equal(visits.length, 1);
    document.hidden = false;
    tour.update(7);
    assert.deepEqual(visits, [1, 2]);
    assert.equal($("#tour-progress").style.width, "0%");
    $("#tour-prev").onclick();
    assert.equal(visits.at(-1), 1);
    for (let i = 0; i < 8; i++) $("#tour-next").onclick();
    assert.equal($("#tour-title").textContent, "Tur selesai");
    assert.equal($("#tour-progress").style.width, "100%");
    $("#tour-pause").onclick();
    assert.equal(visits.at(-1), 1);
    $("#tour-exit").onclick();
    assert.equal($("#tour-panel").hidden, true);
    assert.equal(document.activeElement, $("#tour-start"));
    assert.equal(classes.has("tour-active"), false);
    $("#tour-start").onclick();
    tour.stop();
    const count = visits.length;
    tour.update(14);
    assert.equal(visits.length, count);
    assert.equal($("#tour-start")["aria-expanded"], "false");
  } finally {
    delete globalThis.document;
  }
});
