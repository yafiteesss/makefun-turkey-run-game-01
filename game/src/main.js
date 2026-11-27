// Gobble Run: bootstrap, the frame loop and the screen state machine.
// Title -> playing -> caught/escaped -> title again. The world does the
// rules, the renderer does the pixels, this file only wires them together
// and answers the keyboard and the mouse.
import { VIEW } from './config.js';
import { createInput } from './input.js';
import { createAudio } from './audio.js';
import { createWorld, resetWorld, stepWorld } from './world.js';
import { BUTTONS, SCREEN_OVER, SCREEN_PLAY, SCREEN_TITLE, buttonHit, render, drawPause } from './render.js';
import { stageShot } from './shots.js';

const canvas = document.getElementById('game');
const statusLine = document.getElementById('status');
const ctx = canvas.getContext('2d');

const params = new URLSearchParams(window.location.search);
const shotName = params.get('shot');
const seed = Number(params.get('seed') || '7') || 7;

const input = createInput(canvas);
const audio = createAudio();
const world = createWorld(seed);

let screen = SCREEN_TITLE;
let best = 0;
let paused = false;
let lastTime = performance.now();
let shotStaged = false;

function resizeCanvas() {
  const scale = Math.min(window.innerWidth / VIEW.width, window.innerHeight / VIEW.height);
  canvas.width = VIEW.width;
  canvas.height = VIEW.height;
  canvas.style.width = Math.floor(VIEW.width * scale) + 'px';
  canvas.style.height = Math.floor(VIEW.height * scale) + 'px';
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

function startRun() {
  audio.unlock();
  resetWorld(world, (seed + Math.floor(Math.random() * 1000)) % 100000);
  screen = SCREEN_PLAY;
  paused = false;
  audio.gobble();
  announce('Run started. Jump the fences, slide under the knives, outrun the farmer.');
}

function backToTitle() {
  screen = SCREEN_TITLE;
  paused = false;
  resetWorld(world, seed);
  announce('Title screen. Press Enter or click Start to run.');
}

function announce(text) {
  if (statusLine) statusLine.textContent = text;
}

function handleClicks() {
  for (const click of input.takeClicks()) {
    audio.unlock();
    if (screen === SCREEN_TITLE) {
      if (buttonHit(BUTTONS.start, click)) startRun();
      continue;
    }
    if (screen === SCREEN_OVER) {
      if (buttonHit(BUTTONS.again, click)) startRun();
      continue;
    }
    if (screen === SCREEN_PLAY && !paused) {
      // A click on the field is a jump, like a tap.
      input.press('jump');
    }
  }
}

function frame(now) {
  const dt = Math.min(0.05, (now - lastTime) / 1000);
  lastTime = now;

  if (shotName !== null && !shotStaged) {
    // A staged screenshot: play the real game forward once, then hold the frame.
    const staged = stageShot(shotName, world, seed);
    screen = staged.screen;
    best = staged.best;
    shotStaged = true;
  }

  if (input.wasPressed('mute')) {
    audio.setMuted(!audio.isMuted());
    announce(audio.isMuted() ? 'Sound off.' : 'Sound on.');
  }

  if (screen === SCREEN_TITLE) {
    if (input.wasPressed('confirm') || input.wasPressed('jump')) startRun();
  } else if (screen === SCREEN_OVER) {
    if (input.wasPressed('restart') || input.wasPressed('confirm')) startRun();
  } else if (screen === SCREEN_PLAY) {
    if (input.wasPressed('pause')) {
      paused = !paused;
      announce(paused ? 'Paused.' : 'Running.');
    }
    if (input.wasPressed('restart')) {
      startRun();
    } else if (!paused && shotName === null) {
      // In screenshot mode the staged frame is held still: the autopilot
      // already played it, and a live run would drift away from it.
      const events = stepWorld(world, input, dt, audio);
      if (events & 8) {
        screen = SCREEN_OVER;
        const score = Math.floor(world.score);
        if (score > best) best = score;
        announce(
          world.escaped
            ? 'Escaped! Score ' + score + '. Press R to run again.'
            : 'Caught! Score ' + score + '. Press R to run again.',
        );
      }
    }
  }

  handleClicks();
  input.drainPresses();

  // The turkey keeps idling on the title screen so it never looks frozen.
  const time = now / 1000;
  if (screen === SCREEN_TITLE && !shotStaged) world.turkey.runTime += dt;

  render(ctx, world, screen, time, best);
  if (paused && screen === SCREEN_PLAY) drawPause(ctx);
  requestAnimationFrame(frame);
}

announce('Gobble Run. Press Enter or click Start to run from the farmer.');
requestAnimationFrame(frame);
