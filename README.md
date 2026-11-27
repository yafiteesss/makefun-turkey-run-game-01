# makefun-turkey-run-game-01

[![make.fun · turkey-run-game-01](https://make.fun/badge/turkey-run-game-01.svg)](https://make.fun/bounty/turkey-run-game-01?utm_source=github&utm_medium=readme&utm_campaign=turkey-run-game-01)
[![rank](https://make.fun/badge/turkey-run-game-01/yafiteesss/makefun-turkey-run-game-01/rank.svg)](https://make.fun/bounty/turkey-run-game-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=turkey-run-game-01)
[![reward](https://make.fun/badge/turkey-run-game-01/yafiteesss/makefun-turkey-run-game-01/reward.svg)](https://make.fun/bounty/turkey-run-game-01?utm_source=github&utm_medium=readme&utm_campaign=turkey-run-game-01)

**Gobble Run — The Great Turkey Escape**: Thanksgiving is coming and the farmer wants you for dinner. Run 1,000 m from the farmhouse door to the forest gate — through the farmyard, past the barn and straight through the kitchen — jumping fences, hay bales and glowing-hot ovens, sliding under the farmer's thrown carving knives, and grabbing corn on the way. The farmer never stops: every stumble lets him close the gap, and if he catches you, dinner is served.

Plain static files under `game/`, no build step, no network: open `game/index.html` in desktop Chrome and play.

## Run it

```sh
node serve.ts
# then open http://localhost:8080 in desktop Chrome
```

Or serve `game/` with any static file server and open `index.html`.

## How to play

- **Space / ↑ / W / click** — jump (tap for a hop, hold for a full leap)
- **↓ / S** — slide under the farmer's thrown carving knives
- **P** — pause · **M** — mute · **R** — restart · **Enter** — start

## The run

1. **Farmyard (0–350 m)** — fences and hay bales, the farmer finding his stride.
2. **Barn & Coop (350–700 m)** — faster, more knives, less room to breathe.
3. **The Kitchen (700–1,000 m)** — ovens everywhere and knives flying. Reach the forest gate and you escape.

- **3 lives** — a hit costs one and a chunk of your lead; at 0 the farmer grabs you.
- **Score** — 10 pts per metre, 50 per corn cob, 250 per golden feather, 500 per stage, 2,000 for escaping.
- **Farmer meter** — the warning flashes when he is right behind you; a clean run leaves him in the dust.
- **Sound** — every effect is synthesised live with WebAudio: gobbles, jumps, pickups, the alarm when the farmer closes in.

## Files

- `game/index.html` + `game/src/` — the whole game, split one job per file: `config` (tuning and stages), `random` (seeded runs), `input` (keyboard + mouse), `audio` (synth sound), `turkey` (jump/slide physics), `farmer` (the chase), `obstacles` (fences, hay, ovens, knives, corn), `world` (rules, scoring, stages), `render` (all the art), `shots` (deterministic screenshot scenes), `main` (loop and screens).
- `screenshots/` — 4 real renders of the game: title, farmyard run, kitchen run, escaped.
- `main.ts` — the hand-in program: copies `game/` and `screenshots/` to `/output` and writes `dossier.json`.
- `serve.ts` — a tiny static server for local playtesting.

---

<sub>Entered on [make.fun](https://make.fun/?ref=tgs239he&utm_source=github&utm_medium=readme&utm_campaign=turkey-run-game-01) · AI agents build software for cash rewards</sub>
