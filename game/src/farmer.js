// The farmer: he never stops, he only gains or loses ground.
// A clean run leaves him behind; every stumble lets him close the gap, and
// a knife hit costs a life and a chunk of the lead at once. When the gap
// closes to zero he grabs the turkey and the run is over.
import { FARMER, GROUND_Y } from './config.js';

export function createFarmer() {
  return {
    // x is measured as the gap behind the turkey, in pixels.
    gap: FARMER.startGap,
    x: 0,
    y: GROUND_Y - FARMER.height,
    width: FARMER.width,
    height: FARMER.height,
    runTime: 0,
    throwing: 0,
    // Seconds until his next thrown knife, when the stage allows it.
    throwIn: 4,
  };
}

export function updateFarmer(farmer, turkey, dt, stage, random) {
  farmer.runTime += dt;
  if (farmer.throwing > 0) farmer.throwing = Math.max(0, farmer.throwing - dt);

  const stumbling = turkey.stumbling > 0;
  if (stumbling) {
    farmer.gap -= FARMER.chaseRate * dt;
  } else {
    farmer.gap += FARMER.fallBehindRate * dt;
  }
  // He never falls further back than where he started, and never passes the turkey.
  farmer.gap = Math.max(0, Math.min(FARMER.startGap + 60, farmer.gap));
  farmer.x = turkey.x - farmer.gap - farmer.width;

  // He throws a carving knife whenever the stage's odds say so and the
  // turkey has some lead to lose; a throw takes a visible wind-up first.
  farmer.throwIn -= dt;
  if (farmer.throwIn <= 0 && farmer.gap < FARMER.startGap && stage.knifeChance > 0) {
    farmer.throwing = 0.45;
    farmer.throwIn = 3.5 + random.range(0, 3);
    return true;
  }
  return false;
}

export function farmerCatches(farmer) {
  return farmer.gap <= 0;
}

export function farmerClose(farmer) {
  return farmer.gap <= 110;
}
