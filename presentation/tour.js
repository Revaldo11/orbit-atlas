export function createTour({ visit, stops, state }) {
  const $ = (s) => document.querySelector(s);
  function render() {
    const [title, story] = stops[state.index];
    $("#tour-title").textContent = title;
    $("#tour-narration").textContent = story;
    $("#tour-count").textContent = `PLANET ${state.index + 1} / ${stops.length}`;
    $("#tour-prev").disabled = state.index === 0;
    $("#tour-next").textContent =
      state.index === 7 ? "Selesaikan tur" : "Berikutnya →";
    $("#tour-pause").textContent = state.paused ? "Lanjutkan tur" : "Jeda tur";
    $("#tour-progress").style.width = "0%";
  }
  function visitStop() {
    render();
    visit(state.index + 1);
  }
  function stop() {
    state.stop();
    $("#tour-panel").hidden = true;
    document.body.classList.remove("tour-active");
    $("#tour-start").setAttribute("aria-expanded", "false");
  }
  function finish() {
    $("#tour-count").textContent = "8 PLANET TELAH DIJELAJAHI";
    $("#tour-title").textContent = "Tur selesai";
    $("#tour-narration").textContent =
      "Dari dunia berbatu di dekat Matahari hingga raksasa es di tepian tata surya, setiap planet memiliki ceritanya sendiri. Lanjutkan menjelajah atau mulai perjalanan sekali lagi.";
    $("#tour-pause").textContent = "Ulangi tur";
    $("#tour-next").textContent = "Selesai";
    $("#tour-progress").style.width = "100%";
  }
  function start() {
    state.start();
    $("#tour-panel").hidden = false;
    document.body.classList.add("tour-active");
    $("#tour-start").setAttribute("aria-expanded", "true");
    visitStop();
    $("#tour-pause").focus();
  }
  $("#tour-start").setAttribute("aria-controls", "tour-panel");
  $("#tour-start").setAttribute("aria-expanded", "false");
  $("#tour-start").onclick = start;
  $("#tour-exit").onclick = () => {
    stop();
    $("#tour-start").focus();
  };
  $("#tour-prev").onclick = () => {
    if (state.previous()) visitStop();
  };
  $("#tour-next").onclick = () => {
    const change = state.next();
    if (change === "stop") {
      stop();
      $("#tour-start").focus();
    } else if (change === "visit") visitStop();
    else finish();
  };
  $("#tour-pause").onclick = () => {
    if (state.complete) {
      start();
      return;
    }
    state.togglePause();
    $("#tour-pause").textContent = state.paused ? "Lanjutkan tur" : "Jeda tur";
  };
  return {
    stop,
    update(dt) {
      const change = state.update(dt, document.hidden);
      if (!change) return;
      $("#tour-progress").style.width =
        `${Math.min(100, (state.elapsed / state.duration) * 100)}%`;
      if (change === "visit") visitStop();
      else if (change === "finish") finish();
    },
  };
}
