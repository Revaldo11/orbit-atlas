const stops = [
  [
    "Merkurius",
    "Perjalanan kita dimulai dari planet terdekat dengan Matahari. Merkurius memiliki permukaan penuh kawah dan menyelesaikan satu orbit hanya dalam 88 hari Bumi.",
  ],
  [
    "Venus",
    "Di balik awan tebalnya, Venus menyimpan panas yang luar biasa. Efek rumah kaca yang kuat menjadikannya planet terpanas, meskipun Merkurius lebih dekat dengan Matahari.",
  ],
  [
    "Bumi",
    "Inilah rumah kita. Lautan air cair menutupi sekitar 71 persen permukaan Bumi. Atmosfernya melindungi kehidupan dan membantu menjaga suhu yang mendukung keberagaman makhluk hidup.",
  ],
  [
    "Mars",
    "Warna merah Mars berasal dari besi yang teroksidasi di permukaannya. Jejak sungai purba menunjukkan bahwa planet ini pernah memiliki air yang mengalir di permukaan.",
  ],
  [
    "Jupiter",
    "Kita tiba di planet terbesar. Jupiter merupakan raksasa gas dengan pita awan yang bergolak. Bintik Merah Besarnya adalah badai raksasa yang telah diamati selama berabad-abad.",
  ],
  [
    "Saturnus",
    "Cincin Saturnus tersusun dari bongkahan es dan batu dengan berbagai ukuran. Planet raksasa gas ini memiliki massa jenis rata-rata yang lebih rendah daripada air.",
  ],
  [
    "Uranus",
    "Uranus tampak biru kehijauan karena metana di atmosfernya. Sumbu rotasinya sangat miring sehingga planet ini seolah berguling saat mengelilingi Matahari.",
  ],
  [
    "Neptunus",
    "Perjalanan berakhir di Neptunus, planet terjauh dari Matahari. Anginnya dapat melampaui kecepatan suara, dan satu putaran mengelilingi Matahari memerlukan hampir 165 tahun Bumi.",
  ],
];
export function createTour({ visit }) {
  const $ = (s) => document.querySelector(s);
  let active = false,
    paused = false,
    index = 0,
    elapsed = 0,
    complete = false;
  const duration = 14;
  function render() {
    const [title, story] = stops[index];
    $("#tour-title").textContent = title;
    $("#tour-narration").textContent = story;
    $("#tour-count").textContent = `PLANET ${index + 1} / ${stops.length}`;
    $("#tour-prev").disabled = index === 0;
    $("#tour-next").textContent =
      index === 7 ? "Selesaikan tur" : "Berikutnya →";
    $("#tour-pause").textContent = paused ? "Lanjutkan tur" : "Jeda tur";
    $("#tour-progress").style.width = "0%";
  }
  function go(i) {
    index = i;
    elapsed = 0;
    complete = false;
    render();
    visit(index + 1);
  }
  function stop() {
    active = false;
    $("#tour-panel").hidden = true;
    document.body.classList.remove("tour-active");
    $("#tour-start").setAttribute("aria-expanded", "false");
  }
  function finish() {
    complete = true;
    $("#tour-count").textContent = "8 PLANET TELAH DIJELAJAHI";
    $("#tour-title").textContent = "Tur selesai";
    $("#tour-narration").textContent =
      "Dari dunia berbatu di dekat Matahari hingga raksasa es di tepian tata surya, setiap planet memiliki ceritanya sendiri. Lanjutkan menjelajah atau mulai perjalanan sekali lagi.";
    $("#tour-pause").textContent = "Ulangi tur";
    $("#tour-next").textContent = "Selesai";
    $("#tour-progress").style.width = "100%";
  }
  function start() {
    active = true;
    paused = false;
    $("#tour-panel").hidden = false;
    document.body.classList.add("tour-active");
    $("#tour-start").setAttribute("aria-expanded", "true");
    go(0);
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
    if (index > 0) go(index - 1);
  };
  $("#tour-next").onclick = () => {
    if (complete) {
      stop();
      $("#tour-start").focus();
    } else if (index < 7) go(index + 1);
    else finish();
  };
  $("#tour-pause").onclick = () => {
    if (complete) {
      start();
      return;
    }
    paused = !paused;
    $("#tour-pause").textContent = paused ? "Lanjutkan tur" : "Jeda tur";
  };
  return {
    stop,
    update(dt) {
      if (!active || paused || complete || document.hidden) return;
      elapsed += dt;
      $("#tour-progress").style.width =
        `${Math.min(100, (elapsed / duration) * 100)}%`;
      if (elapsed >= duration) {
        if (index < 7) go(index + 1);
        else finish();
      }
    },
  };
}
