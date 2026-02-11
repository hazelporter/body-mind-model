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

// Memory: tension fades by percentage, not by command
tension *= 0.92;     // 8% fade per tick (adjust to taste)
tension += build;

tension = Math.max(0, Math.min(tension, 4.0));

  tensionEl.textContent = tension.toFixed(2);

  // Convert tension into “blur thickening”
  // Higher tension => more opacity + more blur + subtle swell
 const opacity = 0.12 + tension * 0.35;     // bigger visual range
const blurPx  = 8 + tension * 26;          // more obvious thickening
const scale   = 0.85 + tension * 0.28;     // swell is readable

// NEW: deformation — circle becomes “organic” as tension rises
const squish = Math.min(45, Math.round(tension * 18)); // 0..45-ish
signalEl.style.borderRadius = `${50 + squish}% ${50 - squish}% ${50 + squish}% ${50 - squish}% / ${50 - squish}% ${50 + squish}% ${50 - squish}% ${50 + squish}%`;
// NEW: slow drift (reluctant movement)
const drift = tension * 18; // pixels
const dx = Math.sin(tick / 6) * drift;
const dy = Math.cos(tick / 7) * drift;
signalEl.style.transform = `translate(${dx}px, ${dy}px) scale(${scale})`;

signalEl.style.opacity = String(Math.min(opacity, 0.9));
signalEl.style.filter = `blur(${blurPx}px)`;
signalEl.style.transform = `scale(${scale})`;

}, 5000);
