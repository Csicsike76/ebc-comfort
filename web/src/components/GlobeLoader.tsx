'use client';
import { useEffect, useRef } from 'react';
import { geoOrthographic, geoPath, geoGraticule10 } from 'd3-geo';
import * as topojson from 'topojson-client';

interface TopoCountries {
  type: 'Topology';
  objects: { countries: { type: 'GeometryCollection'; geometries: unknown[] } };
}

const ATLAS_URLS = [
  'https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/countries-110m.json',
  'https://unpkg.com/world-atlas@2.0.2/countries-110m.json',
];

const R_DISC = 78;
const R_GLOBE = 64;
const R_BEZEL_OUT = 86;
const R_BEZEL_IN = 74;

export default function GlobeLoader() {
  const backRef = useRef<SVGSVGElement>(null);
  const discRef = useRef<SVGSVGElement>(null);
  const frontRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const back = backRef.current;
    const disc = discRef.current;
    const front = frontRef.current;
    if (!back || !disc || !front) return;

    // Clear any previous render
    back.innerHTML = '';
    disc.innerHTML = '';
    front.innerHTML = '';

    const SVGNS = 'http://www.w3.org/2000/svg';
    function el(tag: string, attrs: Record<string, string | number> = {}, parent?: SVGElement | null): SVGElement {
      const n = document.createElementNS(SVGNS, tag);
      for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, String(v));
      if (parent) parent.appendChild(n);
      return n as SVGElement;
    }

    // ===== Defs (on disc SVG) =====
    const defs = el('defs', {}, disc);

    const accentRad = el('radialGradient', { id: 'ebcAccentRad', cx: '40%', cy: '35%', r: '75%' }, defs);
    el('stop', { offset: '0%', 'stop-color': 'var(--color-accent)', 'stop-opacity': '0.85' }, accentRad);
    el('stop', { offset: '60%', 'stop-color': 'var(--color-accent)', 'stop-opacity': '0.7' }, accentRad);
    el('stop', { offset: '100%', 'stop-color': 'var(--color-accent-2)', 'stop-opacity': '0.85' }, accentRad);

    const clipDisc = el('clipPath', { id: 'ebcClipDisc' }, defs);
    el('circle', { cx: 0, cy: 0, r: R_DISC }, clipDisc);

    const specGrad = el('radialGradient', { id: 'ebcSpec', cx: '35%', cy: '28%', r: '50%' }, defs);
    el('stop', { offset: '0%', 'stop-color': '#fff', 'stop-opacity': '0.3' }, specGrad);
    el('stop', { offset: '70%', 'stop-color': '#fff', 'stop-opacity': '0' }, specGrad);

    // ===== Disc + globe content =====
    const discGroup = el('g', { 'clip-path': 'url(#ebcClipDisc)' }, disc);
    el('circle', { cx: 0, cy: 0, r: R_DISC, fill: 'var(--color-surface)', 'fill-opacity': '0.35' }, discGroup);

    // Globe sphere
    const globeG = el('g', {}, discGroup);
    el('circle', { cx: 0, cy: 0, r: R_GLOBE, fill: 'var(--color-bg)', 'fill-opacity': '0.55' }, globeG);
    el('circle', {
      cx: 0, cy: 0, r: R_GLOBE,
      fill: 'none',
      stroke: 'var(--color-accent)',
      'stroke-width': '0.6',
      'stroke-opacity': '0.6',
    }, globeG);

    const projection = geoOrthographic()
      .scale(R_GLOBE)
      .translate([0, 0])
      .clipAngle(90)
      .rotate([0, -18, 0]);
    const path = geoPath(projection as never);
    const graticule = geoGraticule10();

    const gratNode = el('path', {
      d: path(graticule) ?? '',
      fill: 'none',
      stroke: 'var(--color-accent)',
      'stroke-opacity': '0.18',
      'stroke-width': '0.4',
    }, globeG);
    const landNode = el('path', {
      d: '',
      fill: 'url(#ebcAccentRad)',
      stroke: 'var(--color-accent-2)',
      'stroke-width': '0.3',
      'stroke-opacity': '0.9',
      'stroke-linejoin': 'round',
    }, globeG);

    // Specular highlight
    el('circle', { cx: 0, cy: 0, r: R_GLOBE, fill: 'url(#ebcSpec)' }, globeG);

    // ===== Bezel ring (front) =====
    const bezelG = el('g', {}, front);
    el('circle', {
      cx: 0, cy: 0,
      r: (R_BEZEL_OUT + R_BEZEL_IN) / 2,
      fill: 'none',
      stroke: 'var(--color-accent)',
      'stroke-width': R_BEZEL_OUT - R_BEZEL_IN,
      'stroke-opacity': '0.55',
    }, bezelG);
    el('circle', {
      cx: 0, cy: 0, r: R_BEZEL_IN,
      fill: 'none',
      stroke: 'var(--color-accent-2)',
      'stroke-width': '0.6',
      'stroke-opacity': '0.5',
    }, bezelG);
    el('circle', {
      cx: 0, cy: 0, r: R_BEZEL_OUT,
      fill: 'none',
      stroke: 'var(--color-accent-2)',
      'stroke-width': '0.6',
      'stroke-opacity': '0.5',
    }, bezelG);

    // ===== Orbit ellipses (back + front) =====
    const orbits = [
      { rx: 96, ry: 22, tilt: -18, dash: '5 8', width: 0.9, opacity: 0.5, speed: 1.0 },
      { rx: 104, ry: 30, tilt: -18, dash: '2 6', width: 0.8, opacity: 0.32, speed: -0.6 },
      { rx: 90, ry: 14, tilt: -18, dash: '1 6', width: 0.7, opacity: 0.4, speed: 1.5 },
    ];
    const orbitGroups: { node: SVGElement; speed: number }[] = [];
    orbits.forEach((o) => {
      const gB = el('g', { transform: `rotate(${o.tilt})` }, back);
      el('ellipse', {
        cx: 0, cy: 0, rx: o.rx, ry: o.ry,
        fill: 'none',
        stroke: 'var(--color-accent)',
        'stroke-width': o.width,
        'stroke-opacity': o.opacity * 0.5,
        'stroke-dasharray': o.dash,
      }, gB);
      const gF = el('g', { transform: `rotate(${o.tilt})` }, front);
      el('ellipse', {
        cx: 0, cy: 0, rx: o.rx, ry: o.ry,
        fill: 'none',
        stroke: 'var(--color-accent)',
        'stroke-width': o.width,
        'stroke-opacity': o.opacity,
        'stroke-dasharray': o.dash,
      }, gF);
      orbitGroups.push({ node: gF, speed: o.speed });
    });

    // ===== Topojson fetch + animation loop =====
    let cancelled = false;
    let rafId = 0;
    let countriesFeature: unknown = null;

    (async () => {
      for (const url of ATLAS_URLS) {
        if (cancelled) return;
        try {
          const res = await fetch(url);
          if (!res.ok) continue;
          const world = (await res.json()) as TopoCountries;
          countriesFeature = topojson.feature(
            world as never,
            world.objects.countries as never
          );
          break;
        } catch {
          /* try next */
        }
      }
    })();

    const ROT = 14000;
    const start = performance.now();

    function frame(now: number) {
      if (cancelled) return;
      const dt = (now - start) % ROT;
      const lambda = (dt / ROT) * 360 - 180;
      projection.rotate([lambda, -18, 0]);

      gratNode.setAttribute('d', path(graticule) ?? '');
      if (countriesFeature) {
        landNode.setAttribute('d', path(countriesFeature as never) ?? '');
      }

      orbitGroups.forEach((og) => {
        const angle = (dt / ROT) * 360 * og.speed;
        og.node.setAttribute('transform', `rotate(${og.speed > 0 ? -18 + angle : -18 + angle})`);
      });

      if (!reduced) {
        rafId = requestAnimationFrame(frame);
      }
    }

    if (reduced) {
      // single static frame
      frame(start);
    } else {
      rafId = requestAnimationFrame(frame);
    }

    return () => {
      cancelled = true;
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div className="bg-loader" aria-hidden="true">
      <div className="bg-loader-inner">
        <svg ref={backRef} viewBox="-100 -100 200 200" />
        <svg ref={discRef} viewBox="-100 -100 200 200" />
        <svg ref={frontRef} viewBox="-100 -100 200 200" />
      </div>
    </div>
  );
}
