import { createTour } from "./tour.js";
import * as THREE from "./vendor/three.module.js";
const $ = (s) => document.querySelector(s);
const data = [
  {
    name: "The Sun",
    short: "Sun",
    type: "G-type main-sequence star",
    color: "#f6b953",
    radius: 3.4,
    orbit: 0,
    period: 0,
    diameter: "1,392,700 km",
    distance: "Galactic center · 26,000 ly",
    year: "230 million years",
    desc: "The star that holds our worlds together. Its light travels 150 million kilometers to reach Earth in just over eight minutes.",
  },
  {
    name: "Mercury",
    type: "Terrestrial planet",
    color: "#a9a29a",
    radius: 0.48,
    orbit: 7,
    period: 88,
    diameter: "4,879 km",
    distance: "0.39 AU",
    year: "88 Earth days",
    desc: "Small, swift, and covered in craters. Mercury races around the Sun faster than any other planet, with dramatic swings in temperature.",
  },
  {
    name: "Venus",
    type: "Terrestrial planet",
    color: "#d6b77b",
    radius: 0.8,
    orbit: 10,
    period: 225,
    diameter: "12,104 km",
    distance: "0.72 AU",
    year: "225 Earth days",
    desc: "A brilliant world wrapped in thick clouds. Its dense atmosphere traps heat, making Venus the hottest planet in our solar system.",
  },
  {
    name: "Earth",
    type: "Terrestrial planet",
    color: "#6cafe0",
    radius: 0.86,
    orbit: 13,
    period: 365.25,
    diameter: "12,742 km",
    distance: "1.00 AU",
    year: "365.25 days",
    desc: "Our pale blue home. Liquid oceans, a protective atmosphere, and a remarkable diversity of life make Earth a world unlike any other.",
  },
  {
    name: "Mars",
    type: "Terrestrial planet",
    color: "#d47c59",
    radius: 0.65,
    orbit: 16,
    period: 687,
    diameter: "6,779 km",
    distance: "1.52 AU",
    year: "687 Earth days",
    desc: "A rust-red desert with ancient riverbeds and towering volcanoes. Mars holds clues to a wetter past and the next chapter of exploration.",
  },
  {
    name: "Jupiter",
    type: "Gas giant",
    color: "#cda888",
    radius: 2.05,
    orbit: 22,
    period: 4333,
    diameter: "139,820 km",
    distance: "5.20 AU",
    year: "11.86 Earth years",
    desc: "The giant of our planetary family. Bands of turbulent clouds sweep across Jupiter, home to a storm that has raged for centuries.",
  },
  {
    name: "Saturn",
    type: "Gas giant",
    color: "#ddc597",
    radius: 1.75,
    orbit: 29,
    period: 10759,
    diameter: "116,460 km",
    distance: "9.58 AU",
    year: "29.45 Earth years",
    desc: "An elegant world surrounded by rings of ice and rock. Saturn is so light for its size that its average density is lower than water.",
  },
  {
    name: "Uranus",
    type: "Ice giant",
    color: "#8dcbd1",
    radius: 1.25,
    orbit: 35,
    period: 30687,
    diameter: "50,724 km",
    distance: "19.2 AU",
    year: "84 Earth years",
    desc: "A quiet, blue-green ice giant with an unusual tilt. Uranus rolls around the Sun on its side, creating extreme seasons that last decades.",
  },
  {
    name: "Neptune",
    type: "Ice giant",
    color: "#527bd9",
    radius: 1.2,
    orbit: 41,
    period: 60190,
    diameter: "49,244 km",
    distance: "30.05 AU",
    year: "164.8 Earth years",
    desc: "Dark, cold, and swept by supersonic winds. Neptune guards the edge of the planetary realm, far beyond the warmth of the Sun.",
  },
];
let renderer;
try {
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
} catch (e) {
  $("#universe").innerHTML =
    '<p style="margin:45vh 25px;color:#e9bc8a">This explorer needs WebGL. Please enable hardware acceleration or use a WebGL-capable browser.</p>';
  throw e;
}
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight);
renderer.setClearColor(0x070a0f);
$("#universe").appendChild(renderer.domElement);
const scene = new THREE.Scene(),
  camera = new THREE.PerspectiveCamera(42, innerWidth / innerHeight, 0.1, 1500);
scene.add(new THREE.AmbientLight(0xb5c9ed, 1.1));
const sunlight = new THREE.PointLight(0xffe5bc, 160, 0, 1);
scene.add(sunlight);
let seed = 47;
function rand() {
  seed = (seed * 16807) % 2147483647;
  return (seed - 1) / 2147483646;
}
const starGeo = new THREE.BufferGeometry(),
  starPos = [],
  starColors = [];
for (let i = 0; i < 2600; i++) {
  const v = new THREE.Vector3(rand() - 0.5, rand() - 0.5, rand() - 0.5)
    .normalize()
    .multiplyScalar(200 + rand() * 500);
  starPos.push(v.x, v.y, v.z);
  const c = new THREE.Color().setHSL(
    0.55 + rand() * 0.15,
    0.15 + rand() * 0.2,
    0.35 + rand() * 0.55,
  );
  starColors.push(c.r, c.g, c.b);
}
starGeo.setAttribute("position", new THREE.Float32BufferAttribute(starPos, 3));
starGeo.setAttribute("color", new THREE.Float32BufferAttribute(starColors, 3));
scene.add(
  new THREE.Points(
    starGeo,
    new THREE.PointsMaterial({
      size: 0.45,
      vertexColors: true,
      transparent: true,
      opacity: 0.75,
      sizeAttenuation: true,
    }),
  ),
);
function texture(d, index) {
  const c = document.createElement("canvas");
  c.width = 512;
  c.height = 256;
  const ctx = c.getContext("2d");
  ctx.fillStyle = d.color;
  ctx.fillRect(0, 0, 512, 256);
  for (let y = 0; y < 256; y++) {
    const a = index === 5 || index === 6 ? 0.16 : 0.04;
    ctx.fillStyle = `rgba(${y % 13 < 7 ? "255,230,195" : "40,20,10"},${rand() * a})`;
    ctx.fillRect(0, y, 512, 1 + rand() * 3);
  }
  for (let j = 0; j < 1100; j++) {
    const x = rand() * 512,
      y = rand() * 256,
      r = rand() * 5 + 0.5;
    ctx.fillStyle = `rgba(${index === 0 ? "255,230,120" : "40,28,23"},${rand() * 0.13})`;
    ctx.beginPath();
    ctx.ellipse(x, y, r, r * 0.55, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  if (index === 3) {
    for (let j = 0; j < 50; j++) {
      ctx.fillStyle = j % 3 === 0 ? "#b4bca0" : "#537c60";
      const x = rand() * 512,
        y = 45 + rand() * 170;
      ctx.beginPath();
      for (let k = 0; k < 12; k++) {
        let a = (k / 12) * Math.PI * 2;
        ctx.lineTo(
          x + Math.cos(a) * (8 + rand() * 24),
          y + Math.sin(a) * (5 + rand() * 12),
        );
      }
      ctx.fill();
    }
    for (let j = 0; j < 70; j++) {
      ctx.fillStyle = "#ffffff44";
      ctx.beginPath();
      ctx.ellipse(
        rand() * 512,
        rand() * 256,
        10 + rand() * 20,
        1 + rand() * 3,
        -0.2,
        0,
        7,
      );
      ctx.fill();
    }
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
const bodies = [],
  orbits = new THREE.Group(),
  tails = new THREE.Group();
scene.add(orbits, tails);
data.forEach((d, i) => {
  const material = i
    ? new THREE.MeshStandardMaterial({ map: texture(d, i), roughness: 1 })
    : new THREE.MeshBasicMaterial({ map: texture(d, i), color: 0xffd38b });
  const mesh = new THREE.Mesh(
    new THREE.SphereGeometry(d.radius, 64, 32),
    material,
  );
  scene.add(mesh);
  if (i === 6) {
    const ring = new THREE.Mesh(
      new THREE.RingGeometry(2.2, 3.5, 128),
      new THREE.MeshStandardMaterial({
        color: 0xc9b38d,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.7,
      }),
    );
    ring.rotation.x = -Math.PI / 2 + 0.25;
    mesh.add(ring);
    const gap = new THREE.Mesh(
      new THREE.RingGeometry(2.8, 2.95, 128),
      new THREE.MeshBasicMaterial({ color: 0x15171a, side: THREE.DoubleSide }),
    );
    gap.rotation.copy(ring.rotation);
    gap.position.y = 0.015;
    mesh.add(gap);
  }
  if (i) {
    const points = [];
    for (let j = 0; j <= 240; j++) {
      const a = (j / 240) * Math.PI * 2;
      points.push(
        new THREE.Vector3(Math.cos(a) * d.orbit, 0, Math.sin(a) * d.orbit),
      );
    }
    orbits.add(
      new THREE.Line(
        new THREE.BufferGeometry().setFromPoints(points),
        new THREE.LineBasicMaterial({
          color: 0x718298,
          transparent: true,
          opacity: 0.2,
        }),
      ),
    );
    const tp = new Float32Array(121 * 3),
      col = [];
    for (let j = 0; j <= 120; j++) {
      const c = new THREE.Color(d.color).multiplyScalar((j / 120) * 0.8);
      col.push(c.r, c.g, c.b);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(tp, 3));
    g.setAttribute("color", new THREE.Float32BufferAttribute(col, 3));
    const tail = new THREE.Line(
      g,
      new THREE.LineBasicMaterial({
        vertexColors: true,
        transparent: true,
        opacity: 0.65,
      }),
    );
    tails.add(tail);
    d.tail = tail;
  }
  const label = document.createElement("span");
  label.className = "planet-label";
  label.textContent = d.short || d.name;
  $("#labels").appendChild(label);
  const button = document.createElement("button");
  button.innerHTML = `<span class="orb" style="background:${d.color}"></span><span class="text">${d.short || d.name}<small>${i ? "PLANET 0" + i : "OUR STAR"}</small></span>`;
  button.onclick = () => select(i, true);
  $("#planets").appendChild(button);
  bodies.push({ mesh, label, button });
});
const missions = [
  { name: "Voyager 1", color: "#83d9d0", host: null, desc: "Jelajahi perjalanan wahana menuju ruang antarbintang. Penanda mengikuti lintasan ilustratif keluar dari tata surya.", route: "Menuju antarbintang" },
  { name: "Juno", color: "#c4a1ff", host: 5, desc: "Ikuti wahana pengamat Jupiter pada orbit kutub ilustratif di sekitar planet raksasa ini.", route: "Orbit Jupiter" },
  { name: "Perseverance", color: "#f3a278", host: 4, desc: "Temukan penjelajah Mars dan jejak jelajah ilustratifnya di permukaan planet merah.", route: "Permukaan Mars" },
];
const missionGroup = new THREE.Group();
scene.add(missionGroup);
missions.forEach((m, i) => {
  m.group = new THREE.Group();
  missionGroup.add(m.group);
  const points = [];
  for (let j = 0; j <= 180; j++) {
    const t = j / 180, a = t * Math.PI * 2;
    if (i === 0) points.push(new THREE.Vector3(12 - t * 47, t * 9, -5 - t * 32 + Math.sin(t * Math.PI) * 12));
    if (i === 1) points.push(new THREE.Vector3(Math.cos(a) * 3, Math.sin(a) * 5, Math.sin(a) * 0.8));
    if (i === 2) points.push(new THREE.Vector3(Math.cos(t * 1.4) * Math.cos(0.5 + Math.sin(t * 5) * 0.08), Math.sin(0.5 + Math.sin(t * 5) * 0.08), Math.sin(t * 1.4) * Math.cos(0.5 + Math.sin(t * 5) * 0.08)).multiplyScalar(data[4].radius + 0.025));
  }
  m.curve = new THREE.CatmullRomCurve3(points);
  m.line = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints(m.curve.getPoints(240)),
    new THREE.LineDashedMaterial({ color: m.color, dashSize: i === 2 ? 0.035 : 0.5, gapSize: i === 2 ? 0.02 : 0.3, transparent: true, opacity: 0.65 }),
  );
  m.line.computeLineDistances();
  m.marker = new THREE.Mesh(
    new THREE.OctahedronGeometry(i === 2 ? 0.065 : 0.32),
    new THREE.MeshBasicMaterial({ color: m.color }),
  );
  m.group.add(m.line, m.marker);
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
});
let selectedMission = null;
function selectMission(i) {
  tour.stop();
  selectedMission = i;
  following = true;
  const m = missions[i];
  distance = i === 2 ? 4 : 18;
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
const glowCanvas = document.createElement("canvas");
glowCanvas.width = glowCanvas.height = 128;
const gc = glowCanvas.getContext("2d"),
  gr = gc.createRadialGradient(64, 64, 0, 64, 64, 64);
gr.addColorStop(0, "rgba(255,195,75,.8)");
gr.addColorStop(0.24, "rgba(255,155,45,.22)");
gr.addColorStop(0.55, "rgba(255,120,20,.055)");
gr.addColorStop(1, "rgba(255,100,10,0)");
gc.fillStyle = gr;
gc.fillRect(0, 0, 128, 128);
const glow = new THREE.Sprite(
  new THREE.SpriteMaterial({
    map: new THREE.CanvasTexture(glowCanvas),
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  }),
);
glow.scale.set(23, 23, 1);
scene.add(glow);
let selected = 0,
  following = false,
  paused = false,
  speed = 1,
  days = 0,
  azimuth = 0.28,
  elevation = 0.62,
  distance = innerWidth < 650 ? 120 : 105,
  currentDistance = distance;
const target = new THREE.Vector3(),
  desiredTarget = new THREE.Vector3();
let labelsOn = true;
function select(i, focus, fromTour = false) {
  if (!fromTour) tour?.stop();
  selectedMission = null;
  missions.forEach((m) => m.button.setAttribute("aria-pressed", "false"));
  selected = i;
  following = focus;
  const d = data[i];
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
  if (focus) distance = Math.max(d.radius * 9, 11);
  $("#focus span").textContent = focus
    ? "Focused on " + (d.short || d.name)
    : "Get closer";
}
let tour = createTour({ visit: (i) => select(i, true, true) });
select(0, false);
$("#focus").onclick = () => selectedMission === null ? select(selected, true) : selectMission(selectedMission);
$("#reset").onclick = () => {
  tour.stop();
  following = false;
  distance = innerWidth < 650 ? 120 : 105;
  azimuth = 0.28;
  elevation = 0.62;
  $("#focus span").textContent = "Get closer";
};
$("#pause").onclick = () => {
  paused = !paused;
  $("#pause").textContent = paused ? "▶" : "II";
  $("#pause").setAttribute(
    "aria-label",
    paused ? "Resume simulation" : "Pause simulation",
  );
  $("#status").textContent = paused
    ? "Simulation paused"
    : "Simulation running";
  $(".live").innerHTML =
    `<i></i> ${paused ? "SIMULATION PAUSED" : "LIVE SIMULATION"}`;
};
$("#speed").oninput = (e) => {
  speed = Number(e.target.value);
  $("#speed-value").textContent = speed + "×";
};
$("#labels-toggle").onclick = (e) => {
  labelsOn = !labelsOn;
  e.currentTarget.setAttribute("aria-pressed", labelsOn);
};
$("#trails-toggle").onclick = (e) => {
  orbits.visible = tails.visible = !orbits.visible;
  missions.forEach((m) => (m.line.visible = orbits.visible));
  e.currentTarget.setAttribute("aria-pressed", orbits.visible);
};
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
  azimuth -= dx * 0.005;
  elevation = THREE.MathUtils.clamp(elevation + dy * 0.004, 0.12, 1.5);
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
    distance = THREE.MathUtils.clamp(
      distance * Math.exp(e.deltaY * 0.001),
      following ? (selectedMission === null ? data[selected].radius * 4 : selectedMission === 2 ? 2 : 5) : 12,
      180,
    );
  },
  { passive: false },
);
addEventListener("keydown", (e) => {
  if (e.target.matches("input,button")) return;
  if (e.code === "Space") {
    e.preventDefault();
    $("#pause").click();
  }
  if (e.code === "Escape") $("#reset").click();
});
function resize() {
  renderer.setSize(innerWidth, innerHeight);
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
}
addEventListener("resize", resize);
let last = performance.now();
function animate(now) {
  requestAnimationFrame(animate);
  const dt = Math.max(0, Math.min((now - last) / 1000, 0.05));
  last = now;
  tour.update(dt);
  if (!paused) days += dt * speed * 12;
  $("#days").textContent = days.toFixed(1).padStart(6, "0");
  data.forEach((d, i) => {
    const a = i ? (days / d.period) * Math.PI * 2 + i * 2.399 : 0;
    const mesh = bodies[i].mesh;
    if (i) {
      mesh.position.set(Math.cos(a) * d.orbit, 0, Math.sin(a) * d.orbit);
      const ar = d.tail.geometry.attributes.position;
      for (let j = 0; j <= 120; j++) {
        const angle = a - (1 - j / 120) * 0.8;
        ar.setXYZ(
          j,
          Math.cos(angle) * d.orbit,
          0.015,
          Math.sin(angle) * d.orbit,
        );
      }
      ar.needsUpdate = true;
    }
    if (!paused) mesh.rotation.y += dt * 0.08 * speed;
  });
  missions.forEach((m, i) => {
    if (m.host !== null) m.group.position.copy(bodies[m.host].mesh.position);
    const progress = (days / (i === 0 ? 600 : i === 1 ? 120 : 180)) % 1;
    m.marker.position.copy(m.curve.getPoint(i === 1 ? progress : 1 - Math.abs(progress * 2 - 1)));
  });
  desiredTarget.copy(
    following ? (selectedMission === null ? bodies[selected].mesh.position : missions[selectedMission].marker.getWorldPosition(new THREE.Vector3())) : new THREE.Vector3(3, 0, 0),
  );
  const ease = 1 - Math.exp(-dt * 3);
  target.lerp(desiredTarget, ease);
  currentDistance += (distance - currentDistance) * ease;
  camera.position.set(
    target.x + Math.sin(azimuth) * Math.cos(elevation) * currentDistance,
    target.y + Math.sin(elevation) * currentDistance,
    target.z + Math.cos(azimuth) * Math.cos(elevation) * currentDistance,
  );
  camera.lookAt(target);
  camera.updateMatrixWorld();
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
  renderer.render(scene, camera);
}
requestAnimationFrame(animate);
