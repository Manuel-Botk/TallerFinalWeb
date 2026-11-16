export const rand = (min, max) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

// Mezcla Fisher-Yates y toma n elementos
export function pick(arr, n) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, n);
}

// Monedas: cobre (cp), plata (sp), oro (gp), platino (pp)
export function generateCoins(cr) {
  if (cr <= 4)
    return { cp: rand(0, 100), sp: rand(0, 50), gp: rand(0, 30), pp: 0 };
  if (cr <= 10)
    return { cp: 0, sp: rand(0, 100), gp: rand(50, 300), pp: rand(0, 30) };
  if (cr <= 16)
    return { cp: 0, sp: 0, gp: rand(500, 2000), pp: rand(10, 200) };
  return { cp: 0, sp: 0, gp: rand(2000, 10000), pp: rand(100, 1000) };
}

// Cuántos objetos salen según el CR
export function getItemCounts(cr) {
  if (cr <= 4) return { equipment: rand(1, 3), magic: 0 };
  if (cr <= 10) return { equipment: rand(2, 4), magic: rand(0, 1) };
  if (cr <= 16) return { equipment: rand(2, 4), magic: rand(1, 2) };
  return { equipment: rand(3, 5), magic: rand(1, 3) };
}