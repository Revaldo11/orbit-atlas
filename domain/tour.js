export function createTourState(count) {
  const state = {
    active: false,
    paused: false,
    index: 0,
    elapsed: 0,
    complete: false,
    duration: 14,
    go(i) {
      state.index = i;
      state.elapsed = 0;
      state.complete = false;
    },
    start() {
      state.active = true;
      state.paused = false;
      state.go(0);
    },
    stop() {
      state.active = false;
    },
    finish() {
      state.complete = true;
    },
    previous() {
      if (state.index === 0) return false;
      state.go(state.index - 1);
      return true;
    },
    next() {
      if (state.complete) {
        state.stop();
        return "stop";
      }
      if (state.index < count - 1) {
        state.go(state.index + 1);
        return "visit";
      }
      state.finish();
      return "finish";
    },
    togglePause() {
      state.paused = !state.paused;
    },
    update(dt, hidden) {
      if (!state.active || state.paused || state.complete || hidden) return;
      state.elapsed += dt;
      if (state.elapsed >= state.duration) return state.next();
      return "progress";
    },
  };
  return state;
}
