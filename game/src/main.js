// Mama's Buka Rush — main: boot and the one loop.
// Input is read every frame, the world advances in fixed 1/60 s steps, and the
// renderer paints what is there. Screens: title, play, paused, game over.
// ?seed=N fixes the order the tickets arrive in. ?shot=kitchen|rush|serve|end|title
// (with &seed=N) stages that scene instead of running the loop, paints it twice and
// sets window.__shotReady for a screenshot.
import { BEST_KEY, STEP } from './config.js';
import { mulberry32, createWorld, stepWorld, endShift, moveChef, interact, nearestInteractable, interactableAt, anyCooking, SCREEN_OVER, SCREEN_PAUSED, SCREEN_PLAY, SCREEN_TITLE, EVENT_BURN, EVENT_MISSED, EVENT_OVER, EVENT_READY, EVENT_SERVED } from './state.js';
import { ACTION_CONFIRM, ACTION_MUTE, ACTION_PAUSE, ACTION_RESTART, createInput } from './input.js';
import { createRenderer, SCREEN_OVER as R_OVER, SCREEN_PAUSED as R_PAUSED, SCREEN_PLAY as R_PLAY, SCREEN_TITLE as R_TITLE } from './render.js';
import { stageShot } from './shots.js';
import { sfx, setSizzle, toggleMute, unlockAudio } from './audio.js';

const MAX_FRAME = 0.25;

const params = new URLSearchParams(window.location.search);
const shot = params.get('shot');
const seedParam = Number.parseInt(params.get('seed') ?? '', 10);
const seed = Number.isInteger(seedParam) ? seedParam : Math.floor(Math.random() * 4294967296);

const canvas = document.getElementById('game');
const status = document.getElementById('status');
const renderer = createRenderer(canvas);

function readBest() {
  try {
    return Number.parseInt(window.localStorage.getItem(BEST_KEY) ?? '0', 10) || 0;
  } catch {
    return 0;
  }
}

function saveBest(value) {
  try {
    window.localStorage.setItem(BEST_KEY, String(value));
  } catch { /* a private window forgets; the shift still counts */ }
}

function announce(message) {
  status.textContent = message;
}

let world;
let input;

if (shot) {
  world = stageShot(mulberry32(seed), shot);
  if (world) {
    world.best = readBest();
    renderer.render(world);
    renderer.render(world);
    window.__shotReady = true;
  } else {
    document.body.textContent = `Unknown shot: ${shot}`;
  }
} else {
  world = createWorld(mulberry32(seed));
  world.best = readBest();
  let last = performance.now();
  let acc = 0;
  let pendingTarget = null; // { x, y, target } — a clicked thing to walk to and use

  input = createInput(canvas, {
    onClick(x, y) {
      unlockAudio();
      if (world.screen === SCREEN_TITLE) { startShift(); return; }
      if (world.screen === SCREEN_OVER) { restart(); return; }
      if (world.screen !== SCREEN_PLAY) return;
      const target = interactableAt(world, x, y);
      if (target) {
        // Walk to the thing, then use it on arrival.
        pendingTarget = { x, y, target };
        world.chef.tx = x;
        world.chef.ty = y;
        world.chef.moving = true;
      } else {
        pendingTarget = null;
        world.chef.tx = x;
        world.chef.ty = y;
        world.chef.moving = true;
      }
    },
  });

  function startShift() {
    const best = world.best;
    world = createWorld(mulberry32(Math.floor(Math.random() * 4294967296)));
    world.best = best;
    world.screen = SCREEN_PLAY;
    pendingTarget = null;
    sfx.click();
    announce('Shift started. First order in a moment — grab an ingredient!');
  }

  function restart() {
    startShift();
  }

  function doInteract() {
    const target = nearestInteractable(world);
    if (!target) return;
    const result = interact(world, target);
    if (result === 'ok') sfx.pickup();
    else if (result === 'served') { sfx.serve(); setTimeout(() => sfx.coin(), 200); }
    else if (result === 'burnt') sfx.drop();
    else if (result === 'denied') sfx.denied();
  }

  function frame(now) {
    const elapsed = Math.min(MAX_FRAME, (now - last) / 1000);
    last = now;
    acc += elapsed;

    for (const action of input.takePressed()) {
      if (action === ACTION_CONFIRM) {
        unlockAudio();
        if (world.screen === SCREEN_TITLE) startShift();
        else if (world.screen === SCREEN_OVER) restart();
        else if (world.screen === SCREEN_PLAY) doInteract();
      } else if (action === ACTION_PAUSE) {
        if (world.screen === SCREEN_PLAY) { world.screen = SCREEN_PAUSED; sfx.click(); }
        else if (world.screen === SCREEN_PAUSED) { world.screen = SCREEN_PLAY; sfx.click(); }
      } else if (action === ACTION_RESTART) {
        if (world.screen === SCREEN_OVER || world.screen === SCREEN_PAUSED) restart();
      } else if (action === ACTION_MUTE) {
        const muted = toggleMute();
        announce(muted ? 'Sound off.' : 'Sound on.');
      }
    }

    while (acc >= STEP) {
      acc -= STEP;
      if (world.screen === SCREEN_PLAY) {
        moveChef(world, STEP, input.keys);
        // A clicked station gets used the moment Ada is close enough.
        if (pendingTarget && !world.chef.moving) {
          const near = nearestInteractable(world);
          if (near && near.kind === pendingTarget.target.kind && near.id === pendingTarget.target.id) {
            const result = interact(world, pendingTarget.target);
            if (result === 'ok') sfx.pickup();
            else if (result === 'served') { sfx.serve(); setTimeout(() => sfx.coin(), 200); }
            else if (result === 'burnt') sfx.drop();
            else if (result === 'denied') sfx.denied();
          }
          pendingTarget = null;
        }
        stepWorld(world, STEP);
        for (const event of world.events) {
          if (event === EVENT_READY) sfx.ready();
          else if (event === EVENT_BURN) sfx.burn();
          else if (event === EVENT_MISSED) sfx.miss();
          else if (event === EVENT_SERVED) { /* serve sound already played on the click */ }
          else if (event === EVENT_OVER) { sfx.over(); }
        }
        if (world.tick) sfx.tick();
        setSizzle(anyCooking(world));
        if (world.screen === SCREEN_OVER) {
          const best = Math.max(world.best, world.coins);
          if (world.coins > world.best) saveBest(world.coins);
          world.best = best;
          announce(`Shift over. ₦${world.coins} banked, ${world.served} orders served.`);
        }
      }
    }

    renderer.render(world);
    requestAnimationFrame(frame);
  }

  renderer.render(world);
  announce("Mama's Buka Rush. Press Enter or click to start the shift.");
  requestAnimationFrame(frame);
}

// Keep the unused-screen imports honest: the renderer owns the screen names too.
void [R_OVER, R_PAUSED, R_PLAY, R_TITLE, SCREEN_OVER, SCREEN_PAUSED, SCREEN_PLAY, SCREEN_TITLE, endShift];
