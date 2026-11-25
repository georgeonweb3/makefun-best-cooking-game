// Mama's Buka Rush — config: every dish, station, crate and number the game runs on.
// One file, one job: the data. state.js owns the rules, render.js owns the drawing.
export const VIEW = { width: 1280, height: 720 };

// The shift: 150 seconds on the clock, three strikes and the buka closes early.
export const SHIFT_SECONDS = 150;
export const MAX_HEARTS = 3;
export const BEST_KEY = 'mamas-buka-rush-best';

// Fixed 1/60 s step, so a slow frame never changes the rules.
export const STEP = 1 / 60;

// Ingredients live in crates along the bottom; each one cooks into one dish.
export const INGREDIENTS = {
  rice: { name: 'Rice', colour: '#f2ead8', dish: 'jollof' },
  chicken: { name: 'Chicken', colour: '#f0b48a', dish: 'suya' },
  dough: { name: 'Dough', colour: '#f6d9a0', dish: 'puff' },
  yam: { name: 'Yam', colour: '#e8d5b0', dish: 'egusi' },
  plantain: { name: 'Plantain', colour: '#f5d54a', dish: 'dodo' },
};

// Dishes: what a station turns an ingredient into, how long it takes, what it pays.
export const DISHES = {
  jollof: { name: 'Jollof Rice', short: 'Jollof', price: 12, cookSeconds: 8, colour: '#e2601e', station: 'pot' },
  suya: { name: 'Suya Skewers', short: 'Suya', price: 14, cookSeconds: 6, colour: '#a34d1d', station: 'grill' },
  puff: { name: 'Puff Puff', short: 'Puff Puff', price: 8, cookSeconds: 5, colour: '#d99a2b', station: 'fryer' },
  egusi: { name: 'Egusi Soup', short: 'Egusi', price: 13, cookSeconds: 9, colour: '#4d7a2e', station: 'soup' },
  dodo: { name: 'Fried Dodo', short: 'Dodo', price: 9, cookSeconds: 5, colour: '#e8b93c', station: 'fryer' },
};

// Stations across the back wall. Each takes one ingredient and cooks one dish at a time.
// A finished dish waits 6 seconds, then burns and must be binned.
export const STATIONS = [
  { id: 'grill', name: 'Charcoal Grill', x: 350, y: 218, w: 190, h: 118, accepts: ['chicken'], blurb: 'suya' },
  { id: 'pot', name: 'Jollof Pot', x: 570, y: 218, w: 190, h: 118, accepts: ['rice'], blurb: 'jollof' },
  { id: 'fryer', name: 'Fryer', x: 790, y: 218, w: 190, h: 118, accepts: ['dough', 'plantain'], blurb: 'puff puff / dodo' },
  { id: 'soup', name: 'Soup Pot', x: 1010, y: 218, w: 190, h: 118, accepts: ['yam'], blurb: 'egusi' },
];
export const BURN_GRACE_SECONDS = 6;

// The plating counter (build a plate here) and the serve window (hand it over there).
export const PLATE = { x: 350, y: 380, w: 260, h: 96 };
export const SERVE = { x: 1010, y: 380, w: 190, h: 96 };

// Ingredient crates along the bottom wall, left to right.
export const CRATES = [
  { id: 'rice', x: 350, y: 586, w: 130, h: 84 },
  { id: 'chicken', x: 500, y: 586, w: 130, h: 84 },
  { id: 'dough', x: 650, y: 586, w: 130, h: 84 },
  { id: 'yam', x: 800, y: 586, w: 130, h: 84 },
  { id: 'plantain', x: 950, y: 586, w: 130, h: 84 },
];
export const BIN = { x: 1140, y: 586, w: 90, h: 84 };

// The floor Ada walks on. Stations, counters and crates sit on its edges.
export const FLOOR = { x: 320, y: 200, w: 944, h: 500 };
export const CHEF = { radius: 22, speed: 300 };

// Tickets: what a hungry customer asks for. Two dishes early, three when the rush bites.
export const TICKET_MIN_DISHES = 2;
export const TICKET_MAX_DISHES = 3;
export const MAX_TICKETS = 4;
export const PATIENCE_START = 52;
export const PATIENCE_END = 34;
export const SPAWN_START = 16;
export const SPAWN_END = 8;
export const FIRST_ORDER_AT = 2;

// A ticket's dish counts, so "two jollof" is one line, not two.
export const TICKET_MENUS = [
  ['jollof', 'suya'],
  ['egusi', 'jollof'],
  ['puff', 'dodo'],
  ['suya', 'puff'],
  ['jollof', 'jollof', 'suya'],
  ['egusi', 'dodo'],
  ['puff', 'puff', 'suya'],
  ['jollof', 'egusi', 'dodo'],
  ['suya', 'suya', 'puff'],
  ['dodo', 'jollof'],
];

// Colours of the buka: terracotta walls, cream tiles, deep green board.
export const COLOURS = {
  wall: '#7a3b1e',
  wallDark: '#5e2c15',
  floorA: '#e8d9b8',
  floorB: '#ddc99e',
  board: '#2e4d2a',
  boardEdge: '#1e331c',
  ticket: '#fff8e6',
  ticketEdge: '#d9c48f',
  hud: '#241608',
  cream: '#fff3d6',
  ink: '#2b1a0e',
  gold: '#f2b705',
  red: '#c0392b',
  green: '#3d8b40',
};
