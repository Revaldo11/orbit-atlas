export function frameDelta(now, last) {
  return Math.max(0, Math.min((now - last) / 1000, 0.05));
}

export function advanceSimulation(simulation, dt) {
  if (!simulation.paused) simulation.days += dt * simulation.speed * 12;
}

export function orbitAngle(days, period, index) {
  return index ? (days / period) * Math.PI * 2 + index * 2.399 : 0;
}

export function orbitPosition(angle, orbit) {
  return [Math.cos(angle) * orbit, 0, Math.sin(angle) * orbit];
}

export function missionProgress(days, index) {
  const progress = (days / (index === 0 ? 600 : index === 1 ? 120 : 180)) % 1;
  return index === 1 ? progress : 1 - Math.abs(progress * 2 - 1);
}
