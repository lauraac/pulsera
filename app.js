const DRIVE_UPLOAD_WEBAPP_URL =
  "https://script.google.com/macros/s/AKfycbwORiy9kq1lDvVduLLBoUYX205xxgdCMLvPlPlR7UqgP_j9WRo6IyKlURg_Q4oQULdjCg/exec";

const GOOGLE_SHEETS_WEBAPP_URL =
  "https://script.google.com/macros/s/AKfycbx3sTmlhKrzAOYRJIC8ufGr05RDo74QgeP49mhR0iweYDDNksqdbRbJmup6pnPOefCzrw/exec";

console.log("WEBAPP URL:", GOOGLE_SHEETS_WEBAPP_URL);
const btnPlanning = document.getElementById("btnPlanning");
const overlay = document.getElementById("planningOverlay");
const closeBtn = document.getElementById("closePlanning");
const WHATS_GROUP_URL = "https://chat.whatsapp.com/Hv1TJc6uhKDEDhWWL6Udrt";

// 2) Invitados

// ====== HORA EN VIVO ======
function pad(n) {
  return String(n).padStart(2, "0");
}
function updateTime() {
  const now = new Date();
  const hh = pad(now.getHours());
  const mm = pad(now.getMinutes());
  const el = document.getElementById("liveTime");
  if (el) el.textContent = `${hh}:${mm}`;
}
setInterval(updateTime, 1000);
updateTime();

async function refreshGuestCount() {
  const el = document.getElementById("guestCount");
  if (!el) return;

  el.textContent = "⏳";
  try {
    const res = await fetch(`${GOOGLE_SHEETS_WEBAPP_URL}?_=${Date.now()}`, {
      method: "GET",
      cache: "no-store",
    });
    const data = await res.json();
    el.textContent = data && data.ok ? String(data.yesCount || 0) : "0";
  } catch (err) {
    console.error("fetch contador falló:", err);
    el.textContent = "⚠️";
  }
}

// ✅ al cargar + refrescar cada 20s
document.addEventListener("DOMContentLoaded", () => {
  refreshGuestCount();
  setInterval(refreshGuestCount, 20000);
});

// ✅ opcional: al dar click en el botón de invitados, refresca al instante
document
  .getElementById("btnGuests")
  ?.addEventListener("click", refreshGuestCount);

// ====== BOTONES ======
const btnChat = document.getElementById("btnChat");
if (btnChat) btnChat.href = WHATS_GROUP_URL;

const guestCount = document.getElementById("guestCount");

function showToast(message, duration = 3000) {
  const toast = document.getElementById("toast");
  if (!toast) return;

  toast.textContent = message;
  toast.classList.remove("hidden");
  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.classList.add("hidden"), 300);
  }, duration);
}

const planningCard = document.getElementById("planningCard");
const carousel = document.getElementById("carousel");

if (btnPlanning && planningCard && carousel) {
  btnPlanning.addEventListener("click", () => {
    // 1️⃣ Scroll suave al carrusel
    carousel.scrollIntoView({ behavior: "smooth", block: "center" });

    // 2️⃣ Centrar la tarjeta Planning dentro del carrusel
    setTimeout(() => {
      const left =
        planningCard.offsetLeft -
        (carousel.clientWidth - planningCard.clientWidth) / 2;

      carousel.scrollTo({ left, behavior: "smooth" });

      // 3️⃣ Voltear la tarjeta automáticamente
      setTimeout(() => {
        planningCard.classList.add("is-flipped");
      }, 350);
    }, 450);
  });
}

// Subir (selector)
const fileInput = document.getElementById("fileInput");
const btnUpload = document.getElementById("btnUpload");

function toBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result); // data:image/...;base64,...
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function uploadToDrive(file) {
  const base64 = await toBase64(file);

  const payload = {
    fileName: `${Date.now()}_${file.name}`,
    base64,
  };

  await fetch(DRIVE_UPLOAD_WEBAPP_URL, {
    method: "POST",
    mode: "no-cors",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify(payload),
  });
}

if (btnUpload && fileInput) {
  btnUpload.addEventListener("click", () => fileInput.click());

  fileInput.addEventListener("change", async (e) => {
    const files = [...(e.target.files || [])];
    if (!files.length) return;

    showToast(`⏳ Subiendo ${files.length} foto(s)...`);

    for (const f of files) {
      await uploadToDrive(f);
    }

    showToast("✨ ¡Gracias! Tu imagen se subió a la galería 💖", 4000);
  });
}

// ====== CARRUSEL PRO (Flip + Auto-scroll + Active center) ======
(function carouselPro() {
  const carousel = document.getElementById("carousel");
  if (!carousel) return;

  const getCards = () => [...carousel.querySelectorAll(".flipCard")];

  // Activar la tarjeta centrada (animación)
  function setActiveCard() {
    const items = getCards();
    if (!items.length) return;

    const center = carousel.scrollLeft + carousel.clientWidth / 2;
    let bestIdx = 0;
    let bestDist = Infinity;

    items.forEach((card, idx) => {
      const cardCenter = card.offsetLeft + card.clientWidth / 2;
      const dist = Math.abs(center - cardCenter);
      if (dist < bestDist) {
        bestDist = dist;
        bestIdx = idx;
      }
    });

    items.forEach((c, i) => c.classList.toggle("is-active", i === bestIdx));
  }

  carousel.addEventListener("scroll", () =>
    requestAnimationFrame(setActiveCard)
  );
  window.addEventListener("load", () => setTimeout(setActiveCard, 150));

  // Flip + navegar
  carousel.addEventListener("click", (e) => {
    const btn = e.target.closest(".goBtn");
    const card = e.target.closest(".flipCard");
    if (!card) return;

    // Botón Ir => navegar
    if (btn) {
      // ✅ Cerrar = solo voltear de regreso
      if (btn.textContent.trim().toLowerCase() === "cerrar") {
        card.classList.remove("is-flipped");
        return;
      }

      // Ir = navegar
      const link = card.getAttribute("data-link");
      if (!link) return;

      if (link.startsWith("#")) {
        document.querySelector(link)?.scrollIntoView({ behavior: "smooth" });
      } else {
        window.open(link, "_blank");
      }
      return;
    }

    // Click en tarjeta => flip
    card.classList.toggle("is-flipped");

    // Si hay una volteada, pausamos autoscroll para que lea
    paused = getCards().some((c) => c.classList.contains("is-flipped"));
  });

  // ====== AUTO-PASO POR TARJETAS (1→2→3→4→1) ======
  let paused = false;
  let index = 0;
  const intervalMs = 3500;

  function goToCard(i) {
    const items = getCards();
    if (!items.length) return;

    index = (i + items.length) % items.length;

    const card = items[index];

    // ✅ Cálculo exacto del scroll para centrar la tarjeta (funciona en iPhone)
    const left =
      card.offsetLeft - (carousel.clientWidth - card.clientWidth) / 2;

    carousel.scrollTo({ left, behavior: "smooth" });

    // refresca el "active"
    requestAnimationFrame(setActiveCard);
  }

  function tick() {
    if (paused) return;

    // Si hay una volteada, no avanzamos
    const anyFlipped = getCards().some((c) =>
      c.classList.contains("is-flipped")
    );
    if (anyFlipped) return;

    goToCard(index + 1);
  }

  // Arranca
  setTimeout(() => goToCard(0), 400);

  // Intervalo
  setInterval(tick, intervalMs);

  // Pausar/reanudar por interacción
  const pause = () => (paused = true);
  const resume = () => {
    const anyFlipped = getCards().some((c) =>
      c.classList.contains("is-flipped")
    );
    paused = anyFlipped; // si está volteada, se mantiene pausado
  };

  carousel.addEventListener("touchstart", pause, { passive: true });
  carousel.addEventListener("touchend", resume);
  carousel.addEventListener("mousedown", pause);
  carousel.addEventListener("mouseup", resume);
  carousel.addEventListener("mouseleave", resume);
})();
btnPlanning?.addEventListener("click", () => {
  overlay.classList.remove("hidden");
  document.body.classList.add("no-scroll");
});

closeBtn?.addEventListener("click", () => {
  overlay.classList.add("hidden");
  document.body.classList.remove("no-scroll");
});
