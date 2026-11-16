export const DICE = [4, 6, 8, 10, 12, 20, 100];

// Devuelve un entero entre 1 y `sides` (ambos incluidos)
export const rollDie = (sides) => Math.floor(Math.random() * sides) + 1;

// Clasifica el resultado para dar retroalimentación visual
export function getRollType(sides, value) {
  if (sides === 20 && value === 20) return 'crit';
  if (sides === 20 && value === 1) return 'fail';
  return 'normal';
}