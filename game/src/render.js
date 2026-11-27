// Every pixel of Gobble Run: the farm, the kitchen, the turkey, the farmer,
// the HUD and the title and end screens. All art is drawn with canvas
// shapes in one autumn palette — no image files, nothing fetched.
import { GOAL_DISTANCE, GROUND_Y, STAGES, VIEW } from './config.js';
import { stageFor } from './world.js';
import { KIND_CORN, KIND_FENCE, KIND_FEATHER, KIND_HAY, KIND_KNIFE, KIND_OVEN } from './obstacles.js';

export const SCREEN_TITLE = 'title';
export const SCREEN_PLAY = 'play';
export const SCREEN_OVER = 'over';

const FONT = '"Trebuchet MS", "Segoe UI", sans-serif';
const DISPLAY_FONT = '"Trebuchet MS", "Segoe UI", sans-serif';

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function drawSky(ctx, stage, time) {
  const gradient = ctx.createLinearGradient(0, 0, 0, GROUND_Y);
  gradient.addColorStop(0, stage.sky[0]);
  gradient.addColorStop(1, stage.sky[1]);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, VIEW.width, GROUND_Y);

  // Low autumn sun.
  ctx.fillStyle = '#fff3c4';
  ctx.beginPath();
  ctx.arc(1080, 110, 46, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(255, 243, 196, 0.35)';
  ctx.beginPath();
  ctx.arc(1080, 110, 70, 0, Math.PI * 2);
  ctx.fill();

  // Drifting clouds.
  ctx.fillStyle = 'rgba(255, 250, 235, 0.85)';
  for (let i = 0; i < 4; i += 1) {
    const cx = ((i * 340 + time * 12) % (VIEW.width + 260)) - 130;
    const cy = 70 + i * 42;
    ctx.beginPath();
    ctx.ellipse(cx, cy, 62, 20, 0, 0, Math.PI * 2);
    ctx.ellipse(cx + 44, cy + 6, 44, 16, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // Distant hills and, in the kitchen stage, the farmhouse roofline.
  ctx.fillStyle = 'rgba(122, 90, 48, 0.35)';
  ctx.beginPath();
  ctx.moveTo(0, GROUND_Y);
  ctx.quadraticCurveTo(320, GROUND_Y - 120, 640, GROUND_Y - 40);
  ctx.quadraticCurveTo(960, GROUND_Y - 130, VIEW.width, GROUND_Y - 50);
  ctx.lineTo(VIEW.width, GROUND_Y);
  ctx.closePath();
  ctx.fill();
}

function drawGround(ctx, stage, time) {
  ctx.fillStyle = stage.ground;
  ctx.fillRect(0, GROUND_Y, VIEW.width, VIEW.height - GROUND_Y);
  ctx.fillStyle = stage.grass;
  ctx.fillRect(0, GROUND_Y, VIEW.width, 14);
  // A dirt track the turkey runs along.
  ctx.fillStyle = 'rgba(0, 0, 0, 0.12)';
  ctx.fillRect(0, GROUND_Y + 46, VIEW.width, 10);
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.18)';
  ctx.lineWidth = 2;
  for (let x = -((time * 320) % 64); x < VIEW.width; x += 64) {
    ctx.beginPath();
    ctx.moveTo(x, GROUND_Y + 22);
    ctx.lineTo(x + 26, GROUND_Y + 22);
    ctx.stroke();
  }
}

function drawSceneryProp(ctx, prop, stage) {
  const x = prop.x;
  const y = GROUND_Y;
  if (prop.kind === 'pumpkin') {
    ctx.fillStyle = '#e07830';
    ctx.beginPath();
    ctx.ellipse(x, y - 16, 26, 18, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#c85f1e';
    ctx.beginPath();
    ctx.ellipse(x, y - 16, 12, 18, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#5d7a2e';
    ctx.fillRect(x - 3, y - 38, 6, 10);
  } else if (prop.kind === 'post') {
    ctx.fillStyle = '#8a5a2e';
    ctx.fillRect(x - 5, y - 64, 10, 64);
    ctx.fillRect(x - 22, y - 58, 44, 8);
    ctx.fillRect(x - 22, y - 34, 44, 8);
  } else if (prop.kind === 'tree') {
    ctx.fillStyle = '#6d4a22';
    ctx.fillRect(x - 7, y - 78, 14, 78);
    ctx.fillStyle = stage.name === 'The Kitchen' ? '#a34a2a' : '#c96a2e';
    ctx.beginPath();
    ctx.arc(x, y - 96, 42, 0, Math.PI * 2);
    ctx.arc(x - 30, y - 76, 26, 0, Math.PI * 2);
    ctx.arc(x + 30, y - 76, 26, 0, Math.PI * 2);
    ctx.fill();
  } else if (prop.kind === 'bush') {
    ctx.fillStyle = '#6f8f3a';
    ctx.beginPath();
    ctx.arc(x, y - 12, 24, 0, Math.PI * 2);
    ctx.arc(x + 22, y - 8, 18, 0, Math.PI * 2);
    ctx.fill();
  } else {
    // A kitchen pot left outside the back door.
    ctx.fillStyle = '#4a4a52';
    ctx.beginPath();
    ctx.ellipse(x, y - 14, 26, 16, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#33333a';
    ctx.fillRect(x - 30, y - 26, 60, 8);
  }
}

function drawFence(ctx, item) {
  ctx.fillStyle = '#9a6a35';
  ctx.fillRect(item.x, item.y, 6, item.height);
  ctx.fillRect(item.x + item.width - 6, item.y, 6, item.height);
  ctx.fillStyle = '#b08145';
  ctx.fillRect(item.x - 4, item.y + 8, item.width + 8, 9);
  ctx.fillRect(item.x - 4, item.y + 30, item.width + 8, 9);
  ctx.fillStyle = '#7d5327';
  ctx.beginPath();
  ctx.moveTo(item.x + 3, item.y);
  ctx.lineTo(item.x + 9, item.y - 8);
  ctx.lineTo(item.x + 15, item.y);
  ctx.closePath();
  ctx.fill();
}

function drawHay(ctx, item, time) {
  ctx.fillStyle = '#d9a83f';
  ctx.beginPath();
  ctx.arc(item.x + item.width / 2, item.y + item.height / 2, 30, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#b8892a';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(item.x + item.width / 2, item.y + item.height / 2, 20, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(184, 137, 42, 0.7)';
  ctx.lineWidth = 2;
  for (let i = 0; i < 5; i += 1) {
    const a = time * 0.4 + (i * Math.PI) / 2.5;
    ctx.beginPath();
    ctx.moveTo(item.x + item.width / 2, item.y + item.height / 2);
    ctx.lineTo(item.x + item.width / 2 + Math.cos(a) * 28, item.y + item.height / 2 + Math.sin(a) * 28);
    ctx.stroke();
  }
}

function drawOven(ctx, item, time) {
  // The oven: a squat iron box, its door glowing, chimney puffing smoke.
  ctx.fillStyle = '#3a3a42';
  ctx.fillRect(item.x, item.y, item.width, item.height);
  ctx.fillStyle = '#55555f';
  ctx.fillRect(item.x + 6, item.y + 6, item.width - 12, 14);
  ctx.fillStyle = '#2c2c33';
  ctx.fillRect(item.x + 10, item.y - 26, 18, 26);
  ctx.fillStyle = 'rgba(120, 120, 130, 0.5)';
  for (let i = 0; i < 3; i += 1) {
    const t = ((time * 0.5 + i / 3) % 1);
    ctx.beginPath();
    ctx.arc(item.x + 19 + Math.sin(t * 5) * 6, item.y - 30 - t * 46, 8 + t * 10, 0, Math.PI * 2);
    ctx.fill();
  }
  // Fire glow in the door window, flickering.
  const flicker = 0.75 + Math.sin(time * 11) * 0.25;
  ctx.fillStyle = `rgba(255, ${Math.floor(120 + 60 * flicker)}, 30, ${0.85 * flicker})`;
  roundRect(ctx, item.x + 16, item.y + 28, item.width - 32, 30, 6);
  ctx.fill();
  ctx.fillStyle = '#ffb13d';
  ctx.beginPath();
  ctx.moveTo(item.x + 30, item.y + 56);
  ctx.quadraticCurveTo(item.x + 40, item.y + 32, item.x + 48, item.y + 56);
  ctx.quadraticCurveTo(item.x + 58, item.y + 38, item.x + 66, item.y + 56);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 15px ' + FONT;
  ctx.textAlign = 'center';
  ctx.fillText('HOT!', item.x + item.width / 2, item.y + 20);
}

function drawKnife(ctx, item) {
  ctx.save();
  ctx.translate(item.x + item.width / 2, item.y + item.height / 2);
  ctx.rotate(-0.12);
  // Blade.
  ctx.fillStyle = '#dfe6ee';
  ctx.beginPath();
  ctx.moveTo(-27, -5);
  ctx.lineTo(12, -5);
  ctx.lineTo(27, 0);
  ctx.lineTo(12, 5);
  ctx.lineTo(-27, 5);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#9aa5b1';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  // Handle.
  ctx.fillStyle = '#5e2b25';
  roundRect(ctx, -27, -6, 12, 12, 3);
  ctx.fill();
  ctx.restore();
  // Motion streaks.
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.55)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(item.x + item.width + 8, item.y + 4);
  ctx.lineTo(item.x + item.width + 34, item.y + 4);
  ctx.moveTo(item.x + item.width + 4, item.y + 10);
  ctx.lineTo(item.x + item.width + 26, item.y + 10);
  ctx.stroke();
}

function drawCorn(ctx, item, time) {
  const bob = Math.sin(time * 3 + item.x * 0.05) * 3;
  ctx.fillStyle = '#f7c948';
  ctx.beginPath();
  ctx.ellipse(item.x + 15, item.y + 15 + bob, 11, 16, 0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#d9a400';
  ctx.lineWidth = 1.5;
  for (let i = -1; i <= 1; i += 1) {
    ctx.beginPath();
    ctx.moveTo(item.x + 15 + i * 5, item.y + 2 + bob);
    ctx.lineTo(item.x + 15 + i * 5, item.y + 28 + bob);
    ctx.stroke();
  }
  ctx.fillStyle = '#5d8a2e';
  ctx.beginPath();
  ctx.ellipse(item.x + 4, item.y + 28 + bob, 8, 5, -0.6, 0, Math.PI * 2);
  ctx.fill();
}

function drawFeather(ctx, item, time) {
  const bob = Math.sin(time * 4 + item.x * 0.05) * 4;
  const glow = 0.5 + Math.sin(time * 5) * 0.3;
  ctx.fillStyle = `rgba(255, 215, 80, ${glow})`;
  ctx.beginPath();
  ctx.arc(item.x + 15, item.y + 15 + bob, 24, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ffd94d';
  ctx.beginPath();
  ctx.ellipse(item.x + 15, item.y + 15 + bob, 7, 15, 0.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#c89b1e';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(item.x + 15, item.y + 2 + bob);
  ctx.lineTo(item.x + 15, item.y + 30 + bob);
  ctx.stroke();
}

export function drawTurkey(ctx, turkey, time) {
  const sliding = turkey.sliding;
  const stumbling = turkey.stumbling > 0;
  const flash = turkey.mercy > 0 && Math.floor(time * 12) % 2 === 0;
  const x = turkey.x;
  const y = turkey.y + (sliding ? TURKEY_SLIDE_LIFT : 0);
  const runPhase = turkey.runTime * 14;
  const legSwing = turkey.onGround ? Math.sin(runPhase) * 10 : 6;

  ctx.save();
  if (flash) ctx.globalAlpha = 0.35;
  if (stumbling) ctx.rotate(-0.18);
  ctx.translate(x, y);

  // Legs: two orange sticks scissoring while running, tucked while sliding.
  ctx.strokeStyle = '#e07b28';
  ctx.lineWidth = 5;
  ctx.lineCap = 'round';
  if (sliding) {
    ctx.beginPath();
    ctx.moveTo(22, 52);
    ctx.lineTo(44, 58);
    ctx.moveTo(34, 52);
    ctx.lineTo(52, 58);
    ctx.stroke();
  } else if (turkey.onGround) {
    ctx.beginPath();
    ctx.moveTo(24, 48);
    ctx.lineTo(24 + legSwing, 62);
    ctx.moveTo(38, 48);
    ctx.lineTo(38 - legSwing, 62);
    ctx.stroke();
  } else {
    ctx.beginPath();
    ctx.moveTo(24, 48);
    ctx.lineTo(18, 60);
    ctx.moveTo(38, 48);
    ctx.lineTo(46, 58);
    ctx.stroke();
  }

  // Tail fan: five autumn feathers fanning behind.
  const tailColors = ['#a34a2a', '#c96a2e', '#e07830', '#8c3b2e', '#d9a83f'];
  for (let i = 0; i < 5; i += 1) {
    const angle = -0.9 + i * 0.45;
    ctx.save();
    ctx.translate(14, 26);
    ctx.rotate(angle);
    ctx.fillStyle = tailColors[i];
    ctx.beginPath();
    ctx.ellipse(-16, 0, 20, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.beginPath();
    ctx.ellipse(-26, 0, 6, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // Body: a plump brown oval, squashed flat while sliding.
  ctx.fillStyle = '#8a5a2e';
  ctx.beginPath();
  ctx.ellipse(32, sliding ? 40 : 32, 30, sliding ? 14 : 24, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#a9713d';
  ctx.beginPath();
  ctx.ellipse(38, sliding ? 42 : 38, 20, sliding ? 10 : 15, 0, 0, Math.PI * 2);
  ctx.fill();

  // Wing, flapping a little harder in the air.
  const flap = turkey.onGround ? Math.sin(runPhase) * 4 : -10;
  ctx.fillStyle = '#6d4522';
  ctx.beginPath();
  ctx.ellipse(30, 32 + flap * 0.4, 16, 10, -0.5 + flap * 0.02, 0, Math.PI * 2);
  ctx.fill();

  // Head and neck, stretched up when running.
  const headY = sliding ? 30 : 6;
  ctx.fillStyle = '#8a5a2e';
  ctx.fillRect(52, headY + 6, 10, 18);
  ctx.fillStyle = '#a9713d';
  ctx.beginPath();
  ctx.arc(58, headY + 4, 13, 0, Math.PI * 2);
  ctx.fill();

  // Beak, wattle and a worried eye.
  ctx.fillStyle = '#f08a1d';
  ctx.beginPath();
  ctx.moveTo(68, headY + 2);
  ctx.lineTo(82, headY + 7);
  ctx.lineTo(68, headY + 11);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#d23b2e';
  ctx.beginPath();
  ctx.ellipse(64, headY + 14, 4, 7, 0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(61, headY, 4.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#1c1c1c';
  ctx.beginPath();
  ctx.arc(stumbling ? 59 : 62, headY, 2.4, 0, Math.PI * 2);
  ctx.fill();

  if (stumbling) {
    // Dizzy stars circling the head.
    ctx.fillStyle = '#ffd94d';
    for (let i = 0; i < 3; i += 1) {
      const a = time * 6 + (i * Math.PI * 2) / 3;
      ctx.beginPath();
      ctx.arc(58 + Math.cos(a) * 20, headY - 8 + Math.sin(a) * 8, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}

const TURKEY_SLIDE_LIFT = 24;

export function drawFarmer(ctx, farmer, time) {
  const x = farmer.x;
  const y = farmer.y;
  const runPhase = farmer.runTime * 13;
  const legSwing = Math.sin(runPhase) * 12;
  const throwing = farmer.throwing > 0;

  ctx.save();
  ctx.translate(x, y);

  // Legs: work boots pumping.
  ctx.strokeStyle = '#3a2a18';
  ctx.lineWidth = 7;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(30, 62);
  ctx.lineTo(30 + legSwing, 94);
  ctx.moveTo(44, 62);
  ctx.lineTo(44 - legSwing, 94);
  ctx.stroke();

  // Overalls and red shirt.
  ctx.fillStyle = '#2e5fa3';
  ctx.fillRect(20, 40, 36, 26);
  ctx.fillStyle = '#b03a2e';
  ctx.fillRect(18, 22, 40, 22);
  ctx.fillStyle = '#2e5fa3';
  ctx.fillRect(22, 22, 6, 22);
  ctx.fillRect(48, 22, 6, 22);

  // Arms: pumping, or raised high mid-throw.
  ctx.strokeStyle = '#b03a2e';
  ctx.lineWidth = 7;
  ctx.beginPath();
  if (throwing) {
    ctx.moveTo(52, 28);
    ctx.lineTo(70, 2);
  } else {
    ctx.moveTo(52, 28);
    ctx.lineTo(62, 44 - legSwing * 0.5);
    ctx.moveTo(22, 28);
    ctx.lineTo(12, 44 + legSwing * 0.5);
  }
  ctx.stroke();
  if (throwing) {
    ctx.fillStyle = '#e8e8e8';
    ctx.beginPath();
    ctx.moveTo(70, -6);
    ctx.lineTo(84, -2);
    ctx.lineTo(70, 4);
    ctx.closePath();
    ctx.fill();
  }

  // Head: moustache, angry brows, straw hat.
  ctx.fillStyle = '#f0c297';
  ctx.beginPath();
  ctx.arc(38, 12, 14, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#5a3a1a';
  ctx.fillRect(28, 16, 20, 4);
  ctx.fillStyle = '#1c1c1c';
  ctx.beginPath();
  ctx.arc(33, 9, 2, 0, Math.PI * 2);
  ctx.arc(44, 9, 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#1c1c1c';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(29, 6);
  ctx.lineTo(36, 8);
  ctx.moveTo(48, 6);
  ctx.lineTo(41, 8);
  ctx.stroke();
  ctx.fillStyle = '#d9b23f';
  ctx.beginPath();
  ctx.ellipse(38, 0, 24, 6, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#c49a2e';
  ctx.beginPath();
  ctx.ellipse(38, -6, 14, 8, 0, Math.PI, 0);
  ctx.fill();
  ctx.restore();
}

function drawHearts(ctx, lives, x, y) {
  for (let i = 0; i < 3; i += 1) {
    const filled = i < lives;
    ctx.fillStyle = filled ? '#e0483e' : 'rgba(255, 255, 255, 0.35)';
    ctx.beginPath();
    ctx.moveTo(x + i * 34, y + 8);
    ctx.bezierCurveTo(x + i * 34 - 10, y - 4, x + i * 34 - 16, y + 8, x + i * 34, y + 16);
    ctx.bezierCurveTo(x + i * 34 + 16, y + 8, x + i * 34 + 10, y - 4, x + i * 34, y + 8);
    ctx.fill();
  }
}

export function drawHud(ctx, world) {
  const stage = stageFor(world.distance);
  // Top bar.
  ctx.fillStyle = 'rgba(40, 20, 8, 0.55)';
  roundRect(ctx, 16, 14, 420, 64, 12);
  ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 26px ' + FONT;
  ctx.textAlign = 'left';
  ctx.fillText('SCORE ' + Math.floor(world.score), 32, 42);
  ctx.font = 'bold 15px ' + FONT;
  ctx.fillStyle = '#ffd94d';
  ctx.fillText(stage.name.toUpperCase() + '  ·  ' + Math.floor(world.distance) + ' m / ' + GOAL_DISTANCE + ' m', 32, 64);

  drawHearts(ctx, world.lives, 470, 26);

  // Distance progress: farmhouse door to forest gate.
  const barX = 620;
  const barW = 420;
  ctx.fillStyle = 'rgba(40, 20, 8, 0.55)';
  roundRect(ctx, barX - 10, 18, barW + 20, 52, 12);
  ctx.fill();
  ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
  roundRect(ctx, barX, 34, barW, 12, 6);
  ctx.fill();
  const progress = Math.min(1, world.distance / GOAL_DISTANCE);
  ctx.fillStyle = '#7fae4c';
  roundRect(ctx, barX, 34, barW * progress, 12, 6);
  ctx.fill();
  // Turkey marker and forest gate at the end.
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 13px ' + FONT;
  ctx.textAlign = 'center';
  ctx.fillText('🏠', barX + 6, 30);
  ctx.fillText('🌲', barX + barW - 6, 30);
  ctx.fillStyle = '#f08a1d';
  ctx.beginPath();
  ctx.arc(barX + barW * progress, 40, 8, 0, Math.PI * 2);
  ctx.fill();

  // Farmer proximity: the closer he is, the louder the warning.
  const gap = world.farmer.gap;
  if (gap <= 110 && !world.over) {
    const blink = Math.floor(world.time * 6) % 2 === 0;
    ctx.fillStyle = blink ? '#ff3b30' : '#ffb13d';
    ctx.font = 'bold 22px ' + FONT;
    ctx.textAlign = 'center';
    ctx.fillText('⚠ THE FARMER IS RIGHT BEHIND YOU! ⚠', VIEW.width / 2, 118);
  }

  // Stage banner when a new stage begins.
  if (world.messageTime > 0) {
    ctx.fillStyle = 'rgba(40, 20, 8, 0.6)';
    roundRect(ctx, VIEW.width / 2 - 190, 150, 380, 56, 12);
    ctx.fill();
    ctx.fillStyle = '#ffd94d';
    ctx.font = 'bold 30px ' + DISPLAY_FONT;
    ctx.textAlign = 'center';
    ctx.fillText(world.message, VIEW.width / 2, 190);
  }

  // Controls reminder, small and out of the way.
  ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
  ctx.font = '15px ' + FONT;
  ctx.textAlign = 'right';
  ctx.fillText('Space jump · ↓ slide · P pause · M mute', VIEW.width - 20, VIEW.height - 16);
}

function drawTitle(ctx, world, best) {
  ctx.fillStyle = 'rgba(46, 22, 6, 0.45)';
  ctx.fillRect(0, 0, VIEW.width, VIEW.height);

  ctx.textAlign = 'center';
  ctx.fillStyle = '#ffd94d';
  ctx.font = 'bold 84px ' + DISPLAY_FONT;
  ctx.fillText('GOBBLE RUN', VIEW.width / 2, 150);
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 34px ' + DISPLAY_FONT;
  ctx.fillText('The Great Turkey Escape', VIEW.width / 2, 200);

  ctx.fillStyle = '#fff3d6';
  ctx.font = '19px ' + FONT;
  ctx.fillText('Thanksgiving is coming. The farmer wants you for dinner.', VIEW.width / 2, 246);
  ctx.fillText('Run 1000 m from the farmhouse to the forest gate — and do not get caught.', VIEW.width / 2, 274);

  // A big friendly turkey posing on the title screen.
  ctx.save();
  ctx.translate(VIEW.width / 2 - 130, 330);
  ctx.scale(2.1, 2.1);
  drawTurkey(ctx, { x: 0, y: 0, sliding: false, stumbling: 0, mercy: 0, onGround: true, runTime: 0.6 }, 0.6);
  ctx.restore();

  // How to play, in one glance.
  ctx.fillStyle = 'rgba(40, 20, 8, 0.6)';
  roundRect(ctx, VIEW.width / 2 - 330, 470, 660, 108, 14);
  ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 20px ' + FONT;
  ctx.fillText('HOW TO PLAY', VIEW.width / 2, 500);
  ctx.font = '17px ' + FONT;
  ctx.fillText('SPACE / ↑ / click — jump     ↓ / S — slide under knives', VIEW.width / 2, 528);
  ctx.fillText('Jump fences, hay bales and ovens · grab corn · outrun the farmer', VIEW.width / 2, 554);

  // Start button.
  ctx.fillStyle = '#e0483e';
  roundRect(ctx, VIEW.width / 2 - 130, 600, 260, 56, 28);
  ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 26px ' + DISPLAY_FONT;
  ctx.fillText('▶  START THE RUN', VIEW.width / 2, 637);

  if (best > 0) {
    ctx.fillStyle = '#ffd94d';
    ctx.font = 'bold 18px ' + FONT;
    ctx.fillText('Best score: ' + best, VIEW.width / 2, 688);
  }
}

function drawEnd(ctx, world) {
  ctx.fillStyle = world.escaped ? 'rgba(28, 74, 30, 0.55)' : 'rgba(60, 16, 8, 0.6)';
  ctx.fillRect(0, 0, VIEW.width, VIEW.height);

  ctx.textAlign = 'center';
  if (world.escaped) {
    ctx.fillStyle = '#9be15d';
    ctx.font = 'bold 76px ' + DISPLAY_FONT;
    ctx.fillText('ESCAPED!', VIEW.width / 2, 170);
    ctx.fillStyle = '#fff';
    ctx.font = '26px ' + FONT;
    ctx.fillText('You made it to the forest. No Thanksgiving dinner today!', VIEW.width / 2, 218);
    ctx.fillText('The farmer is still looking for you behind the barn…', VIEW.width / 2, 252);
  } else {
    ctx.fillStyle = '#ff6b5e';
    ctx.font = 'bold 76px ' + DISPLAY_FONT;
    ctx.fillText('CAUGHT!', VIEW.width / 2, 170);
    ctx.fillStyle = '#fff';
    ctx.font = '26px ' + FONT;
    ctx.fillText('The farmer got you. Thanksgiving dinner is served…', VIEW.width / 2, 218);
    ctx.fillText('Next time, jump sooner and keep the farmer behind you.', VIEW.width / 2, 252);
  }

  // Final stats.
  ctx.fillStyle = 'rgba(40, 20, 8, 0.6)';
  roundRect(ctx, VIEW.width / 2 - 260, 300, 520, 130, 14);
  ctx.fill();
  ctx.fillStyle = '#ffd94d';
  ctx.font = 'bold 30px ' + FONT;
  ctx.fillText('SCORE  ' + Math.floor(world.score), VIEW.width / 2, 342);
  ctx.fillStyle = '#fff';
  ctx.font = '21px ' + FONT;
  ctx.fillText(
    'Distance ' + Math.floor(world.distance) + ' m of ' + GOAL_DISTANCE + ' m   ·   ' + stageFor(world.distance).name,
    VIEW.width / 2,
    382,
  );
  ctx.fillText(world.escaped ? 'Escape bonus +2000' : 'Lives left: ' + world.lives, VIEW.width / 2, 410);

  ctx.fillStyle = '#e0483e';
  roundRect(ctx, VIEW.width / 2 - 130, 470, 260, 56, 28);
  ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 26px ' + DISPLAY_FONT;
  ctx.fillText('↻  RUN AGAIN  (R)', VIEW.width / 2, 507);

  ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
  ctx.font = '16px ' + FONT;
  ctx.fillText('Press R or click the button to try again', VIEW.width / 2, 566);
}

export function drawPause(ctx) {
  ctx.fillStyle = 'rgba(20, 10, 4, 0.55)';
  ctx.fillRect(0, 0, VIEW.width, VIEW.height);
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 54px ' + DISPLAY_FONT;
  ctx.textAlign = 'center';
  ctx.fillText('PAUSED', VIEW.width / 2, VIEW.height / 2 - 10);
  ctx.font = '20px ' + FONT;
  ctx.fillText('Press P to keep running', VIEW.width / 2, VIEW.height / 2 + 30);
}

// The one call that paints a whole frame: background, world, HUD, screens.
export function render(ctx, world, screen, time, best) {
  const stage = stageFor(world.distance);
  drawSky(ctx, stage, time);
  for (const prop of world.scenery) drawSceneryProp(ctx, prop, stage);
  drawGround(ctx, stage, time);

  for (const item of world.items) {
    if (item.kind === KIND_FENCE) drawFence(ctx, item);
    else if (item.kind === KIND_HAY) drawHay(ctx, item, time);
    else if (item.kind === KIND_OVEN) drawOven(ctx, item, time);
    else if (item.kind === KIND_KNIFE) drawKnife(ctx, item);
    else if (item.kind === KIND_CORN) drawCorn(ctx, item, time);
    else if (item.kind === KIND_FEATHER) drawFeather(ctx, item, time);
  }

  drawFarmer(ctx, world.farmer, time);
  drawTurkey(ctx, world.turkey, time);

  if (screen === SCREEN_PLAY) drawHud(ctx, world);
  if (screen === SCREEN_TITLE) drawTitle(ctx, world, best);
  if (screen === SCREEN_OVER) drawEnd(ctx, world);
}

export function buttonHit(button, click) {
  return click.x >= button.x && click.x <= button.x + button.width && click.y >= button.y && click.y <= button.y + button.height;
}

export const BUTTONS = {
  start: { x: VIEW.width / 2 - 130, y: 600, width: 260, height: 56 },
  again: { x: VIEW.width / 2 - 130, y: 470, width: 260, height: 56 },
};

export { STAGES };
