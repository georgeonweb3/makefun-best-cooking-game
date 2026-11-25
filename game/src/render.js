// Mama's Buka Rush — render: everything the player sees, drawn on one canvas.
// One file, one job: the picture. No rules here, no input here.
import {
  BIN, CHEF, COLOURS, CRATES, DISHES, FLOOR, INGREDIENTS, PLATE, SERVE, STATIONS, VIEW,
} from './config.js';
import { SCREEN_OVER, SCREEN_PAUSED, SCREEN_PLAY, SCREEN_TITLE } from './state.js';

export { SCREEN_OVER, SCREEN_PAUSED, SCREEN_PLAY, SCREEN_TITLE };

function rr(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function text(ctx, s, x, y, size, colour, align = 'left', weight = '700') {
  ctx.fillStyle = colour;
  ctx.font = `${weight} ${size}px "Trebuchet MS", Verdana, sans-serif`;
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  ctx.fillText(s, x, y);
}

/** A little drawn dish, readable at a glance: each dish has its own shape. */
export function drawDish(ctx, dishId, cx, cy, r) {
  const d = DISHES[dishId];
  ctx.save();
  ctx.translate(cx, cy);
  if (dishId === 'jollof') {
    ctx.fillStyle = '#fff8e6';
    ctx.beginPath(); ctx.ellipse(0, 2, r, r * 0.72, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = d.colour;
    ctx.beginPath(); ctx.ellipse(0, -1, r * 0.86, r * 0.6, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#f7b731';
    for (let i = 0; i < 5; i += 1) {
      ctx.beginPath(); ctx.arc(-r * 0.5 + i * r * 0.25, -r * 0.35 + (i % 2) * r * 0.3, r * 0.09, 0, Math.PI * 2); ctx.fill();
    }
  } else if (dishId === 'suya') {
    ctx.strokeStyle = '#8a5a2b';
    ctx.lineWidth = r * 0.14;
    for (let i = -1; i <= 1; i += 1) {
      ctx.beginPath(); ctx.moveTo(i * r * 0.55, -r * 0.8); ctx.lineTo(i * r * 0.55, r * 0.8); ctx.stroke();
    }
    ctx.fillStyle = d.colour;
    for (let i = -1; i <= 1; i += 1) {
      for (let j = 0; j < 3; j += 1) {
        ctx.beginPath(); ctx.arc(i * r * 0.55, -r * 0.5 + j * r * 0.5, r * 0.24, 0, Math.PI * 2); ctx.fill();
      }
    }
  } else if (dishId === 'puff') {
    ctx.fillStyle = d.colour;
    const offs = [[-0.45, 0.2], [0.45, 0.2], [0, -0.35], [-0.1, 0.55], [0.35, -0.5]];
    for (const [ox, oy] of offs) {
      ctx.beginPath(); ctx.arc(ox * r, oy * r, r * 0.42, 0, Math.PI * 2); ctx.fill();
    }
    ctx.fillStyle = '#f7d774';
    ctx.beginPath(); ctx.arc(-r * 0.2, -r * 0.3, r * 0.12, 0, Math.PI * 2); ctx.fill();
  } else if (dishId === 'egusi') {
    ctx.fillStyle = '#fff8e6';
    ctx.beginPath(); ctx.ellipse(0, 2, r, r * 0.7, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = d.colour;
    ctx.beginPath(); ctx.ellipse(0, -1, r * 0.85, r * 0.58, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#f2ead8';
    for (let i = 0; i < 4; i += 1) {
      ctx.beginPath(); ctx.arc(-r * 0.5 + i * r * 0.33, -r * 0.2 + (i % 2) * r * 0.25, r * 0.1, 0, Math.PI * 2); ctx.fill();
    }
  } else if (dishId === 'dodo') {
    ctx.fillStyle = d.colour;
    for (let i = 0; i < 3; i += 1) {
      ctx.beginPath(); ctx.ellipse(-r * 0.55 + i * r * 0.55, (i % 2 ? -1 : 1) * r * 0.25, r * 0.42, r * 0.3, (i - 1) * 0.3, 0, Math.PI * 2); ctx.fill();
    }
    ctx.fillStyle = '#a34d1d';
    ctx.beginPath(); ctx.arc(r * 0.2, -r * 0.3, r * 0.08, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}

function drawStation(ctx, s, time) {
  const cx = s.x + s.w / 2;
  // Counter body and top.
  ctx.fillStyle = '#8a5a2b';
  rr(ctx, s.x, s.y, s.w, s.h, 10); ctx.fill();
  ctx.fillStyle = '#c9a06a';
  rr(ctx, s.x + 6, s.y + 6, s.w - 12, 34, 8); ctx.fill();
  text(ctx, s.name, cx, s.y + s.h - 16, 15, '#fff3d6', 'center');
  text(ctx, s.blurb, cx, s.y + s.h - 34, 11, '#e8d5b0', 'center', '400');

  if (s.id === 'grill') {
    // Charcoal grill: dark grate, glowing coals, smoke while it cooks.
    ctx.fillStyle = '#2b2b2b';
    rr(ctx, s.x + 22, s.y + 46, s.w - 44, 44, 8); ctx.fill();
    ctx.fillStyle = '#e2601e';
    for (let i = 0; i < 5; i += 1) {
      ctx.beginPath(); ctx.arc(s.x + 40 + i * 28, s.y + 78, 6 + Math.sin(time * 3 + i) * 1.5, 0, Math.PI * 2); ctx.fill();
    }
    ctx.strokeStyle = '#666';
    ctx.lineWidth = 2;
    for (let i = 0; i < 6; i += 1) {
      ctx.beginPath(); ctx.moveTo(s.x + 26 + i * 26, s.y + 50); ctx.lineTo(s.x + 26 + i * 26, s.y + 86); ctx.stroke();
    }
  } else {
    // Pots: a round pot with a lid; steam curls while it cooks.
    ctx.fillStyle = '#3a3f4a';
    ctx.beginPath(); ctx.ellipse(cx, s.y + 72, 62, 26, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#565e6e';
    ctx.beginPath(); ctx.ellipse(cx, s.y + 60, 62, 16, 0, Math.PI, 0); ctx.fill();
    ctx.fillStyle = '#222';
    ctx.beginPath(); ctx.ellipse(cx, s.y + 56, 62, 10, 0, Math.PI, 0); ctx.fill();
    if (s.item && !s.ready && !s.burnt) {
      ctx.strokeStyle = 'rgba(255,255,255,0.75)';
      ctx.lineWidth = 3;
      for (let i = 0; i < 3; i += 1) {
        const wob = Math.sin(time * 4 + i * 2) * 6;
        ctx.beginPath();
        ctx.moveTo(cx - 30 + i * 30 + wob, s.y + 50);
        ctx.quadraticCurveTo(cx - 24 + i * 30 + wob, s.y + 34, cx - 30 + i * 30 - wob, s.y + 20);
        ctx.stroke();
      }
    }
  }

  if (s.item) {
    if (s.burnt) {
      text(ctx, 'BURNT!', cx, s.y + 24, 16, '#ff6b5e', 'center');
      ctx.fillStyle = 'rgba(40,40,40,0.85)';
      ctx.beginPath(); ctx.arc(cx, s.y + 66, 16, 0, Math.PI * 2); ctx.fill();
      text(ctx, '✕', cx, s.y + 66, 18, '#ff6b5e', 'center');
    } else if (s.ready) {
      drawDish(ctx, s.dish, cx, s.y + 66, 22);
      text(ctx, 'READY', cx, s.y + 24, 15, '#7dff8a', 'center');
      const frac = Math.max(0, s.grace / 6);
      ctx.fillStyle = '#222';
      rr(ctx, cx - 40, s.y + 34, 80, 6, 3); ctx.fill();
      ctx.fillStyle = frac > 0.4 ? '#7dff8a' : '#ff6b5e';
      rr(ctx, cx - 40, s.y + 34, 80 * frac, 6, 3); ctx.fill();
    } else {
      // Cooking: the dish fades in as the progress ring fills.
      ctx.globalAlpha = 0.35 + 0.65 * s.progress;
      drawDish(ctx, s.dish, cx, s.y + 66, 20);
      ctx.globalAlpha = 1;
      ctx.strokeStyle = '#f2b705';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.arc(cx, s.y + 66, 30, -Math.PI / 2, -Math.PI / 2 + s.progress * Math.PI * 2);
      ctx.stroke();
    }
  }
}

function drawTickets(ctx, state) {
  // The order board: a green chalkboard strip with one ticket per customer.
  ctx.fillStyle = COLOURS.board;
  rr(ctx, 16, 72, 1248, 112, 12); ctx.fill();
  ctx.strokeStyle = COLOURS.boardEdge;
  ctx.lineWidth = 3;
  rr(ctx, 16, 72, 1248, 112, 12); ctx.stroke();
  text(ctx, 'ORDERS', 40, 128, 20, '#fff3d6');
  if (state.tickets.length === 0) {
    text(ctx, 'No orders yet — the lunch rush is coming. Grab an ingredient!', 170, 128, 16, '#cfe3c0', 'left', '400');
  }
  state.tickets.forEach((t, i) => {
    const x = 170 + i * 272;
    const y = 84;
    ctx.fillStyle = COLOURS.ticket;
    rr(ctx, x, y, 258, 88, 8); ctx.fill();
    ctx.strokeStyle = COLOURS.ticketEdge;
    ctx.lineWidth = 2;
    rr(ctx, x, y, 258, 88, 8); ctx.stroke();
    // Patience bar along the ticket's top.
    const frac = Math.max(0, t.patience / t.maxPatience);
    ctx.fillStyle = frac > 0.5 ? '#3d8b40' : frac > 0.25 ? '#e67e22' : '#c0392b';
    rr(ctx, x + 8, y + 8, 242 * frac, 7, 3); ctx.fill();
    t.dishes.forEach((d, j) => {
      drawDish(ctx, d, x + 30 + j * 62, y + 48, 20);
      text(ctx, DISHES[d].short, x + 30 + j * 62, y + 74, 11, '#2b1a0e', 'center', '600');
    });
    const total = t.dishes.reduce((sum, d) => sum + DISHES[d].price, 0);
    text(ctx, `₦${total}+`, x + 240, y + 48, 14, '#7a3b1e', 'right');
  });
}

function drawCrates(ctx, state) {
  for (const c of CRATES) {
    const ing = INGREDIENTS[c.id];
    ctx.fillStyle = '#6b4a26';
    rr(ctx, c.x, c.y, c.w, c.h, 8); ctx.fill();
    ctx.fillStyle = ing.colour;
    rr(ctx, c.x + 8, c.y + 8, c.w - 16, 34, 6); ctx.fill();
    text(ctx, ing.name, c.x + c.w / 2, c.y + c.h - 14, 14, '#fff3d6', 'center');
    if (c.id === 'rice') {
      ctx.fillStyle = '#fff';
      for (let i = 0; i < 8; i += 1) { ctx.beginPath(); ctx.arc(c.x + 20 + i * 11, c.y + 26, 3, 0, Math.PI * 2); ctx.fill(); }
    } else if (c.id === 'chicken') {
      ctx.fillStyle = '#d98a4a';
      ctx.beginPath(); ctx.ellipse(c.x + c.w / 2, c.y + 26, 34, 10, 0, 0, Math.PI * 2); ctx.fill();
    } else if (c.id === 'dough') {
      ctx.fillStyle = '#e8c98a';
      for (let i = 0; i < 3; i += 1) { ctx.beginPath(); ctx.arc(c.x + 30 + i * 34, c.y + 26, 11, 0, Math.PI * 2); ctx.fill(); }
    } else if (c.id === 'yam') {
      ctx.fillStyle = '#c9a86a';
      ctx.beginPath(); ctx.ellipse(c.x + c.w / 2, c.y + 26, 40, 11, 0, 0, Math.PI * 2); ctx.fill();
    } else {
      ctx.fillStyle = '#f5d54a';
      for (let i = 0; i < 3; i += 1) {
        ctx.beginPath(); ctx.ellipse(c.x + 28 + i * 34, c.y + 26, 12, 7, (i - 1) * 0.4, 0, Math.PI * 2); ctx.fill();
      }
    }
  }
  // The bin: burnt dishes and wrong grabs go here.
  ctx.fillStyle = '#4a4a4a';
  rr(ctx, BIN.x, BIN.y, BIN.w, BIN.h, 8); ctx.fill();
  ctx.fillStyle = '#2b2b2b';
  rr(ctx, BIN.x + 8, BIN.y + 8, BIN.w - 16, 20, 5); ctx.fill();
  text(ctx, 'BIN', BIN.x + BIN.w / 2, BIN.y + BIN.h - 14, 14, '#fff3d6', 'center');
}

function drawChef(ctx, state) {
  const c = state.chef;
  const bob = state.screen === SCREEN_PLAY && (c.moving || Math.abs(c.tx - c.x) > 1) ? Math.sin(state.time * 14) * 2 : 0;
  ctx.save();
  ctx.translate(c.x, c.y + bob);
  // Shadow.
  ctx.fillStyle = 'rgba(0,0,0,0.2)';
  ctx.beginPath(); ctx.ellipse(0, 20, 22, 7, 0, 0, Math.PI * 2); ctx.fill();
  // Body: green apron over a cream top.
  ctx.fillStyle = '#f2ead8';
  rr(ctx, -15, -6, 30, 26, 10); ctx.fill();
  ctx.fillStyle = '#2e7d32';
  rr(ctx, -15, 4, 30, 16, 8); ctx.fill();
  // Head with a yellow headwrap — Ada, the buka's cook.
  ctx.fillStyle = '#5a3a22';
  ctx.beginPath(); ctx.arc(0, -18, 13, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#f2b705';
  ctx.beginPath(); ctx.arc(0, -20, 13, Math.PI, 0); ctx.fill();
  ctx.fillStyle = '#f2b705';
  ctx.beginPath(); ctx.arc(13 * c.face, -20, 5, 0, Math.PI * 2); ctx.fill();
  // What she carries, held up high.
  if (state.carry) {
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.beginPath(); ctx.arc(0, -44, 17, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#999';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(0, -44, 17, 0, Math.PI * 2); ctx.stroke();
    if (state.carry.kind === 'plate') {
      state.carry.dishes.forEach((d, i) => drawDish(ctx, d, -14 + i * 14, -44, 8));
    } else if (state.carry.kind === 'dish') {
      drawDish(ctx, state.carry.id, 0, -44, 12);
    } else {
      ctx.fillStyle = INGREDIENTS[state.carry.id].colour;
      ctx.beginPath(); ctx.arc(0, -44, 10, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#7a3b1e';
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(0, -44, 10, 0, Math.PI * 2); ctx.stroke();
    }
  }
  ctx.restore();
}

function drawHud(ctx, state) {
  ctx.fillStyle = COLOURS.hud;
  ctx.fillRect(0, 0, VIEW.width, 64);
  text(ctx, "MAMA'S BUKA RUSH", 24, 34, 24, '#f2b705');
  text(ctx, 'Lagos street-food kitchen', 330, 36, 13, '#e8d5b0', 'left', '400');
  // Shift timer, big and central: it turns red in the last 30 seconds.
  const mins = Math.floor(state.timeLeft / 60);
  const secs = Math.floor(state.timeLeft % 60);
  const urgent = state.timeLeft <= 30 && state.screen === SCREEN_PLAY;
  text(ctx, `${mins}:${String(secs).padStart(2, '0')}`, 640, 34, 30, urgent ? '#ff6b5e' : '#fff3d6', 'center');
  text(ctx, 'SHIFT', 640, 56, 10, '#c9a06a', 'center', '400');
  text(ctx, `₦${state.coins}`, 1000, 34, 26, '#f2b705', 'right');
  text(ctx, `served ${state.served}`, 1000, 56, 11, '#e8d5b0', 'right', '400');
  // Hearts: three strikes and the buka closes.
  for (let i = 0; i < 3; i += 1) {
    ctx.fillStyle = i < state.hearts ? '#e74c3c' : 'rgba(255,255,255,0.25)';
    ctx.beginPath();
    const hx = 1050 + i * 28;
    ctx.arc(hx, 30, 9, 0, Math.PI * 2);
    ctx.fill();
    text(ctx, '♥', hx, 31, 13, '#fff', 'center');
  }
  text(ctx, state.best > 0 ? `best ₦${state.best}` : '', 1240, 56, 11, '#c9a06a', 'right', '400');
}

function drawKitchen(ctx, state) {
  // Back wall and tiled floor.
  ctx.fillStyle = COLOURS.wall;
  ctx.fillRect(0, 64, VIEW.width, 136);
  ctx.fillStyle = COLOURS.wallDark;
  for (let x = 0; x < VIEW.width; x += 90) {
    ctx.fillRect(x, 64, 4, 136);
  }
  // Hanging pots on the wall.
  for (let x = 60; x < 300; x += 70) {
    ctx.strokeStyle = '#3a2a18';
    ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(x, 64); ctx.lineTo(x, 92); ctx.stroke();
    ctx.fillStyle = '#565e6e';
    ctx.beginPath(); ctx.ellipse(x, 104, 22, 12, 0, 0, Math.PI * 2); ctx.fill();
  }
  text(ctx, 'MAMA’S BUKA — EST. 1998, SURULERE', 980, 96, 15, '#e8d5b0', 'center', '600');
  ctx.fillStyle = COLOURS.floorA;
  ctx.fillRect(0, 200, VIEW.width, 520);
  ctx.fillStyle = COLOURS.floorB;
  for (let y = 200; y < 720; y += 52) {
    for (let x = ((y / 52) % 2) * 52; x < VIEW.width; x += 104) {
      ctx.fillRect(x, y, 52, 52);
    }
  }

  drawTickets(ctx, state);

  for (const s of state.stations) drawStation(ctx, s, state.time);

  // Plating counter: the plate being built, dish by dish.
  ctx.fillStyle = '#8a5a2b';
  rr(ctx, PLATE.x, PLATE.y, PLATE.w, PLATE.h, 10); ctx.fill();
  ctx.fillStyle = '#c9a06a';
  rr(ctx, PLATE.x + 6, PLATE.y + 6, PLATE.w - 12, 30, 8); ctx.fill();
  text(ctx, 'PLATING', PLATE.x + PLATE.w / 2, PLATE.y + PLATE.h - 16, 14, '#fff3d6', 'center');
  if (state.plate.length > 0) {
    ctx.fillStyle = '#fff8e6';
    ctx.beginPath(); ctx.ellipse(PLATE.x + PLATE.w / 2, PLATE.y + 52, 74, 24, 0, 0, Math.PI * 2); ctx.fill();
    state.plate.forEach((d, i) => drawDish(ctx, d, PLATE.x + 70 + i * 56, PLATE.y + 52, 18));
  } else {
    text(ctx, 'add cooked dishes here', PLATE.x + PLATE.w / 2, PLATE.y + 52, 13, '#e8d5b0', 'center', '400');
  }

  // Serve window: where plates leave the kitchen.
  ctx.fillStyle = '#2e4d2a';
  rr(ctx, SERVE.x, SERVE.y, SERVE.w, SERVE.h, 10); ctx.fill();
  ctx.fillStyle = '#fff3d6';
  rr(ctx, SERVE.x + 10, SERVE.y + 10, SERVE.w - 20, 40, 6); ctx.fill();
  text(ctx, 'SERVE →', SERVE.x + SERVE.w / 2, SERVE.y + 30, 17, '#2e4d2a', 'center');
  text(ctx, 'hand the plate over', SERVE.x + SERVE.w / 2, SERVE.y + SERVE.h - 16, 12, '#cfe3c0', 'center', '400');

  drawCrates(ctx, state);
  drawChef(ctx, state);

  // Floating score popups.
  for (const f of state.floaters) {
    ctx.globalAlpha = Math.max(0, f.ttl / 1.4);
    text(ctx, f.text, f.x, f.y, 22, f.colour, 'center');
    ctx.globalAlpha = 1;
  }

  // A hint line, so a first-timer always knows the next move.
  if (state.screen === SCREEN_PLAY) {
    let hint = 'WASD / click to move — E to grab, cook and serve';
    if (state.carry) {
      if (state.carry.kind === 'ingredient') hint = `Carrying ${INGREDIENTS[state.carry.id].name} — take it to the ${DISHES[INGREDIENTS[state.carry.id].dish].station === 'grill' ? 'Charcoal Grill' : DISHES[INGREDIENTS[state.carry.id].dish].station === 'pot' ? 'Jollof Pot' : DISHES[INGREDIENTS[state.carry.id].dish].station === 'fryer' ? 'Fryer' : 'Soup Pot'} (E)`;
      if (state.carry.kind === 'dish') hint = `Carrying ${DISHES[state.carry.id].name} — add it to the plate on the Plating counter (E)`;
      if (state.carry.kind === 'plate') hint = 'Carrying a plate — hand it over at the SERVE window (E)';
    } else if (state.tickets.length > 0) {
      hint = 'Grab an ingredient from the crates below (E)';
    }
    text(ctx, hint, 640, 700, 14, '#5e2c15', 'center', '400');
  }
}

function overlay(ctx, title, lines, foot) {
  ctx.fillStyle = 'rgba(20,10,4,0.72)';
  ctx.fillRect(0, 0, VIEW.width, VIEW.height);
  ctx.fillStyle = '#fff8e6';
  rr(ctx, 340, 150, 600, 420, 16); ctx.fill();
  ctx.strokeStyle = '#d9c48f';
  ctx.lineWidth = 3;
  rr(ctx, 340, 150, 600, 420, 16); ctx.stroke();
  text(ctx, title, 640, 200, 34, '#7a3b1e', 'center');
  lines.forEach((line, i) => {
    text(ctx, line.text, 640, 250 + i * 34, line.size || 16, line.colour || '#2b1a0e', 'center', line.weight || '400');
  });
  if (foot) text(ctx, foot, 640, 530, 15, '#7a3b1e', 'center', '600');
}

export function createRenderer(canvas) {
  const ctx = canvas.getContext('2d');
  function resize() {
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = VIEW.width * dpr;
    canvas.height = VIEW.height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resize();
  window.addEventListener('resize', resize);

  function render(state) {
    ctx.clearRect(0, 0, VIEW.width, VIEW.height);
    drawHud(ctx, state);
    drawKitchen(ctx, state);
    if (state.screen === SCREEN_TITLE) {
      overlay(ctx, "MAMA'S BUKA RUSH", [
        { text: 'Ada runs the busiest buka in Surulere.', size: 17 },
        { text: 'Orders come in hot. Cook them, plate them, serve them.', size: 16 },
        { text: 'Jollof on the pot · Suya on the grill · Puff puff & dodo in the fryer', size: 15 },
        { text: 'Egusi in the soup pot. A dish left too long burns!', size: 15 },
        { text: 'Move: WASD / arrows / click · Use: E · Pause: P · Mute: M', size: 15 },
        { text: 'Serve before patience runs out — tips pay for speed.', size: 15 },
      ], 'Press ENTER or click to start the shift');
    } else if (state.screen === SCREEN_PAUSED) {
      overlay(ctx, 'PAUSED', [
        { text: 'The pots are waiting. The customers are not.', size: 16 },
      ], 'Press P to get back to the fire');
    } else if (state.screen === SCREEN_OVER) {
      const best = Math.max(state.best, state.coins);
      overlay(ctx, 'SHIFT OVER', [
        { text: `You served ${state.served} order${state.served === 1 ? '' : 's'} and banked ₦${state.coins}.`, size: 18 },
        { text: `${state.missed} customer${state.missed === 1 ? '' : 's'} walked out · ${state.burnt} dish${state.burnt === 1 ? '' : 'es'} burnt`, size: 16 },
        { text: state.coins >= 200 ? 'Mama would be proud. The buka is yours.' : state.coins >= 120 ? 'A solid shift — the lunch rush respects you now.' : 'Rough shift. The grill forgives; the customers don’t.', size: 16 },
        { text: `Best shift: ₦${best}`, size: 16, colour: '#7a3b1e', weight: '700' },
      ], 'Press R to run it back');
    }
  }
  return { render, resize };
}
