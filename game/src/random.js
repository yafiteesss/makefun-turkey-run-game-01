// A tiny seeded random generator, so a screenshot seed always stages the
// same farm and a playtest can replay the same run by number.
export function makeRandom(seed) {
  let state = (seed >>> 0) || 1;
  return {
    next() {
      // xorshift32: cheap, deterministic, good enough for spawning.
      state ^= state << 13;
      state ^= state >>> 17;
      state ^= state << 5;
      state >>>= 0;
      return state / 4294967296;
    },
    range(min, max) {
      return min + this.next() * (max - min);
    },
    pick(list) {
      return list[Math.floor(this.next() * list.length)];
    },
  };
}
