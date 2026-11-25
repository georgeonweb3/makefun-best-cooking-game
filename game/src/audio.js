// Mama's Buka Rush — audio: every sound is synthesised live with WebAudio, no files.
// One file, one job: the noises. Nothing here loads anything over the network.
let ctx = null;
let muted = false;
let sizzleGain = null;
let sizzleNodes = null;

function audioCtx() {
  if (ctx) return ctx;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return null;
  ctx = new AC();
  return ctx;
}

/** Call from the first real gesture: browsers only let sound start after one. */
export function unlockAudio() {
  const ac = audioCtx();
  if (ac && ac.state === 'suspended') void ac.resume();
}

export function toggleMute() {
  muted = !muted;
  if (sizzleGain) sizzleGain.gain.value = muted ? 0 : 0.05;
  return muted;
}

export function isMuted() {
  return muted;
}

function beep(freq, seconds, type = 'sine', volume = 0.12, slideTo = 0) {
  if (muted) return;
  const ac = audioCtx();
  if (!ac) return;
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, ac.currentTime);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, ac.currentTime + seconds);
  gain.gain.setValueAtTime(volume, ac.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + seconds);
  osc.connect(gain).connect(ac.destination);
  osc.start();
  osc.stop(ac.currentTime + seconds);
}

export const sfx = {
  pickup() { beep(520, 0.08, 'triangle', 0.1); },
  drop() { beep(340, 0.08, 'triangle', 0.1); },
  startCook() { beep(220, 0.15, 'sawtooth', 0.06, 440); },
  ready() { beep(880, 0.12, 'sine', 0.12); setTimeout(() => beep(1174, 0.18, 'sine', 0.12), 110); },
  serve() { beep(660, 0.1, 'sine', 0.12); setTimeout(() => beep(880, 0.1, 'sine', 0.12), 90); setTimeout(() => beep(1320, 0.22, 'sine', 0.12), 180); },
  coin() { beep(1568, 0.12, 'sine', 0.1); },
  burn() { beep(160, 0.4, 'sawtooth', 0.12, 70); },
  miss() { beep(196, 0.25, 'square', 0.07, 130); },
  denied() { beep(140, 0.12, 'square', 0.08); },
  tick() { beep(980, 0.05, 'square', 0.05); },
  click() { beep(700, 0.05, 'triangle', 0.08); },
  over() { [523, 392, 330, 262].forEach((f, i) => setTimeout(() => beep(f, 0.3, 'triangle', 0.1), i * 160)); },
};

/** A soft frying hiss while anything cooks; silent when nothing does. */
export function setSizzle(active) {
  const ac = audioCtx();
  if (!ac) return;
  if (active && !sizzleNodes) {
    const len = ac.sampleRate * 1;
    const buffer = ac.createBuffer(1, len, ac.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < len; i += 1) data[i] = Math.random() * 2 - 1;
    const src = ac.createBufferSource();
    src.buffer = buffer;
    src.loop = true;
    const filter = ac.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 5200;
    filter.Q.value = 0.6;
    sizzleGain = ac.createGain();
    sizzleGain.gain.value = muted ? 0 : 0.05;
    src.connect(filter).connect(sizzleGain).connect(ac.destination);
    src.start();
    sizzleNodes = src;
  } else if (!active && sizzleNodes) {
    try { sizzleNodes.stop(); } catch { /* already stopped */ }
    sizzleNodes = null;
    sizzleGain = null;
  }
}
