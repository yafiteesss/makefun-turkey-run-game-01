// Gobble Run — tuning, stages and world constants.
// One place for every number the rest of the game balances on, so a stage
// can be retuned here without touching the turkey, the farmer or the renderer.
export const VIEW = { width: 1280, height: 720 };
export const GROUND_Y = 600;
export const GRAVITY = 3400;
export const TURKEY_X = 230;

// The run is 1000 metres from the farmhouse door to the forest gate.
export const GOAL_DISTANCE = 1000;
export const METRES_PER_PIXEL = 0.05;

export const TURKEY = {
  width: 64,
  height: 58,
  slideHeight: 34,
  jumpVelocity: -1050,
  // A short hop when the key is tapped, a full jump when it is held.
  hopVelocity: -700,
  maxFall: 1200,
};

export const FARMER = {
  width: 72,
  height: 96,
  // How far behind the turkey the farmer starts, in pixels.
  startGap: 210,
  // The farmer closes this many pixels a second while the turkey stumbles,
  // and loses ground this fast while the turkey runs clean.
  chaseRate: 110,
  fallBehindRate: 26,
  // Below this gap the HUD flashes its warning and the music turns urgent.
  closeGap: 110,
};

// Three stages of the escape, each harder and drawn in its own palette.
export const STAGES = [
  {
    name: 'Farmyard',
    from: 0,
    to: 350,
    sky: ['#ffd98a', '#ffb35c'],
    ground: '#c98f4e',
    grass: '#7fae4c',
    speed: 330,
    spawnEvery: 300,
    knifeChance: 0.16,
    accent: '#b4552d',
  },
  {
    name: 'Barn & Coop',
    from: 350,
    to: 700,
    sky: ['#f7b267', '#e07a4f'],
    ground: '#a9713d',
    grass: '#8a9a3b',
    speed: 400,
    spawnEvery: 280,
    knifeChance: 0.24,
    accent: '#8c3b2e',
  },
  {
    name: 'The Kitchen',
    from: 700,
    to: 1000,
    sky: ['#e88a5a', '#c65a44'],
    ground: '#7d5a3a',
    grass: '#6f7f33',
    speed: 470,
    spawnEvery: 270,
    knifeChance: 0.34,
    accent: '#5e2b25',
  },
];

export const SCORE = {
  perMetre: 10,
  corn: 50,
  goldenFeather: 250,
  stageBonus: 500,
  escapeBonus: 2000,
};

export const LIVES_START = 3;
// Seconds of mercy after a hit: the turkey flashes and cannot be hurt again.
export const MERCY_SECONDS = 1.6;
// How long a stumble lasts after hitting an obstacle.
export const STUMBLE_SECONDS = 0.55;
