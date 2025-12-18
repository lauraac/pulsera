// ====== CONFIGURA AQUÍ ======

// 1) Link de tu grupo de WhatsApp (PÉGALO AQUÍ)
const WHATS_GROUP_URL = "https://chat.whatsapp.com/Dqa2YnPKNluIrI52hQZQTh";

// 2) Invitados
const GUESTS = 86;

// 3) Cards del carrusel (cambia imágenes y títulos)
const CARDS = [
  { title: "Bailes ✨", img: "img/img1.jpg" },
  { title: "Visita invitación 💌", img: "img/img1.jpg" },
  { title: "Galería 📸", img: "img/img1.jpg" },
];

// ====== HORA EN VIVO ======
function pad(n) {
  return String(n).padStart(2, "0");
}
function updateTime() {
  const now = new Date();
  const hh = pad(now.getHours());
  const mm = pad(now.getMinutes());
  document.getElementById("liveTime").textContent = `${hh}:${mm}`;
}
setInterval(updateTime, 1000);
updateTime();

// ====== BOTONES ======
document.getElementById("btnChat").href = WHATS_GROUP_URL;
document.getElementById("guestCount").textContent = String(GUESTS);

const planningSection = document.getElementById("planningSection");
document.getElementById("btnPlanning").addEventListener("click", () => {
  planningSection.scrollIntoView({ behavior: "smooth", block: "start" });
});

// Subir (abre selector de fotos)
const fileInput = document.getElementById("fileInput");
document.getElementById("btnUpload").addEventListener("click", () => {
  fileInput.click();
});
fileInput.addEventListener("change", (e) => {
  const files = [...(e.target.files || [])];
  if (!files.length) return;
  alert(
    `Seleccionaste ${files.length} foto(s). (Aquí luego se suben a Drive/hosting)`
  );
});

// ====== CARRUSEL + ANIMACIÓN (centro se agranda) ======
const carousel = document.getElementById("carousel");

function renderCards() {
  carousel.innerHTML = CARDS.map(
    (c) => `
    <article class="card">
      <div class="card-bg" style="background-image:url('${c.img}')"></div>
      <div class="card-glow"></div>
      <div class="card-pencil">✎</div>
      <div class="card-title">${c.title}</div>
    </article>
  `
  ).join("");
}
renderCards();

// activar la card más centrada (tipo animación del ejemplo)
function setActiveCard() {
  const cards = [...carousel.querySelectorAll(".card")];
  if (!cards.length) return;

  const center = carousel.scrollLeft + carousel.clientWidth / 2;
  let best = { idx: 0, dist: Infinity };

  cards.forEach((card, idx) => {
    const cardCenter = card.offsetLeft + card.clientWidth / 2;
    const dist = Math.abs(center - cardCenter);
    if (dist < best.dist) best = { idx, dist };
  });

  cards.forEach((c, i) => c.classList.toggle("active", i === best.idx));
}
carousel.addEventListener("scroll", () => {
  window.requestAnimationFrame(setActiveCard);
});
window.addEventListener("load", setActiveCard);
setTimeout(setActiveCard, 200);

// ====== DRAG / SWIPE tipo carrusel ======
(function enableCarouselDrag() {
  const el = document.getElementById("carousel");
  if (!el) return;

  let isDown = false;
  let startX = 0;
  let scrollLeft = 0;

  const start = (pageX) => {
    isDown = true;
    startX = pageX - el.offsetLeft;
    scrollLeft = el.scrollLeft;
    el.classList.add("dragging");
  };

  const move = (pageX) => {
    if (!isDown) return;
    const x = pageX - el.offsetLeft;
    const walk = (x - startX) * 1.2; // ✅ velocidad del arrastre
    el.scrollLeft = scrollLeft - walk;
  };

  const end = () => {
    isDown = false;
    el.classList.remove("dragging");
  };

  // Mouse
  el.addEventListener("mousedown", (e) => start(e.pageX));
  el.addEventListener("mousemove", (e) => move(e.pageX));
  el.addEventListener("mouseleave", end);
  el.addEventListener("mouseup", end);

  // Touch
  el.addEventListener("touchstart", (e) => start(e.touches[0].pageX), {
    passive: true,
  });
  el.addEventListener("touchmove", (e) => move(e.touches[0].pageX), {
    passive: true,
  });
  el.addEventListener("touchend", end);
})();

// ====== AUTOSCROLL SUAVE DEL CARRUSEL ======
(function autoScrollCarousel() {
  const carousel = document.getElementById("carousel");
  if (!carousel) return;

  let speed = 0.15; // 🔹 velocidad (entre 0.1 y 0.3 es ideal)
  let isPaused = false;

  function step() {
    if (!isPaused) {
      carousel.scrollLeft += speed;

      // 🔁 cuando llega al final, regresa suave al inicio
      if (
        carousel.scrollLeft + carousel.clientWidth >=
        carousel.scrollWidth - 1
      ) {
        carousel.scrollLeft = 0;
      }
    }
    requestAnimationFrame(step);
  }

  // ⏸️ Pausar al tocar
  carousel.addEventListener("touchstart", () => (isPaused = true));
  carousel.addEventListener("mousedown", () => (isPaused = true));

  // ▶️ Reanudar al soltar
  carousel.addEventListener("touchend", () => (isPaused = false));
  carousel.addEventListener("mouseup", () => (isPaused = false));
  carousel.addEventListener("mouseleave", () => (isPaused = false));

  requestAnimationFrame(step);
})();
