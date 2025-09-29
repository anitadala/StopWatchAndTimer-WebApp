// Utility
function pad(num, size = 2) {
  return String(num).padStart(size, "0");
}
function formatMs(ms) {
  const total = Math.max(0, Math.floor(ms));
  const centi = Math.floor((total % 1000) / 10);
  const seconds = Math.floor(total / 1000) % 60;
  const minutes = Math.floor(total / 60000);
  return `${pad(minutes)}:${pad(seconds)}.${pad(centi, 2)}`;
}
function formatMsNoMs(ms) {
  const totSec = Math.ceil(Math.max(0, ms) / 1000);
  const minutes = Math.floor(totSec / 60);
  const seconds = totSec % 60;
  return `${pad(minutes)}:${pad(seconds)}`;
}

// Stopwatch
class Stopwatch {
  constructor(displayEl, lapsEl) {
    this.displayEl = displayEl;
    this.lapsEl = lapsEl;
    this.running = false;
    this.startTime = 0;
    this.elapsed = 0;
    this.raf = null;
  }
  start() {
    if (this.running) return;
    this.running = true;
    this.startTime = Date.now() - this.elapsed;
    this._tick();
  }
  pause() {
    if (!this.running) return;
    this.running = false;
    cancelAnimationFrame(this.raf);
    this.elapsed = Date.now() - this.startTime;
    this._render();
  }
  reset() {
    this.running = false;
    cancelAnimationFrame(this.raf);
    this.elapsed = 0;
    this._render();
    this.lapsEl.innerHTML = "";
  }
  _tick() {
    this.elapsed = Date.now() - this.startTime;
    this._render();
    if (this.running) this.raf = requestAnimationFrame(this._tick.bind(this));
  }
  _render() {
    this.displayEl.textContent = formatMs(this.elapsed);
  }
  lap() {
    const li = document.createElement("li");
    li.textContent = formatMs(this.elapsed);
    this.lapsEl.prepend(li);
  }
}

// Timer
class Timer {
  constructor(displayEl) {
    this.displayEl = displayEl;
    this.duration = 0;
    this.remaining = 0;
    this.running = false;
    this.endTime = 0;
    this.raf = null;
    this.onFinish = null;
  }
  setDuration(ms) {
    this.duration = Math.max(0, ms);
    this.remaining = this.duration;
    this._render();
  }
  start() {
    if (this.running || this.remaining <= 0) return;
    this.running = true;
    this.endTime = Date.now() + this.remaining;
    this._tick();
  }
  pause() {
    if (!this.running) return;
    this.running = false;
    cancelAnimationFrame(this.raf);
    this.remaining = Math.max(0, this.endTime - Date.now());
    this._render();
  }
  reset() {
    this.running = false;
    cancelAnimationFrame(this.raf);
    this.remaining = this.duration;
    this._render();
  }
  _tick() {
    this.remaining = Math.max(0, this.endTime - Date.now());
    this._render();
    if (this.remaining <= 0) {
      this.running = false;
      if (this.onFinish) this.onFinish();
      return;
    }
    if (this.running) this.raf = requestAnimationFrame(this._tick.bind(this));
  }
  _render() {
    this.displayEl.textContent = formatMsNoMs(this.remaining);
  }
}

// Wire everything
window.addEventListener("DOMContentLoaded", () => {
  // Stopwatch
  const swDisplay = document.getElementById("sw-display");
  const swToggle = document.getElementById("sw-toggle");
  const swLap = document.getElementById("sw-lap");
  const swReset = document.getElementById("sw-reset");
  const swLaps = document.getElementById("sw-laps");

  const sw = new Stopwatch(swDisplay, swLaps);

  swToggle.addEventListener("click", () => {
    if (sw.running) {
      sw.pause();
      swToggle.textContent = "Start";
      swLap.disabled = true;
    } else {
      sw.start();
      swToggle.textContent = "Pause";
      swLap.disabled = false;
    }
  });

  swLap.addEventListener("click", () => sw.lap());
  swReset.addEventListener("click", () => {
    sw.reset();
    swToggle.textContent = "Start";
    swLap.disabled = true;
  });

  // Timer
  const tmMin = document.getElementById("timer-min");
  const tmSec = document.getElementById("timer-sec");
  const tmDisplay = document.getElementById("tm-display");
  const tmToggle = document.getElementById("tm-toggle");
  const tmReset = document.getElementById("tm-reset");

  const tm = new Timer(tmDisplay);

  function readInputs() {
    let m = parseInt(tmMin.value || "0", 10);
    let s = parseInt(tmSec.value || "0", 10);
    if (s > 59) s = 59;
    const ms = (m * 60 + s) * 1000;
    tm.setDuration(ms);
  }

  readInputs();

  tmToggle.addEventListener("click", () => {
    if (tm.running) {
      tm.pause();
      tmToggle.textContent = "Start";
    } else {
      if (tm.remaining <= 0) readInputs();
      tm.start();
      tmToggle.textContent = "Pause";
    }
  });

  tmReset.addEventListener("click", () => {
    readInputs();
    tm.reset();
    tmToggle.textContent = "Start";
  });

  tm.onFinish = () => alert("⏰ Timer Finished!");
});
