/**
 * Morphing-ribbon geometry from reference HTML.
 * 6 closed-curve shapes (pill / lemniscate / asymLoop) interpolated continuously
 * with easeInOut. One full shape transition = RIBBON_PERIOD (9000 ms by default).
 * Used by GlobeLoader + CornerGlobes.
 */

type Pt = [number, number];

function rotatePt(p: Pt, ang: number): Pt {
  const c = Math.cos(ang);
  const s = Math.sin(ang);
  return [p[0] * c - p[1] * s, p[0] * s + p[1] * c];
}

function pill(theta: number, rx: number, ry: number, rot: number): Pt {
  return rotatePt([Math.cos(theta) * rx, Math.sin(theta) * ry], rot);
}

function lemniscate(theta: number, scale: number, rot: number): Pt {
  const ct = Math.cos(theta);
  const st = Math.sin(theta);
  const denom = 1 + st * st;
  return rotatePt([(scale * ct) / denom, ((scale * st * ct) / denom) * 1.4], rot);
}

function asymLoop(theta: number, scale: number, rot: number): Pt {
  const ct = Math.cos(theta);
  const st = Math.sin(theta);
  const x = ct * scale * (1 + 0.18 * Math.cos(theta));
  const y = st * scale * 0.55 * (1 - 0.25 * Math.sin(theta));
  return rotatePt([x, y], rot);
}

export type ShapeFn = (theta: number) => Pt;

export const RIBBON_SHAPES: ShapeFn[] = [
  (th) => pill(th, 22, 52, 0.05),
  (th) => pill(th, 52, 22, -0.45),
  (th) => lemniscate(th, 78, -0.55),
  (th) => asymLoop(th, 58, 0.6),
  (th) => pill(th, 36, 50, -1.1),
  (th) => lemniscate(th, 72, 0.9),
];

/**
 * Build SVG path string interpolating between two consecutive shapes.
 * tNorm = 0..1 cycle position across all shapes (loops).
 * scale multiplies all coordinates (CornerGlobes uses 0.30).
 */
export function buildRibbonPath(tNorm: number, scale = 1): string {
  const N = 200;
  let tn = tNorm - Math.floor(tNorm);
  if (!isFinite(tn) || tn < 0) tn = 0;
  const pos = tn * RIBBON_SHAPES.length;
  const i = ((Math.floor(pos) % RIBBON_SHAPES.length) + RIBBON_SHAPES.length) % RIBBON_SHAPES.length;
  const j = (i + 1) % RIBBON_SHAPES.length;
  const fi = RIBBON_SHAPES[i];
  const fj = RIBBON_SHAPES[j];
  let a = pos - Math.floor(pos);
  // easeInOut
  a = a < 0.5 ? 2 * a * a : 1 - Math.pow(-2 * a + 2, 2) / 2;
  let d = '';
  for (let k = 0; k <= N; k++) {
    const theta = (k / N) * Math.PI * 2;
    const p1 = fi(theta);
    const p2 = fj(theta);
    const x = (p1[0] * (1 - a) + p2[0] * a) * scale;
    const y = (p1[1] * (1 - a) + p2[1] * a) * scale;
    d += (k === 0 ? 'M' : 'L') + x.toFixed(2) + ',' + y.toFixed(2);
  }
  return d + 'Z';
}

export const RIBBON_PERIOD_MS = 9000;
export const RIBBON_ROTATION_PERIOD_MS = 11000;
