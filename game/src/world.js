// The world: one run of Gobble Run, from the farmhouse door to the forest.
// It owns the turkey, the farmer, the obstacles, the distance and the
// score, and steps them forward in fixed slices. The renderer only reads
// this state; main.js only asks it what happened (EVENT_* flags).
import {
  GOAL_DISTANCE,
  LIVES_START,
  MERCY_SECONDS,
  METRES_PER_PIXEL,
  SCORE,
  STAGES,
  VIEW,
} from './config.js';
import { makeRandom } from './random.js';
import { createTurkey, turkeyHitbox, turkeyStumble, updateTurkey } from './turkey.js';
import { createFarmer, farmerCatches, farmerClose, updateFarmer } from './farmer.js';
import {
  KIND_CORN,
  KIND_FEATHER,
  KIND_KNIFE,
  KIND_OVEN,
  moveObstacle,
  obstacleOffScreen,
  overlaps,
  spawnObstacle,
  spawnThrownKnife,
} from './obstacles.js';

export const EVENT_NONE = 0;
export const EVENT_HIT = 1;
export const EVENT_PICKUP = 2;
export const EVENT_STAGE = 4;
export const EVENT_OVER = 8;
export const EVENT_ESCAPED = 16;
export const EVENT_CAUGHT = 32;

export function stageFor(distance) {
  for (let i = STAGES.length - 1; i >= 0; i -= 1) {
    if (distance >= STAGES[i].from) return STAGES[i];
  }
  return STAGES[0];
}

export function createWorld(seed = 7) {
  const world = {
    seed,
    random: makeRandom(seed),
    turkey: createTurkey(),
    farmer: createFarmer(),
    items: [],
    distance: 0,
    score: 0,
    lives: LIVES_START,
    stageIndex: 0,
    over: false,
    escaped: false,
    caught: false,
    time: 0,
    spawnIn: 260,
    // The scrolling scenery: fence posts, pumpkins, trees, kitchen tiles.
    scenery: [],
    message: '',
    messageTime: 0,
  };
  seedScenery(world);
  return world;
}

function seedScenery(world) {
  world.scenery = [];
  for (let i = 0; i < 14; i += 1) {
    world.scenery.push({
      x: i * 110 + world.random.range(0, 60),
      kind: world.random.pick(['pumpkin', 'post', 'tree', 'bush', 'pot']),
      wobble: world.random.range(0, Math.PI * 2),
    });
  }
}

export function resetWorld(world, seed = 7) {
  const fresh = createWorld(seed);
  Object.assign(world, fresh);
}

export function worldSpeed(world) {
  return stageFor(world.distance).speed;
}

function hurtTurkey(world, audio) {
  if (world.turkey.mercy > 0 || world.over) return EVENT_NONE;
  world.lives -= 1;
  world.turkey.mercy = MERCY_SECONDS;
  turkeyStumble(world.turkey);
  world.farmer.gap = Math.max(0, world.farmer.gap - 40);
  audio.hit();
  if (world.lives <= 0) {
    world.over = true;
    world.caught = true;
    audio.caught();
    return EVENT_HIT | EVENT_OVER | EVENT_CAUGHT;
  }
  return EVENT_HIT;
}

export function stepWorld(world, input, dt, audio) {
  if (world.over) return EVENT_NONE;
  let events = EVENT_NONE;
  const stage = stageFor(world.distance);
  const speed = stage.speed;
  const stageIndex = STAGES.indexOf(stage);
  if (stageIndex !== world.stageIndex) {
    world.stageIndex = stageIndex;
    world.message = stage.name.toUpperCase();
    world.messageTime = 2.2;
    world.score += SCORE.stageBonus;
    audio.stage();
    events |= EVENT_STAGE;
  }
  if (world.messageTime > 0) world.messageTime = Math.max(0, world.messageTime - dt);

  updateTurkey(world.turkey, input, dt, audio);
  const threw = updateFarmer(world.farmer, world.turkey, dt, stage, world.random);
  if (threw) {
    world.items.push(spawnThrownKnife(world.farmer, speed));
    audio.knife();
  }

  world.distance += speed * dt * METRES_PER_PIXEL;
  world.score += speed * dt * METRES_PER_PIXEL * SCORE.perMetre;
  world.time += dt;

  // Spawn the next obstacle or snack line just off the right edge.
  world.spawnIn -= speed * dt;
  if (world.spawnIn <= 0) {
    world.spawnIn = stage.spawnEvery * (0.85 + world.random.next() * 0.4);
    const spawned = spawnObstacle(world.random, stage, world.distance);
    if (Array.isArray(spawned)) world.items.push(...spawned);
    else world.items.push(spawned);
  }

  const hitbox = turkeyHitbox(world.turkey);
  for (let i = world.items.length - 1; i >= 0; i -= 1) {
    const item = world.items[i];
    moveObstacle(item, speed, dt);
    if (obstacleOffScreen(item)) {
      world.items.splice(i, 1);
      continue;
    }
    if (item.kind === KIND_CORN || item.kind === KIND_FEATHER) {
      if (overlaps(hitbox, item, 2)) {
        world.score += item.kind === KIND_FEATHER ? SCORE.goldenFeather : SCORE.corn;
        if (item.kind === KIND_FEATHER) audio.feather();
        else audio.pickup();
        world.items.splice(i, 1);
        events |= EVENT_PICKUP;
      }
      continue;
    }
    // Knives only hurt at head height: sliding under one is the dodge.
    if (item.kind === KIND_KNIFE && world.turkey.sliding) continue;
    if (overlaps(hitbox, item, 10)) {
      if (item.kind === KIND_OVEN) {
        // The oven burns even on a graze: no mercy window, it ends the run fast.
        events |= hurtTurkey(world, audio);
      } else {
        events |= hurtTurkey(world, audio);
      }
      world.items.splice(i, 1);
      if (world.over) break;
    }
  }

  // Scenery drifts with the world so the ground never looks frozen.
  for (const prop of world.scenery) {
    prop.x -= speed * dt * 0.6;
    if (prop.x < -120) {
      prop.x = VIEW.width + world.random.range(0, 120);
      prop.kind = world.random.pick(['pumpkin', 'post', 'tree', 'bush', 'pot']);
    }
  }

  if (farmerCatches(world.farmer)) {
    world.over = true;
    world.caught = true;
    audio.caught();
    events |= EVENT_OVER | EVENT_CAUGHT;
  } else if (world.distance >= GOAL_DISTANCE) {
    world.over = true;
    world.escaped = true;
    world.score += SCORE.escapeBonus;
    audio.escaped();
    events |= EVENT_OVER | EVENT_ESCAPED;
  }

  audio.setUrgent(farmerClose(world.farmer) && !world.over);
  return events;
}

export function worldSummary(world) {
  return {
    score: Math.floor(world.score),
    distance: Math.floor(world.distance),
    lives: world.lives,
    stage: stageFor(world.distance).name,
    escaped: world.escaped,
    caught: world.caught,
  };
}
