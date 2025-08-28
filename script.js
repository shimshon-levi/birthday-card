const canvas = document.getElementById("scratch");
const ctx = canvas.getContext("2d", { willReadFrequently: true });
const card = document.getElementById("scratchCard");
const result = document.getElementById("result");
const wow = document.getElementById("wow");
const balloonLayer = document.getElementById("balloon-layer");

let isDrawing = false;
let alreadyShown = false;
let totalPixels = 0;

/* --- התאמת קנבס למידות הכרטיס ומילוי שכבת הכיסוי --- */
function drawCover() {
  // גרדיין כסוף יפה לשכבת הגירוד
  const grd = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  grd.addColorStop(0, "#d7d7d7");
  grd.addColorStop(1, "#bfbfbf");
  ctx.globalCompositeOperation = "source-over";
  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // טקסט מכוון
  ctx.font = `${Math.max(16, canvas.width / 18)}px Arial`;
  ctx.fillStyle = "#000000cc";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("גרדי כאן כדי לגלות!", canvas.width / 2, canvas.height / 2);
}

function resizeCanvas() {
  const ratio = window.devicePixelRatio || 1;
  canvas.width = Math.floor(card.clientWidth * ratio);
  canvas.height = Math.floor(card.clientHeight * ratio);
  canvas.style.width = card.clientWidth + "px";
  canvas.style.height = card.clientHeight + "px";
  ctx.scale(ratio, ratio);
  totalPixels = (canvas.width * canvas.height) / (ratio * ratio);
  drawCover();
}
window.addEventListener("resize", resizeCanvas);
window.addEventListener("orientationchange", resizeCanvas);

/* ודא שהתמונה נטענת לפני שמתחילים (כך שמיד יופיע מטושטש) */
function preloadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = resolve;
    img.onerror = reject;
    img.src = src;
  });
}

/* --- גירוד --- */
function getXY(e) {
  const rect = canvas.getBoundingClientRect();
  const clientX = e.touches ? e.touches[0].clientX : e.clientX;
  const clientY = e.touches ? e.touches[0].clientY : e.clientY;
  return { x: clientX - rect.left, y: clientY - rect.top };
}

function scratch(e) {
  if (!isDrawing) return;
  e.preventDefault(); // למנוע גלילה במגע
  const { x, y } = getXY(e);

  ctx.globalCompositeOperation = "destination-out";
  ctx.beginPath();
  const brush = Math.max(14, canvas.clientWidth / 20);
  ctx.arc(x, y, brush, 0, Math.PI * 2);
  ctx.fill();

  checkReveal();
}

function checkReveal() {
  // חישוב חלק יחסי שקוף
  const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
  let transparent = 0;
  for (let i = 3; i < data.length; i += 4) {
    if (data[i] === 0) transparent++;
  }
  const percent = (transparent / (canvas.width * canvas.height)) * 100;

  if (percent > 68 && !alreadyShown) {
    alreadyShown = true;
    result.classList.add("clear");
    showSurprise();
  }
}

/* --- תצוגת הפתעה --- */
function showSurprise() {
  wow.classList.add("show");
  launchConfetti(150);
  launchBalloons(16); // אפשר לשנות כמות בלונים
}

/* קונפטי צבעוני */
function launchConfetti(count = 120) {
  for (let i = 0; i < count; i++) {
    const confetti = document.createElement("div");
    confetti.className = "confetti";
    confetti.style.left = Math.random() * 100 + "vw";
    confetti.style.backgroundColor = `hsl(${Math.random() * 360},100%,50%)`;
    confetti.style.animationDuration = Math.random() * 2.5 + 2.2 + "s";
    document.body.appendChild(confetti);
    setTimeout(() => confetti.remove(), 5200);
  }
}

/* בלונים מרחפים */
function launchBalloons(count = 12) {
  for (let i = 0; i < count; i++) {
    const b = document.createElement("div");
    b.className = "balloon";
    const hue = Math.floor(Math.random() * 360);
    b.style.setProperty("--balloon-color", `hsl(${hue} 90% 65%)`);
    b.style.left = Math.random() * 100 + "vw";
    b.style.setProperty("--dur", 7 + Math.random() * 4 + "s");
    b.style.setProperty("--swing", Math.random() * 60 - 30 + "px");
    balloonLayer.appendChild(b);
    setTimeout(() => b.remove(), 11000);
  }
}

/* אירועי עכבר/מגע */
canvas.addEventListener("mousedown", () => {
  isDrawing = true;
});
canvas.addEventListener("mouseup", () => {
  isDrawing = false;
});
canvas.addEventListener("mouseleave", () => {
  isDrawing = false;
});
canvas.addEventListener("mousemove", scratch);

canvas.addEventListener(
  "touchstart",
  (e) => {
    isDrawing = true;
    e.preventDefault();
  },
  { passive: false }
);
canvas.addEventListener(
  "touchend",
  (e) => {
    isDrawing = false;
    e.preventDefault();
  },
  { passive: false }
);
canvas.addEventListener(
  "touchcancel",
  (e) => {
    isDrawing = false;
    e.preventDefault();
  },
  { passive: false }
);
canvas.addEventListener("touchmove", scratch, { passive: false });

/* אתחול */
(async function init() {
  try {
    // אם שמתם את התמונה בתיקייה אחרת – עדכנו גם כאן:
    await preloadImage("birthday-kotel.jpg");
  } catch {
    console.warn("תמונת ההפתעה לא נטענה – ודאו את הנתיב/השם.");
  }
  resizeCanvas();
})();
