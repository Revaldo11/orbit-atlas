import * as THREE from "../vendor/three.module.js";
const $ = (s) => document.querySelector(s);
export function createPanel({ data, bodies, missions, camera, select, selectMission }) {
  data.forEach((d, i) => {
    const label = document.createElement("span");
    label.className = "planet-label";
    label.textContent = d.short || d.name;
    $("#labels").appendChild(label);
    const button = document.createElement("button");
    button.innerHTML = `<span class="orb" style="background:${d.color}"></span><span class="text">${d.short || d.name}<small>${i ? "PLANET 0" + i : "OUR STAR"}</small></span>`;
    button.onclick = () => select(i, true);
    $("#planets").appendChild(button);
    Object.assign(bodies[i], { label, button });
  });
  missions.forEach((m, i) => {
    m.label = document.createElement("button");
    m.label.className = "planet-label mission-label";
    m.label.style.color = m.color;
    m.label.textContent = "◇ " + m.name;
    m.label.onclick = () => selectMission(i);
    $("#labels").appendChild(m.label);
    m.button = document.createElement("button");
    m.button.textContent = "◇ " + m.name;
    m.button.style.setProperty("--mission-color", m.color);
    m.button.onclick = () => selectMission(i);
    m.button.setAttribute("aria-pressed", "false");
    $("#missions-list").appendChild(m.button);
    [m.button, m.label].forEach((button) => {
      button.setAttribute("aria-describedby", "mission-tooltip");
      button.onpointerenter = button.onfocus = () => {
        const tooltip = $("#mission-tooltip");
        tooltip.querySelector("strong").textContent = m.name + " · " + m.route;
        tooltip.querySelector("p").textContent = m.desc;
        tooltip.style.borderColor = m.color;
        tooltip.hidden = false;
        const rect = button.getBoundingClientRect();
        tooltip.style.left = Math.max(12, Math.min(rect.left, innerWidth - tooltip.offsetWidth - 12)) + "px";
        tooltip.style.top = Math.max(12, Math.min(rect.bottom, innerHeight - tooltip.offsetHeight - 12)) + "px";
      };
      button.onpointerleave = button.onblur = (e) => {
        if (!$("#mission-tooltip").contains(e.relatedTarget)) $("#mission-tooltip").hidden = true;
      };
    });
  });
  $("#mission-tooltip").onpointerleave = () => ($("#mission-tooltip").hidden = true);
  addEventListener("keydown", (e) => {
    if (e.code === "Escape") $("#mission-tooltip").hidden = true;
  });
  addEventListener("resize", () => ($("#mission-tooltip").hidden = true));
  function showMission(i) {
    const m = missions[i];
    $("#name").textContent = m.name;
    $("#category").textContent = "MISI ANTARIKSA";
    $("#number").textContent = `0${i + 1} / 03`;
    $("#description").textContent = m.desc;
    $("#planet-icon").style.background = m.color;
    $("#planet-icon").style.boxShadow = `0 0 30px ${m.color}44`;
    $("#stats").innerHTML = `<div class="stat"><span>Lintasan</span><strong>${m.route}</strong></div><div class="stat"><span>Visualisasi</span><strong>Ilustrasi berulang</strong></div>`;
    $("#focus span").textContent = "Focused on " + m.name;
    bodies.forEach((b) => {
      b.button.classList.remove("active");
      b.button.setAttribute("aria-pressed", "false");
      b.label.classList.remove("active");
    });
    missions.forEach((mission, j) => mission.button.setAttribute("aria-pressed", String(j === i)));
  }
  function showPlanet(i, focus) {
    const d = data[i];
    missions.forEach((m) => m.button.setAttribute("aria-pressed", "false"));
    $("#name").textContent = d.name;
    $("#category").textContent = i
      ? d.type.toUpperCase()
      : "THE CENTER OF IT ALL";
    $("#number").textContent = "0" + i + " / 08";
    $("#description").textContent = d.desc;
    $("#planet-icon").style.background =
      `radial-gradient(circle at 30% 25%,${d.color},${d.color} 25%,#0b1019 100%)`;
    $("#planet-icon").style.boxShadow = `0 0 30px ${d.color}22`;
    $("#stats").innerHTML =
      `<div class="stat"><span>Diameter</span><strong>${d.diameter}</strong></div><div class="stat"><span>${i ? "Distance from Sun" : "Surface temperature"}</span><strong>${i ? d.distance : "5,500 °C"}</strong></div><div class="stat"><span>${i ? "Orbital period" : "Age"}</span><strong>${i ? d.year : "4.6 billion years"}</strong></div>`;
    bodies.forEach((b, j) => {
      b.button.classList.toggle("active", j === i);
      b.button.setAttribute("aria-pressed", String(j === i));
      b.label.classList.toggle("active", j === i);
    });
    $("#focus span").textContent = focus
      ? "Focused on " + (d.short || d.name)
      : "Get closer";
  }
  function updateLabels(labelsOn) {
    bodies.forEach((b, i) => {
      const pos = b.mesh.position.clone();
      pos.y -= data[i].radius + 0.5;
      pos.project(camera);
      b.label.style.display =
        labelsOn && pos.z < 1 && pos.z > -1 ? "block" : "none";
      b.label.style.left = (pos.x * 0.5 + 0.5) * innerWidth + "px";
      b.label.style.top = (-pos.y * 0.5 + 0.5) * innerHeight + "px";
    });
    missions.forEach((m) => {
      const world = m.marker.getWorldPosition(new THREE.Vector3());
      let visible = true;
      if (m.host !== null) {
        const center = bodies[m.host].mesh.position;
        const direction = world.clone().sub(camera.position).normalize();
        const along = center.clone().sub(camera.position).dot(direction);
        const closest = camera.position.clone().addScaledVector(direction, along);
        visible = along < 0 || along > camera.position.distanceTo(world) || closest.distanceTo(center) > data[m.host].radius;
      }
      const pos = world.project(camera);
      m.label.style.display = labelsOn && visible && pos.z > -1 && pos.z < 1 ? "block" : "none";
      m.label.style.left = (pos.x * 0.5 + 0.5) * innerWidth + "px";
      m.label.style.top = (-pos.y * 0.5 + 0.5) * innerHeight + "px";
    });
  }
  function updateDays(days) {
    $("#days").textContent = days.toFixed(1).padStart(6, "0");
  }
  return { showPlanet, showMission, updateLabels, updateDays };
}
