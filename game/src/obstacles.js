// Obstacles and pickups: what the turkey jumps, slides under, or grabs.
// Kinds: fence (jump), hay bale (jump), oven (wide and hot: jump), thrown
// knife (slide under it), corn (+50) and golden feather (+250, rare).
// Everything spawns ahead of the screen and scrolls left at world speed.
import { GROUND_Y, VIEW } from './config.js';

export const KIND_FENCE = 'fence';
export const KIND_HAY = 'hay';
export const KIND_OVEN = 'oven';
export const KIND_KNIFE = 'knife';
export const KIND_CORN = 'corn';
export const KIND_FEATHER = 'feather';

export function spawnObstacle(random, stage, distance) {
  const roll = random.next();
  const x = VIEW.width + random.range(40, 180);
  if (roll < 0.3) {
    return { kind: KIND_FENCE, x, y: GROUND_Y - 52, width: 26, height: 52, scored: false };
  }
  if (roll < 0.55) {
    return { kind: KIND_HAY, x, y: GROUND_Y - 46, width: 58, height: 46, scored: false };
  }
  if (roll < 0.72) {
    // The oven: the widest jump in the game, glowing hot.
    return { kind: KIND_OVEN, x, y: GROUND_Y - 74, width: 96, height: 74, scored: false };
  }
  if (roll < 0.72 + stage.knifeChance) {
    // A carving knife whistling in at chest height: slide under it.
    return {
      kind: KIND_KNIFE,
      x,
      y: GROUND_Y - 52,
      width: 54,
      height: 12,
      vx: -260,
      scored: false,
    };
  }
  // Otherwise a snack line: corn to chase, sometimes a golden feather.
  const items = [];
  const feather = random.next() < 0.1;
  const count = feather ? 1 : 3 + Math.floor(random.next() * 3);
  for (let i = 0; i < count; i += 1) {
    const kind = feather ? KIND_FEATHER : KIND_CORN;
    const high = random.next() < 0.4;
    items.push({
      kind,
      x: x + i * 46,
      y: high ? GROUND_Y - 190 : GROUND_Y - 60,
      width: 30,
      height: 30,
      scored: false,
    });
  }
  return items;
}

// A thrown knife flies toward the turkey, faster than the world scrolls,
// so it closes the gap from the farmer behind.
export function spawnThrownKnife(farmer, speed) {
  return {
    kind: KIND_KNIFE,
    x: farmer.x + farmer.width,
    y: GROUND_Y - 52,
    width: 54,
    height: 12,
    vx: speed + 300,
    scored: false,
  };
}

export function moveObstacle(item, speed, dt) {
  item.x -= speed * dt;
  if (item.kind === KIND_KNIFE && item.vx !== undefined) item.x += item.vx * dt;
}

export function obstacleOffScreen(item) {
  return item.x + item.width < -80;
}

// A generous overlap test so a near miss still reads as a near miss.
export function overlaps(a, b, shrink = 6) {
  return (
    a.x + shrink < b.x + b.width - shrink &&
    a.x + a.width - shrink > b.x + shrink &&
    a.y + shrink < b.y + b.height - shrink &&
    a.y + a.height - shrink > b.y + shrink
  );
}
