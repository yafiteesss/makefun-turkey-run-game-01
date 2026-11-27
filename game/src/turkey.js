// The turkey: a runner that jumps, slides and stumbles.
// Physics live here; the world decides when the turkey is hurt, the
// renderer decides how it looks mid-jump, mid-slide or mid-stumble.
import { GRAVITY, GROUND_Y, TURKEY, TURKEY_X } from './config.js';

export function createTurkey() {
  return {
    x: TURKEY_X,
    y: GROUND_Y - TURKEY.height,
    vy: 0,
    width: TURKEY.width,
    height: TURKEY.height,
    sliding: false,
    stumbling: 0,
    mercy: 0,
    onGround: true,
    runTime: 0,
    // A jump pressed a moment before landing still counts (coyote + buffer).
    jumpBuffer: 0,
    coyote: 0,
  };
}

export function turkeyHitbox(turkey) {
  const height = turkey.sliding ? TURKEY.slideHeight : TURKEY.height;
  return {
    x: turkey.x + 8,
    y: turkey.y + (TURKEY.height - height),
    width: turkey.width - 16,
    height,
  };
}

export function updateTurkey(turkey, input, dt, audio) {
  const wantJump = input.wasPressed('jump');
  const wantSlide = input.held('slide');

  if (wantJump) turkey.jumpBuffer = 0.12;
  else turkey.jumpBuffer = Math.max(0, turkey.jumpBuffer - dt);

  if (turkey.onGround) turkey.coyote = 0.1;
  else turkey.coyote = Math.max(0, turkey.coyote - dt);

  if (turkey.stumbling > 0) {
    turkey.stumbling = Math.max(0, turkey.stumbling - dt);
  } else if (turkey.jumpBuffer > 0 && turkey.coyote > 0) {
    const held = input.held('jump');
    turkey.vy = held ? TURKEY.jumpVelocity : TURKEY.hopVelocity;
    turkey.onGround = false;
    turkey.sliding = false;
    turkey.jumpBuffer = 0;
    turkey.coyote = 0;
    audio.jump();
  }

  // Letting go of jump early cuts the rise: a tap is a hop, a hold is a leap.
  if (!input.held('jump') && turkey.vy < -300) turkey.vy += GRAVITY * dt * 1.6;

  turkey.sliding = wantSlide && turkey.onGround && turkey.stumbling <= 0;

  turkey.vy = Math.min(TURKEY.maxFall, turkey.vy + GRAVITY * dt);
  turkey.y += turkey.vy * dt;
  if (turkey.y >= GROUND_Y - TURKEY.height) {
    turkey.y = GROUND_Y - TURKEY.height;
    turkey.vy = 0;
    turkey.onGround = true;
  } else {
    turkey.onGround = false;
  }

  if (turkey.mercy > 0) turkey.mercy = Math.max(0, turkey.mercy - dt);
  turkey.runTime += dt;
}

export function turkeyStumble(turkey) {
  turkey.stumbling = 0.55;
  turkey.sliding = false;
  turkey.vy = -260;
  turkey.onGround = false;
}
