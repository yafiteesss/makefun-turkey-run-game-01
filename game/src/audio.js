// Synthesised sound for Gobble Run: no audio files, every effect is built
// from WebAudio oscillators, so the game stays a handful of static files.
// The first user gesture unlocks the context; until then calls are no-ops.
export function createAudio() {
  let context = null;
  let master = null;
  let muted = false;
  let urgent = false;

  function ensure() {
    if (context !== null) return true;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return false;
      context = new AudioContext();
      master = context.createGain();
      master.gain.value = 0.35;
      master.connect(context.destination);
    } catch {
      return false;
    }
    return true;
  }

  function tone({ frequency, to, duration, type = 'sine', volume = 0.5, delay = 0 }) {
    if (!ensure() || muted || context.state === 'suspended') return;
    const start = context.currentTime + delay;
    const osc = context.createOscillator();
    const gain = context.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(frequency, start);
    if (to !== undefined) osc.frequency.exponentialRampToValueAtTime(Math.max(1, to), start + duration);
    gain.gain.setValueAtTime(0, start);
    gain.gain.linearRampToValueAtTime(volume, start + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.001, start + duration);
    osc.connect(gain);
    gain.connect(master);
    osc.start(start);
    osc.stop(start + duration + 0.05);
  }

  function noise({ duration, volume = 0.4, delay = 0, low = 400 }) {
    if (!ensure() || muted || context.state === 'suspended') return;
    const start = context.currentTime + delay;
    const length = Math.max(1, Math.floor(context.sampleRate * duration));
    const buffer = context.createBuffer(1, length, context.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i += 1) data[i] = (Math.random() * 2 - 1) * (1 - i / length);
    const source = context.createBufferSource();
    source.buffer = buffer;
    const filter = context.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = low;
    const gain = context.createGain();
    gain.gain.value = volume;
    source.connect(filter);
    filter.connect(gain);
    gain.connect(master);
    source.start(start);
  }

  return {
    unlock() {
      if (ensure() && context.state === 'suspended') context.resume().catch(() => {});
    },
    setMuted(value) {
      muted = value;
    },
    isMuted() {
      return muted;
    },
    setUrgent(value) {
      urgent = value;
    },
    jump() {
      tone({ frequency: 300, to: 640, duration: 0.16, type: 'triangle', volume: 0.35 });
    },
    slide() {
      noise({ duration: 0.18, volume: 0.25, low: 900 });
    },
    pickup() {
      tone({ frequency: 880, duration: 0.09, type: 'sine', volume: 0.4 });
      tone({ frequency: 1318, duration: 0.12, type: 'sine', volume: 0.35, delay: 0.07 });
    },
    feather() {
      [523, 659, 784, 1046].forEach((f, i) =>
        tone({ frequency: f, duration: 0.14, type: 'triangle', volume: 0.35, delay: i * 0.07 }),
      );
    },
    // The turkey's own voice: a short two-note gobble.
    gobble() {
      tone({ frequency: 420, to: 180, duration: 0.12, type: 'sawtooth', volume: 0.22 });
      tone({ frequency: 360, to: 150, duration: 0.14, type: 'sawtooth', volume: 0.22, delay: 0.13 });
    },
    hit() {
      noise({ duration: 0.25, volume: 0.5, low: 700 });
      tone({ frequency: 160, to: 70, duration: 0.3, type: 'square', volume: 0.3 });
    },
    knife() {
      noise({ duration: 0.12, volume: 0.2, low: 3200 });
    },
    alarm() {
      if (!urgent) return;
      tone({ frequency: 980, duration: 0.1, type: 'square', volume: 0.12 });
      tone({ frequency: 740, duration: 0.1, type: 'square', volume: 0.12, delay: 0.12 });
    },
    caught() {
      [392, 330, 262, 196].forEach((f, i) =>
        tone({ frequency: f, duration: 0.28, type: 'triangle', volume: 0.4, delay: i * 0.22 }),
      );
    },
    escaped() {
      [523, 659, 784, 1046, 1318].forEach((f, i) =>
        tone({ frequency: f, duration: 0.22, type: 'triangle', volume: 0.4, delay: i * 0.11 }),
      );
    },
    stage() {
      tone({ frequency: 660, duration: 0.1, type: 'triangle', volume: 0.3 });
      tone({ frequency: 990, duration: 0.16, type: 'triangle', volume: 0.3, delay: 0.09 });
    },
  };
}
