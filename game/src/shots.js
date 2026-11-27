// The screenshot scenes behind ?shot=title|farm|kitchen|escaped|caught.
// Each one plays the real rules forward from a fresh world for a fixed
// number of steps, steered by a simple autopilot (jump the fence, hay and
// oven in time, slide under a knife, chase the corn), so the frame is what
// a real run looks like and the same seed always stages the same frame.
import { GROUND_Y, VIEW } from './config.js';
import { createWorld, stageFor, stepWorld } from './world.js';
import { turkeyHitbox } from './turkey.js';
import { KIND_CORN, KIND_FEATHER, KIND_KNIFE } from './obstacles.js';
import { SCREEN_OVER, SCREEN_PLAY, SCREEN_TITLE } from './render.js';

const STEP = 1 / 60;
const TITLE_SECONDS = 2;
const FARM_SECONDS = 14;
const KITCHEN_SECONDS = 46;
const END_LIMIT_SECONDS = 90;

// A full jump stays airborne about 0.62 s and stays above the tallest
// obstacle until about 0.57 s in, so the autopilot jumps when the
// obstacle's far edge will have passed the turkey by then — late enough
// to still be high, early enough to land past it.
const JUMP_HIGH_SECONDS = 0.57;
const JUMP_MIN_GAP = 16;

// A fake input object the autopilot drives instead of the keyboard.
function autopilotInput(world) {
  const input = {
    heldActions: new Set(),
    pressedActions: new Set(),
    held(action) {
      return this.heldActions.has(action);
    },
    wasPressed(action) {
      return this.pressedActions.has(action);
    },
    drainPresses() {},
    takeClicks() {
      return [];
    },
  };
  const turkey = world.turkey;
  const box = turkeyHitbox(turkey);
  const stage = stageFor(world.distance);
  const jumpReach = stage.speed * JUMP_HIGH_SECONDS - box.width;
  let jump = false;
  let slide = false;
  for (const item of world.items) {
    if (item.x + item.width < box.x - 20) continue;
    const gap = item.x - (box.x + box.width);
    if (item.kind === KIND_KNIFE) {
      // A knife ahead: slide when it is close. A knife the farmer threw
      // from behind: slide when its tip nears the turkey's heels.
      if (gap < 260 && gap > -60) slide = true;
      if (item.x < box.x && box.x - (item.x + item.width) < 70) slide = true;
    } else if (item.kind === KIND_CORN || item.kind === KIND_FEATHER) {
      // Snacks are never worth a jump on their own.
      continue;
    } else if (turkey.onGround && gap < jumpReach - item.width && gap > JUMP_MIN_GAP) {
      // Jump so the turkey is still high when the obstacle slides under
      // it and lands just past its far edge.
      jump = true;
    }
  }
  if (jump) {
    input.heldActions.add('jump');
    input.pressedActions.add('jump');
  }
  // Keep holding jump while airborne: releasing early cuts the leap short,
  // and a cut leap lands inside a wide oven instead of past it.
  if (!turkey.onGround) input.heldActions.add('jump');
  if (slide) input.heldActions.add('slide');
  return input;
}

function runFor(world, seconds, audio, pilot) {
  for (let i = 0; i < seconds / STEP; i += 1) {
    const input = pilot ? autopilotInput(world) : { held: () => false, wasPressed: () => false, drainPresses() {}, takeClicks: () => [] };
    const events = stepWorld(world, input, STEP, audio);
    if (events & 8) break;
  }
}

const silentAudio = {
  jump() {},
  slide() {},
  pickup() {},
  feather() {},
  gobble() {},
  hit() {},
  knife() {},
  alarm() {},
  caught() {},
  escaped() {},
  stage() {},
  setUrgent() {},
  setMuted() {},
  unlock() {},
};

/**
 * Set `world` to the named scene and return the screen to draw over it.
 * Names: title, farm, kitchen, escaped, caught. Anything else is title.
 */
export function stageShot(name, world, seed) {
  const fresh = createWorld(seed);
  Object.assign(world, fresh);
  if (name === 'title') {
    runFor(world, TITLE_SECONDS, silentAudio, false);
    return { screen: SCREEN_TITLE, best: 12340 };
  }
  if (name === 'farm') {
    runFor(world, FARM_SECONDS, silentAudio, true);
    return { screen: SCREEN_PLAY, best: 0 };
  }
  if (name === 'kitchen') {
    runFor(world, KITCHEN_SECONDS, silentAudio, true);
    // The kitchen shot wants the oven in frame: nudge one in if the
    // autopilot's run did not leave one on screen.
    const hasOven = world.items.some((item) => item.kind === 'oven');
    if (!hasOven) {
      world.items.push({ kind: 'oven', x: VIEW.width - 260, y: GROUND_Y - 74, width: 96, height: 74, scored: false });
    }
    return { screen: SCREEN_PLAY, best: 0 };
  }
  if (name === 'escaped') {
    runFor(world, END_LIMIT_SECONDS, silentAudio, true);
    if (!world.over) {
      // The autopilot is good; force the finish line for the end screen.
      world.distance = 1000;
      world.escaped = true;
      world.over = true;
      world.score += 2000;
    }
    return { screen: SCREEN_OVER, best: 0 };
  }
  if (name === 'caught') {
    // A careless pilot that never jumps: the farmer catches it quickly.
    runFor(world, END_LIMIT_SECONDS, silentAudio, false);
    if (!world.over) {
      world.lives = 0;
      world.caught = true;
      world.over = true;
    }
    return { screen: SCREEN_OVER, best: 0 };
  }
  runFor(world, TITLE_SECONDS, silentAudio, false);
  return { screen: SCREEN_TITLE, best: 12340 };
}
