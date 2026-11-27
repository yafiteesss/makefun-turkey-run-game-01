// Keyboard and mouse input for Gobble Run.
// Keys: Space / ArrowUp / W jump, ArrowDown / S slide, P pause, M mute,
// R restart, Enter start. Mouse: click a menu button, or click the canvas
// to jump while running. The game reads only this module's state.
export const ACTION = { jump: 'jump', slide: 'slide' };

export function createInput(canvas) {
  const keys = new Set();
  const pressed = new Set();
  const clicks = [];

  function keyName(event) {
    if (event.code === 'Space') return 'jump';
    if (event.code === 'ArrowUp' || event.code === 'KeyW') return 'jump';
    if (event.code === 'ArrowDown' || event.code === 'KeyS') return 'slide';
    if (event.code === 'Enter') return 'confirm';
    if (event.code === 'KeyP') return 'pause';
    if (event.code === 'KeyM') return 'mute';
    if (event.code === 'KeyR') return 'restart';
    return null;
  }

  function onKeyDown(event) {
    const action = keyName(event);
    if (action === null) return;
    if (['jump', 'slide', 'confirm'].includes(action)) event.preventDefault();
    if (!event.repeat) pressed.add(action);
    keys.add(action);
  }

  function onKeyUp(event) {
    const action = keyName(event);
    if (action !== null) keys.delete(action);
  }

  function onPointerDown(event) {
    const rect = canvas.getBoundingClientRect();
    clicks.push({
      x: (event.clientX - rect.left) * (canvas.width / rect.width),
      y: (event.clientY - rect.top) * (canvas.height / rect.height),
    });
  }

  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp);
  canvas.addEventListener('pointerdown', onPointerDown);

  return {
    held(action) {
      return keys.has(action);
    },
    // True once for each fresh key press; the game drains it every frame.
    wasPressed(action) {
      return pressed.has(action);
    },
    // Queue a press from the mouse (a click on the field jumps).
    press(action) {
      pressed.add(action);
      keys.add(action);
    },
    drainPresses() {
      pressed.clear();
    },
    takeClicks() {
      return clicks.splice(0, clicks.length);
    },
  };
}
