'use client';
import { useEffect, useRef } from 'react';
import { geoOrthographic, geoPath, geoGraticule10, GeoProjection, GeoPath } from 'd3-geo';
import * as topojson from 'topojson-client';

interface TopoCountries {
  type: 'Topology';
  objects: { countries: { type: 'GeometryCollection'; geometries: unknown[] } };
}

const ATLAS_URLS = [
  'https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/countries-110m.json',
  'https://unpkg.com/world-atlas@2.0.2/countries-110m.json',
];

const POSITIONS = ['tl', 'tr', 'bl', 'br'] as const;

interface GlobeInst {
  projection: GeoProjection;
  path: GeoPath;
  grat: SVGElement;
  land: SVGElement;
  offsetDeg: number;
  speed: number;
}

export default function CornerGlobes() {
  const refs = useRef<Record<string, SVGSVGElement | null>>({});

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const SVGNS = 'http://www.w3.org/2000/svg';

    function el(tag: string, attrs: Record<string, string | number> = {}, parent?: SVGElement | null) {
      const n = document.createElementNS(SVGNS, tag);
      for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, String(v));
      if (parent) parent.appendChild(n);
      return n as SVGElement;
    }

    const globes: GlobeInst[] = [];

    POSITIONS.forEach((pos, i) => {
      const svg = refs.current[pos];
      if (!svg) return;
      svg.innerHTML = '';

      const defs = el('defs', {}, svg);
      const grad = el('radialGradient', { id: `cgGrad-${pos}`, cx: '40%', cy: '35%', r: '75%' }, defs);
      el('stop', { offset: '0%', 'stop-color': 'var(--color-accent)', 'stop-opacity': '0.8' }, grad);
      el('stop', { offset: '100%', 'stop-color': 'var(--color-accent-2)', 'stop-opacity': '0.9' }, grad);

      const r = 28;
      // disc behind
      el('circle', {
        cx: 0, cy: 0, r: 36,
        fill: 'var(--color-surface)',
        'fill-opacity': '0.5',
        stroke: 'var(--color-accent)',
        'stroke-width': '0.4',
        'stroke-opacity': '0.4',
      }, svg);

      const projection = geoOrthographic()
        .scale(r)
        .translate([0, 0])
        .clipAngle(90)
        .rotate([i * 90, -18, 0]);
      const path = geoPath(projection as never);

      // sphere fill
      el('circle', { cx: 0, cy: 0, r, fill: 'var(--color-bg)', 'fill-opacity': '0.7' }, svg);
      el('circle', {
        cx: 0, cy: 0, r,
        fill: 'none',
        stroke: 'var(--color-accent)',
        'stroke-width': '0.4',
        'stroke-opacity': '0.6',
      }, svg);

      const grat = el('path', {
        d: '',
        fill: 'none',
        stroke: 'var(--color-accent)',
        'stroke-opacity': '0.2',
        'stroke-width': '0.3',
      }, svg);
      const land = el('path', {
        d: '',
        fill: `url(#cgGrad-${pos})`,
        stroke: 'var(--color-accent-2)',
        'stroke-width': '0.25',
        'stroke-opacity': '0.8',
      }, svg);

      // bezel
      el('circle', {
        cx: 0, cy: 0, r: r + 6,
        fill: 'none',
        stroke: 'var(--color-accent)',
        'stroke-width': '2',
        'stroke-opacity': '0.4',
      }, svg);

      globes.push({
        projection,
        path,
        grat,
        land,
        offsetDeg: i * 90,
        speed: 0.8 + i * 0.15,
      });
    });

    const graticule = geoGraticule10();
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

    const ROT = 16000;
    const start = performance.now();

    function frame(now: number) {
      if (cancelled) return;
      const dt = (now - start);
      globes.forEach((g) => {
        const lambda = ((dt / ROT) * 360 * g.speed + g.offsetDeg) % 360 - 180;
        g.projection.rotate([lambda, -18, 0]);
        g.grat.setAttribute('d', g.path(graticule) ?? '');
        if (countriesFeature) {
          g.land.setAttribute('d', g.path(countriesFeature as never) ?? '');
        }
      });
      if (!reduced) {
        rafId = requestAnimationFrame(frame);
      }
    }

    if (reduced) {
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
    <>
      {POSITIONS.map((pos) => (
        <svg
          key={pos}
          ref={(node) => {
            refs.current[pos] = node;
          }}
          className={`corner-globe pos-${pos}`}
          viewBox="-50 -50 100 100"
          aria-hidden="true"
        />
      ))}
    </>
  );
}
