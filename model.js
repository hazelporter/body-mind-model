const weightEl = document.getElementById("weight");
const intentEl = document.getElementById("intent");
const signalEl = document.getElementById("signal");
const tickEl = document.getElementById("tick");
const tensionEl = document.getElementById("tension");

let tick = 0;

// The user sets “pressure targets”
let weightTarget = Number(weightEl.value);
let intentTarget = Number(intentEl.value);

// The system state moves slowly (delay / resistance)
let weightState = weightTarget;
let intentState = intentTarget;

// Tension is “felt difference” with memory (clears slowly)
let tension = 0;

// Slow adaptation rates (small on purpose)
const ADAPT_RATE = 0.12;     // how fast state approaches target per tick
const CLEAR_RATE = 0.08;     // how fast tension can clear per tick
const BUILD_RATE = 0.22;     // how fast tension builds per tick

weightEl.addEventListener("input", () => {
  weightTarget = Number(weightEl.value);
});

intentEl.addEventListener("input", () => {
  intentTarget = Number(intentEl.value);
});

// Every 5 seconds: time is sovereign
setInterval(() => {
  tick += 1;
  tickEl.textContent = String(tick);

  // terrain and map drift slowly toward what you “apply”
  weightState += (weightTarget - weightState) * ADAPT_RATE;
  intentState += (intentTarget - intentState) * ADAPT_RATE;

  // difference (0..100)
  const diff = Math.abs(weightState - intentState);

  // build tension when diff exists; clear slowly when it doesn't
  const build = (diff / 100) * BUILD_RATE;
  tension += build;
  tension -= CLEAR_RATE;

  // tension cannot go below 0, and we cap it so visuals remain sane
  tension = Math.max(0, Math.min(tension, 2.5));

  tensionEl.textContent = tension.toFixed(2);

  // Convert tension into “blur thickening”
  // Higher tension => more opacity + more blur + subtle swell
  const opacity = 0.18 + tension * 0.25;           // ~0.18..0.80
  const blurPx = 12 + tension * 18;                // ~12..57
  const scale = 1 + tension * 0.10;                // ~1..1.25

  signalEl.style.opacity = String(Math.min(opacity, 0.85));
  signalEl.style.filter = `blur(${blurPx}px)`;
  signalEl.style.transform = `scale(${scale})`;

}, 5000);
