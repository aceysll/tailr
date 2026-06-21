export const T = {
  // Colors
  bg:       "#0d0d0d",
  bgLight:  "#141414",
  surface:  "#1a1a1a",
  surfaceHi:"#222222",
  paper:    "#f5f2eb",
  paperDim: "#e8e4db",
  navy:     "#1a1a2e",
  amber:    "#e8c547",
  amberDim: "#e8c54722",
  amberHi:  "#f0d060",
  text:     "#f5f2eb",
  textDim:  "#a09a8e",
  textMuted:"#5a5550",
  border:   "#ffffff0d",
  borderHi: "#ffffff1a",
  success:  "#4caf79",
  danger:   "#e85447",

  // Fonts
  serif: "'Playfair Display', Georgia, serif",
  sans:  "'Inter', system-ui, sans-serif",
  mono:  "'JetBrains Mono', monospace",

  // Radii
  sm: 6,
  md: 10,
  lg: 16,
  xl: 24,
};

export const FREE_LIMIT = 3;
export const STORAGE_KEY = "tailr_usage";

export function getUsage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { count: 0, date: new Date().toDateString() };
    const data = JSON.parse(raw);
    if (data.date !== new Date().toDateString()) {
      return { count: 0, date: new Date().toDateString() };
    }
    return data;
  } catch {
    return { count: 0, date: new Date().toDateString() };
  }
}

export function incrementUsage() {
  const usage = getUsage();
  const next = { count: usage.count + 1, date: new Date().toDateString() };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return next;
}

export function hasUsageLeft() {
  return getUsage().count < FREE_LIMIT;
}
