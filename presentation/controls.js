const $ = (s) => document.querySelector(s);
export function bindControls({ state, simulation, tour, select, selectMission, orbits, tails, missions }) {
  $("#focus").onclick = () => state.selectedMission === null ? select(state.selected, true) : selectMission(state.selectedMission);
  $("#reset").onclick = () => {
    tour.stop();
    state.following = false;
    state.distance = innerWidth < 650 ? 120 : 105;
    state.azimuth = 0.28;
    state.elevation = 0.62;
    $("#focus span").textContent = "Get closer";
  };
  $("#pause").onclick = () => {
    simulation.paused = !simulation.paused;
    $("#pause").textContent = simulation.paused ? "▶" : "II";
    $("#pause").setAttribute(
      "aria-label",
      simulation.paused ? "Resume simulation" : "Pause simulation",
    );
    $("#status").textContent = simulation.paused
      ? "Simulation paused"
      : "Simulation running";
    $(".live").innerHTML =
      `<i></i> ${simulation.paused ? "SIMULATION PAUSED" : "LIVE SIMULATION"}`;
  };
  $("#speed").oninput = (e) => {
    simulation.speed = Number(e.target.value);
    $("#speed-value").textContent = simulation.speed + "×";
  };
  $("#labels-toggle").onclick = (e) => {
    state.labelsOn = !state.labelsOn;
    e.currentTarget.setAttribute("aria-pressed", state.labelsOn);
  };
  $("#trails-toggle").onclick = (e) => {
    orbits.visible = tails.visible = !orbits.visible;
    missions.forEach((m) => (m.line.visible = orbits.visible));
    e.currentTarget.setAttribute("aria-pressed", orbits.visible);
  };
  addEventListener("keydown", (e) => {
    if (e.target.matches("input,button")) return;
    if (e.code === "Space") {
      e.preventDefault();
      $("#pause").click();
    }
    if (e.code === "Escape") $("#reset").click();
  });
}
