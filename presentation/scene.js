import * as THREE from "../vendor/three.module.js";
const $ = (s) => document.querySelector(s);
export function createScene({ data, missionData, orbitAngle, orbitPosition, missionProgress }) {
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
    bodies.push({ mesh });
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
      bodies[i].tail = tail;
    }
  });
  const missions = missionData.map((m) => ({ ...m }));
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
  });
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
  function resize() {
    renderer.setSize(innerWidth, innerHeight);
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
  }
  addEventListener("resize", resize);
  function update(dt, { days, paused, speed }) {
    data.forEach((d, i) => {
      const a = orbitAngle(days, d.period, i);
      const mesh = bodies[i].mesh;
      if (i) {
        mesh.position.set(...orbitPosition(a, d.orbit));
        const ar = bodies[i].tail.geometry.attributes.position;
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
      const progress = missionProgress(days, i);
      m.marker.position.copy(m.curve.getPoint(progress));
    });
  }
  return { renderer, scene, camera, bodies, missions, orbits, tails, update };
}
