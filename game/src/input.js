// Mama's Buka Rush — input: keyboard and mouse, both ways to play.
// One file, one job: turning presses and clicks into intentions.
export const ACTION_CONFIRM = 'confirm';
export const ACTION_PAUSE = 'pause';
export const ACTION_RESTART = 'restart';
export const ACTION_MUTE = 'mute';

export function createInput(canvas, handlers) {
  const keys = { left: false, right: false, up: false, down: false };
  const pressed = new Set();

  function keyOf(e) {
    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') return 'left';
    if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') return 'right';
    if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') return 'up';
    if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') return 'down';
    return null;
  }

  function onKeyDown(e) {
    const dir = keyOf(e);
    if (dir) {
      keys[dir] = true;
      e.preventDefault();
      return;
    }
    if (e.repeat) return;
    if (e.key === 'e' || e.key === 'E' || e.key === 'Enter' || e.key === ' ') {
      pressed.add(ACTION_CONFIRM);
      e.preventDefault();
    } else if (e.key === 'p' || e.key === 'P' || e.key === 'Escape') {
      pressed.add(ACTION_PAUSE);
    } else if (e.key === 'r' || e.key === 'R') {
      pressed.add(ACTION_RESTART);
    } else if (e.key === 'm' || e.key === 'M') {
      pressed.add(ACTION_MUTE);
    }
  }

  function onKeyUp(e) {
    const dir = keyOf(e);
    if (dir) keys[dir] = false;
  }

  function toGameCoords(e) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * 1280,
      y: ((e.clientY - rect.top) / rect.height) * 720,
    };
  }

  function onClick(e) {
    const p = toGameCoords(e);
    handlers.onClick(p.x, p.y);
  }

  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp);
  canvas.addEventListener('pointerdown', onClick);

  return {
    keys,
    /** Actions pressed since the last read; each one is delivered once. */
    takePressed() {
      const out = [...pressed];
      pressed.clear();
      return out;
    },
    destroy() {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      canvas.removeEventListener('pointerdown', onClick);
    },
  };
}
