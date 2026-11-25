// Mama's Buka Rush — state: the rules of the kitchen. No drawing here, no input here.
// A ticket is a list of dishes plus a patience bar. A station cooks one ingredient into
// one dish, waits a grace period, then burns. A plate on the plating counter gathers
// dishes; carry it to the serve window and it pays the first ticket it matches.
import {
  BIN, BURN_GRACE_SECONDS, CHEF, CRATES, DISHES, FIRST_ORDER_AT, FLOOR, INGREDIENTS,
  MAX_HEARTS, MAX_TICKETS, PATIENCE_END, PATIENCE_START, PLATE, SERVE, SHIFT_SECONDS,
  SPAWN_END, SPAWN_START, STATIONS, TICKET_MENUS,
} from './config.js';

export const SCREEN_TITLE = 'title';
export const SCREEN_PLAY = 'play';
export const SCREEN_PAUSED = 'paused';
export const SCREEN_OVER = 'over';

export const EVENT_NONE = 0;
export const EVENT_READY = 1;
export const EVENT_BURN = 2;
export const EVENT_SERVED = 3;
export const EVENT_MISSED = 4;
export const EVENT_OVER = 5;

export function mulberry32(seed) {
  let a = seed >>> 0;
  return function random() {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function createWorld(random) {
  return {
    random,
    screen: SCREEN_TITLE,
    time: 0,
    timeLeft: SHIFT_SECONDS,
    coins: 0,
    served: 0,
    missed: 0,
    burnt: 0,
    hearts: MAX_HEARTS,
    best: 0,
    chef: { x: FLOOR.x + FLOOR.w / 2, y: FLOOR.y + FLOOR.h - 120, tx: 0, ty: 0, moving: false, face: 1 },
    // carry: null, or { kind: 'ingredient'|'dish'|'plate', id, dishes? }
    carry: null,
    plate: [], // dishes sitting on the plating counter
    stations: STATIONS.map((s) => ({ ...s, item: null, progress: 0, ready: false, grace: 0, burnt: false })),
    tickets: [],
    nextOrderIn: FIRST_ORDER_AT,
    menuIndex: 0,
    events: [],
    floaters: [], // { x, y, text, colour, ttl }
    lastTickSecond: -1,
  };
}

function patienceFor(state) {
  const f = Math.min(1, state.time / SHIFT_SECONDS);
  return PATIENCE_START + (PATIENCE_END - PATIENCE_START) * f;
}

function spawnInterval(state) {
  const f = Math.min(1, state.time / SHIFT_SECONDS);
  return SPAWN_START + (SPAWN_END - SPAWN_START) * f;
}

function spawnTicket(state) {
  const menu = TICKET_MENUS[state.menuIndex % TICKET_MENUS.length];
  state.menuIndex += 1;
  // Shuffle the menu pick a little so the same shift never repeats the same board.
  const dishes = menu.slice();
  if (state.random() < 0.3) dishes.reverse();
  state.tickets.push({ dishes, patience: patienceFor(state), maxPatience: patienceFor(state), id: state.time });
}

function dishCounts(dishes) {
  const counts = {};
  for (const d of dishes) counts[d] = (counts[d] || 0) + 1;
  return counts;
}

/** The first ticket this plate completes, or null. A plate must match exactly. */
export function matchingTicket(state, plateDishes) {
  const want = dishCounts(plateDishes);
  for (const ticket of state.tickets) {
    const need = dishCounts(ticket.dishes);
    const keys = new Set([...Object.keys(want), ...Object.keys(need)]);
    let ok = true;
    for (const k of keys) if ((want[k] || 0) !== (need[k] || 0)) { ok = false; break; }
    if (ok) return ticket;
  }
  return null;
}

function addFloater(state, x, y, text, colour) {
  state.floaters.push({ x, y, text, colour, ttl: 1.4 });
}

export function startCooking(state, station, ingredientId) {
  const dishId = INGREDIENTS[ingredientId].dish;
  station.item = ingredientId;
  station.dish = dishId;
  station.progress = 0;
  station.ready = false;
  station.burnt = false;
  station.grace = 0;
  return dishId;
}

/** One fixed step of the shift. Returns nothing; events land in state.events. */
export function stepWorld(state, dt) {
  state.events.length = 0;
  if (state.screen !== SCREEN_PLAY) return;

  state.time += dt;
  state.timeLeft = Math.max(0, SHIFT_SECONDS - state.time);

  // The last ten seconds tick out loud.
  const whole = Math.ceil(state.timeLeft);
  if (state.timeLeft <= 10 && whole !== state.lastTickSecond) {
    state.lastTickSecond = whole;
    state.events.push(EVENT_NONE); // renderer reads timeLeft directly; tick sound via main
    state.tick = true;
  } else state.tick = false;

  // New orders arrive faster as the shift wears on.
  state.nextOrderIn -= dt;
  if (state.nextOrderIn <= 0 && state.tickets.length < MAX_TICKETS) {
    spawnTicket(state);
    state.nextOrderIn = spawnInterval(state);
  }

  // Tickets lose patience; an empty one walks out and costs a heart.
  for (let i = state.tickets.length - 1; i >= 0; i -= 1) {
    const t = state.tickets[i];
    t.patience -= dt;
    if (t.patience <= 0) {
      state.tickets.splice(i, 1);
      state.missed += 1;
      state.hearts -= 1;
      state.events.push(EVENT_MISSED);
      addFloater(state, 640, 120, 'Walked out!', '#c0392b');
      if (state.hearts <= 0) { endShift(state); return; }
    }
  }

  // Stations cook; a finished dish waits, then burns.
  for (const s of state.stations) {
    if (!s.item || s.ready || s.burnt) {
      if (s.ready) {
        s.grace -= dt;
        if (s.grace <= 0) {
          s.burnt = true;
          s.ready = false;
          state.burnt += 1;
          state.events.push(EVENT_BURN);
        }
      }
      continue;
    }
    s.progress += dt / DISHES[s.dish].cookSeconds;
    if (s.progress >= 1) {
      s.progress = 1;
      s.ready = true;
      s.grace = BURN_GRACE_SECONDS;
      state.events.push(EVENT_READY);
    }
  }

  for (let i = state.floaters.length - 1; i >= 0; i -= 1) {
    const f = state.floaters[i];
    f.ttl -= dt;
    f.y -= 24 * dt;
    if (f.ttl <= 0) state.floaters.splice(i, 1);
  }

  if (state.timeLeft <= 0) endShift(state);
}

export function endShift(state) {
  state.screen = SCREEN_OVER;
  state.timeLeft = 0;
  state.events.push(EVENT_OVER);
}

// ---- Interaction: what E (or a click) does where Ada stands. ----

function near(a, b, dist) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return dx * dx + dy * dy < dist * dist;
}

function centreOf(r) {
  return { x: r.x + r.w / 2, y: r.y + r.h / 2 };
}

export function interactableAt(state, x, y) {
  for (const s of state.stations) if (x >= s.x - 10 && x <= s.x + s.w + 10 && y >= s.y - 10 && y <= s.y + s.h + 10) return { kind: 'station', id: s.id };
  if (x >= PLATE.x - 10 && x <= PLATE.x + PLATE.w + 10 && y >= PLATE.y - 10 && y <= PLATE.y + PLATE.h + 10) return { kind: 'plate' };
  if (x >= SERVE.x - 10 && x <= SERVE.x + SERVE.w + 10 && y >= SERVE.y - 10 && y <= SERVE.y + SERVE.h + 10) return { kind: 'serve' };
  for (const c of CRATES) if (x >= c.x - 10 && x <= c.x + c.w + 10 && y >= c.y - 10 && y <= c.y + c.h + 10) return { kind: 'crate', id: c.id };
  if (x >= BIN.x - 10 && x <= BIN.x + BIN.w + 10 && y >= BIN.y - 10 && y <= BIN.y + BIN.h + 10) return { kind: 'bin' };
  return null;
}

/** The closest thing Ada can use from where she stands, within reach. */
export function nearestInteractable(state) {
  const p = state.chef;
  let best = null;
  let bestD = 110;
  const candidates = [
    ...state.stations.map((s) => ({ target: { kind: 'station', id: s.id }, at: centreOf(s) })),
    { target: { kind: 'plate' }, at: centreOf(PLATE) },
    { target: { kind: 'serve' }, at: centreOf(SERVE) },
    ...CRATES.map((c) => ({ target: { kind: 'crate', id: c.id }, at: centreOf(c) })),
    { target: { kind: 'bin' }, at: centreOf(BIN) },
  ];
  for (const c of candidates) {
    const d = Math.hypot(p.x - c.at.x, p.y - c.at.y);
    if (d < bestD) { bestD = d; best = c.target; }
  }
  return best;
}

/**
 * Do the interaction. Returns 'ok' | 'denied' | 'served' | 'burnt' | 'none'.
 * Carrying rules: one thing at a time — an ingredient, a cooked dish, or a plate.
 */
export function interact(state, target) {
  if (!target || state.screen !== SCREEN_PLAY) return 'none';
  const chef = state.chef;

  if (target.kind === 'crate') {
    if (state.carry) return 'denied';
    state.carry = { kind: 'ingredient', id: target.id };
    return 'ok';
  }

  if (target.kind === 'station') {
    const s = state.stations.find((st) => st.id === target.id);
    if (!s) return 'none';
    if (s.burnt) {
      s.item = null; s.dish = null; s.progress = 0; s.burnt = false;
      return 'burnt';
    }
    if (s.ready) {
      if (state.carry) return 'denied';
      state.carry = { kind: 'dish', id: s.dish };
      s.item = null; s.dish = null; s.progress = 0; s.ready = false;
      return 'ok';
    }
    if (s.item) return 'denied'; // already cooking
    if (!state.carry || state.carry.kind !== 'ingredient') return 'denied';
    if (!s.accepts.includes(state.carry.id)) return 'denied';
    startCooking(state, s, state.carry.id);
    state.carry = null;
    return 'ok';
  }

  if (target.kind === 'plate') {
    // Put a cooked dish on the plate, or pick the plate up.
    if (state.carry && state.carry.kind === 'dish') {
      state.plate.push(state.carry.id);
      state.carry = null;
      return 'ok';
    }
    if (!state.carry && state.plate.length > 0) {
      state.carry = { kind: 'plate', dishes: state.plate.slice() };
      state.plate = [];
      return 'ok';
    }
    return 'denied';
  }

  if (target.kind === 'serve') {
    if (!state.carry || state.carry.kind !== 'plate') return 'denied';
    const ticket = matchingTicket(state, state.carry.dishes);
    if (!ticket) return 'denied';
    state.tickets.splice(state.tickets.indexOf(ticket), 1);
    let pay = 0;
    for (const d of ticket.dishes) pay += DISHES[d].price;
    const tip = Math.round(10 * Math.max(0, ticket.patience / ticket.maxPatience));
    state.coins += pay + tip;
    state.served += 1;
    addFloater(state, SERVE.x + SERVE.w / 2, SERVE.y - 10, `+₦${pay + tip}`, '#f2b705');
    state.carry = null;
    state.events.push(EVENT_SERVED);
    return 'served';
  }

  if (target.kind === 'bin') {
    if (!state.carry) return 'denied';
    state.carry = null;
    return 'ok';
  }
  return 'none';
}

/** Walk Ada toward her target in fixed steps; returns true while still moving. */
export function moveChef(state, dt, keys) {
  const chef = state.chef;
  let dx = 0;
  let dy = 0;
  if (keys.left) dx -= 1;
  if (keys.right) dx += 1;
  if (keys.up) dy -= 1;
  if (keys.down) dy += 1;
  if (dx || dy) {
    const len = Math.hypot(dx, dy);
    chef.x += (dx / len) * CHEF.speed * dt;
    chef.y += (dy / len) * CHEF.speed * dt;
    chef.face = dx === 0 ? chef.face : Math.sign(dx);
    chef.moving = false;
  } else if (chef.moving) {
    const tx = chef.tx;
    const ty = chef.ty;
    const d = Math.hypot(tx - chef.x, ty - chef.y);
    const step = CHEF.speed * dt;
    if (d <= step + 2) {
      chef.x = tx; chef.y = ty; chef.moving = false;
    } else {
      chef.x += ((tx - chef.x) / d) * step;
      chef.y += ((ty - chef.y) / d) * step;
      chef.face = Math.sign(tx - chef.x) || chef.face;
    }
  }
  chef.x = Math.min(FLOOR.x + FLOOR.w - CHEF.radius, Math.max(FLOOR.x + CHEF.radius, chef.x));
  chef.y = Math.min(FLOOR.y + FLOOR.h - CHEF.radius, Math.max(FLOOR.y + CHEF.radius, chef.y));
  return chef.moving;
}

export function anyCooking(state) {
  return state.stations.some((s) => s.item && !s.ready && !s.burnt);
}

export { BIN, CRATES, PLATE, SERVE, STATIONS };
