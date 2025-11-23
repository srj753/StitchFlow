export type HSV = {
  h: number; // 0-360
  s: number; // 0-1
  v: number; // 0-1
};

export type RGB = {
  r: number; // 0-255
  g: number;
  b: number;
};

export const clamp = (value: number, min = 0, max = 1) => {
  if (Number.isNaN(value)) return min;
  return Math.min(max, Math.max(min, value));
};

export const hsvToRgb = ({ h, s, v }: HSV): RGB => {
  const c = v * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = v - c;
  let rPrime = 0;
  let gPrime = 0;
  let bPrime = 0;

  if (h >= 0 && h < 60) {
    rPrime = c;
    gPrime = x;
  } else if (h >= 60 && h < 120) {
    rPrime = x;
    gPrime = c;
  } else if (h >= 120 && h < 180) {
    gPrime = c;
    bPrime = x;
  } else if (h >= 180 && h < 240) {
    gPrime = x;
    bPrime = c;
  } else if (h >= 240 && h < 300) {
    rPrime = x;
    bPrime = c;
  } else {
    rPrime = c;
    bPrime = x;
  }

  return {
    r: Math.round((rPrime + m) * 255),
    g: Math.round((gPrime + m) * 255),
    b: Math.round((bPrime + m) * 255),
  };
};

const valueClamp = (value: number, min: number, max: number) => {
  if (Number.isNaN(value)) return min;
  return Math.min(max, Math.max(min, value));
};

const componentToHex = (value: number) =>
  valueClamp(Math.round(value), 0, 255).toString(16).padStart(2, '0');

export const rgbToHex = ({ r, g, b }: RGB) => `#${componentToHex(r)}${componentToHex(g)}${componentToHex(b)}`;

export const hsvToHex = (hsv: HSV) => rgbToHex(hsvToRgb(hsv));

export const hexToRgb = (hex: string): RGB => {
  const normalized = normalizeHex(hex);
  const value = normalized.replace('#', '');
  const chunkLength = value.length === 3 ? 1 : 2;
  const expand = (chunk: string) => chunk.length === 1 ? `${chunk}${chunk}` : chunk;
  const r = parseInt(expand(value.slice(0, chunkLength)), 16);
  const g = parseInt(expand(value.slice(chunkLength, chunkLength * 2)), 16);
  const b = parseInt(expand(value.slice(chunkLength * 2)), 16);
  return {
    r: Number.isNaN(r) ? 255 : r,
    g: Number.isNaN(g) ? 255 : g,
    b: Number.isNaN(b) ? 255 : b,
  };
};

export const rgbToHsv = ({ r, g, b }: RGB): HSV => {
  const rNorm = r / 255;
  const gNorm = g / 255;
  const bNorm = b / 255;

  const max = Math.max(rNorm, gNorm, bNorm);
  const min = Math.min(rNorm, gNorm, bNorm);
  const delta = max - min;

  let h = 0;
  if (delta !== 0) {
    if (max === rNorm) {
      h = 60 * (((gNorm - bNorm) / delta) % 6);
    } else if (max === gNorm) {
      h = 60 * ((bNorm - rNorm) / delta + 2);
    } else {
      h = 60 * ((rNorm - gNorm) / delta + 4);
    }
  }
  if (h < 0) h += 360;

  const s = max === 0 ? 0 : delta / max;
  const v = max;

  return { h, s, v };
};

export const hexToHsv = (hex: string): HSV => rgbToHsv(hexToRgb(hex));

export const normalizeHex = (hex: string, fallback = '#ffffff') => {
  if (!hex) return fallback;
  const normalized = hex.trim().toLowerCase();
  if (normalized.startsWith('#')) {
    if ([4, 7].includes(normalized.length)) return normalized;
    if (normalized.length === 5) {
      return `#${normalized.slice(1, 4)}`;
    }
  }
  if (/^[0-9a-f]{6}$/i.test(normalized)) return `#${normalized}`;
  if (/^[0-9a-f]{3}$/i.test(normalized)) return `#${normalized}`;
  return fallback;
};

export const ensureContrastingText = (hex: string) => {
  const { r, g, b } = hexToRgb(hex);
  // Perceived luminance formula
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.6 ? '#1a1a1a' : '#ffffff';
};


