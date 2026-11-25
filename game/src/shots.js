// Mama's Buka Rush — shots: the four staged scenes behind ?shot=.
// Each one plays the real rules forward from a fresh seeded world, steering Ada with
// the same calls a player makes (grab, cook, plate, serve), so the frame is what a real
// shift looks like — and the same seed always gives the same frame.
import { DISHES, SHIFT_SECONDS } from './config.js';
import {
  createWorld, interact, interactableAt, moveChef, nearestInteractable,
  SCREEN_OVER, SCREEN_PLAY, SCREEN_TITLE, startCooking, stepWorld,
} from './state.js';

const SAMPLE = 1 / 60;

function runFor(state, seconds, steer) {
  for (let t = 0; t < seconds; t += SAMPLE) {
    if (steer) steer(state, t);
    moveChef(state, SAMPLE, { left: false, right: false, up: false, down: false });
    stepWorld(state, SAMPLE);
    if (state.screen === SCREEN_OVER) break;
  }
}

function teleport(state, x, y) {
  state.chef.x = x;
  state.chef.y = y;
  state.chef.moving = false;
}

function useAt(state, x, y) {
  teleport(state, x, y);
  const target = interactableAt(state, x, y) || nearestInteractable(state);
  if (target) interact(state, target);
}

function startDish(state, crateX, stationX, stationY) {
  useAt(state, crateX, 620);
  useAt(state, stationX, stationY);
}

// The cover: a full board, one jollof on the pot, suya on the grill, a plate
// mid-assembly and the timer running — every first-criterion element in one frame.
function stageKitchen(state) {
  state.screen = SCREEN_PLAY;
  runFor(state, 12);
  startDish(state, 415, 660, 270); // rice -> pot (jollof)
  startDish(state, 565, 445, 270); // chicken -> grill (suya)
  runFor(state, 5);
  startDish(state, 715, 885, 270); // dough -> fryer (puff puff)
  runFor(state, 4);
  // Take the finished suya off the grill and put it on the plate.
  useAt(state, 445, 270);
  useAt(state, 480, 428);
  runFor(state, 1.5);
  // Step into the aisle so Ada is fully visible, plate on the counter beside her.
  teleport(state, 640, 510);
}

// The rush: four tickets on the board, two stations cooking, one dish ready.
function stageRush(state) {
  state.screen = SCREEN_PLAY;
  runFor(state, 30);
  startDish(state, 415, 660, 270);
  startDish(state, 565, 445, 270);
  startDish(state, 865, 1105, 270); // yam -> soup pot (egusi)
  runFor(state, 6.5);
  // Suya is ready: hold it up while the pot and soup still cook.
  useAt(state, 445, 270);
  runFor(state, 0.5);
}

// The serve: a finished plate of jollof + suya, carried to the window.
function stageServe(state) {
  state.screen = SCREEN_PLAY;
  runFor(state, 8);
  startDish(state, 415, 660, 270);
  startDish(state, 565, 445, 270);
  runFor(state, 8.5);
  useAt(state, 445, 270); // take suya
  useAt(state, 480, 428); // onto the plate
  useAt(state, 660, 270); // take jollof
  useAt(state, 480, 428); // onto the plate
  useAt(state, 480, 428); // pick the plate up
  teleport(state, 980, 530); // carry it to the serve window, fully in view
  runFor(state, 0.4);
}

// The end: a shift that ran out of time, with the score on the board.
function stageEnd(state) {
  state.screen = SCREEN_PLAY;
  runFor(state, 8);
  startDish(state, 415, 660, 270);
  startDish(state, 565, 445, 270);
  runFor(state, 8.5);
  useAt(state, 445, 270);
  useAt(state, 480, 428);
  useAt(state, 660, 270);
  useAt(state, 480, 428);
  // Hand the plate over: a served order and coins on the board.
  state.carry = { kind: 'plate', dishes: state.plate.slice() };
  state.plate = [];
  teleport(state, 1105, 428);
  const target = interactableAt(state, 1105, 428);
  if (target) interact(state, target);
  state.time = SHIFT_SECONDS - 1;
  state.timeLeft = 1;
  runFor(state, 1.2);
  state.screen = SCREEN_OVER;
}

const STAGES = { kitchen: stageKitchen, rush: stageRush, serve: stageServe, end: stageEnd, title: null };

export function stageShot(random, shot) {
  const state = createWorld(random);
  if (shot === 'title') {
    state.screen = SCREEN_TITLE;
    return state;
  }
  const stage = STAGES[shot];
  if (!stage) return null;
  stage(state);
  return state;
}

export { SCREEN_OVER, SCREEN_PLAY, SCREEN_TITLE };
export { DISHES };
