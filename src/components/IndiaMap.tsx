import { useEffect, useMemo, useRef, useState } from 'react';
import maplibregl, { type Map as MapLibreMap, type MapGeoJSONFeature } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import type { StateRecord, StatesGeoJSON } from '../data';
import type { Metric } from '../lib/metrics';

type Props = {
  states: StateRecord[];
  geo: StatesGeoJSON;
  metric: Metric;
  selectedCode: string | null;
  onSelect: (code: string | null) => void;
};

function joinForMetric(geo: StatesGeoJSON, states: StateRecord[], metric: Metric): GeoJSON.FeatureCollection {
  const byCode = new Map(states.map((s) => [s.code, s]));
  return {
    type: 'FeatureCollection',
    features: geo.features.map((f) => {
      const rec = byCode.get(f.properties.code);
      return {
        type: 'Feature' as const,
        geometry: f.geometry,
        properties: {
          ...f.properties,
          metric_value: rec ? metric.accessor(rec) : null,
          state_name: rec?.state ?? f.properties.name,
        },
      };
    }),
  };
}

// MapLibre step expression: ['step', input, first_color, stop1, color1, stop2, color2, …]
// Our steps array's [0] is the "below the first stop" bucket; the rest are stop/color pairs.
function buildStepExpression(metric: Metric): maplibregl.ExpressionSpecification {
  const expr: (string | number | unknown[])[] = ['step', ['get', 'metric_value'], metric.steps[0][1]];
  for (let i = 1; i < metric.steps.length; i++) expr.push(metric.steps[i][0], metric.steps[i][1]);
  return expr as unknown as maplibregl.ExpressionSpecification;
}

export default function IndiaMap({ states, geo, metric, selectedCode, onSelect }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;

  const [hover, setHover] = useState<{ name: string; value: number | null; x: number; y: number } | null>(null);

  // Re-join only when metric or data changes. The joined collection becomes the
  // GeoJSON source's data on every metric switch — small enough (36 features) to
  // be cheap and keeps the map's data + the visible scale strictly in sync.
  const joined = useMemo(() => joinForMetric(geo, states, metric), [geo, states, metric]);

  // 1. Initialise the map once.
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: {
        version: 8,
        sources: { states: { type: 'geojson', data: joined } },
        layers: [
          { id: 'bg', type: 'background', paint: { 'background-color': '#fafafa' } },
          {
            id: 'states-fill', type: 'fill', source: 'states',
            paint: {
              'fill-color': [
                'case', ['==', ['get', 'metric_value'], null], '#e5e5e5',
                buildStepExpression(metric),
              ],
              'fill-opacity': 0.95,
            },
          },
          { id: 'states-line', type: 'line', source: 'states',
            paint: { 'line-color': '#404040', 'line-width': 0.4 } },
          { id: 'states-hover', type: 'line', source: 'states',
            paint: { 'line-color': '#111', 'line-width': 1.5 },
            filter: ['==', ['get', 'code'], ''] },
          { id: 'states-selected', type: 'line', source: 'states',
            paint: { 'line-color': '#c1462f', 'line-width': 2.5 },
            filter: ['==', ['get', 'code'], ''] },
        ],
      },
      center: [82.5, 22.5],
      zoom: 3.6,
      attributionControl: false,
    });

    map.addControl(new maplibregl.AttributionControl({
      customAttribution: 'Boundaries: udit-001/india-maps-data (MIT) · Data: AISHE 2021-22',
      compact: true,
    }));
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');
    map.fitBounds([[68, 6], [97.5, 36]], { padding: 20, animate: false });

    map.on('mousemove', 'states-fill', (e) => {
      const f = e.features?.[0] as MapGeoJSONFeature | undefined;
      if (!f) return;
      const p = f.properties as { code: string; state_name: string; metric_value: number | null };
      map.getCanvas().style.cursor = 'pointer';
      map.setFilter('states-hover', ['==', ['get', 'code'], p.code]);
      setHover({ name: p.state_name, value: p.metric_value ?? null, x: e.point.x, y: e.point.y });
    });
    map.on('mouseleave', 'states-fill', () => {
      map.getCanvas().style.cursor = '';
      map.setFilter('states-hover', ['==', ['get', 'code'], '']);
      setHover(null);
    });
    map.on('click', 'states-fill', (e) => {
      const f = e.features?.[0] as MapGeoJSONFeature | undefined;
      if (!f) return;
      const code = (f.properties as { code: string }).code;
      onSelectRef.current(code);
    });
    map.on('click', (e) => {
      const hits = map.queryRenderedFeatures(e.point, { layers: ['states-fill'] });
      if (hits.length === 0) onSelectRef.current(null);
    });

    mapRef.current = map;
    return () => { map.remove(); mapRef.current = null; };
    // Initialise once; metric/data changes flow through the effects below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 2. Update source data + fill-color when metric or join changes.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const apply = () => {
      const src = map.getSource('states') as maplibregl.GeoJSONSource | undefined;
      src?.setData(joined);
      map.setPaintProperty('states-fill', 'fill-color', [
        'case', ['==', ['get', 'metric_value'], null], '#e5e5e5',
        buildStepExpression(metric),
      ]);
    };
    if (map.isStyleLoaded()) apply();
    else map.once('load', apply);
  }, [joined, metric]);

  // 3. Reflect selectedCode in the highlight layer.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const apply = () => map.setFilter('states-selected', ['==', ['get', 'code'], selectedCode ?? '']);
    if (map.isStyleLoaded()) apply();
    else map.once('load', apply);
  }, [selectedCode]);

  return (
    <div className="map-wrap">
      <div ref={containerRef} className="map-canvas" />
      <Legend metric={metric} />
      {hover && (
        <div className="map-tooltip" style={{ left: hover.x + 12, top: hover.y + 12 }}>
          <div className="t-name">{hover.name}</div>
          <div className="t-val">
            {metric.label}: {hover.value == null ? '—' : `${metric.format(hover.value)}${metric.unit ? ' ' + metric.unit : ''}`}
          </div>
        </div>
      )}
    </div>
  );
}

function Legend({ metric }: { metric: Metric }) {
  return (
    <div className="map-legend">
      <div className="legend-title">{metric.legendTitle}</div>
      {metric.steps.map(([floor, color], i) => {
        const next = metric.steps[i + 1]?.[0];
        const label = next == null
          ? `≥ ${metric.format(floor)}`
          : floor === 0 ? `< ${metric.format(next)}`
          : `${metric.format(floor)} – ${metric.format(next)}`;
        return (
          <div key={floor} className="legend-row">
            <span className="legend-swatch" style={{ background: color }} />
            <span>{label}</span>
          </div>
        );
      })}
      {metric.pivot != null && (
        <div className="legend-pivot">National: {metric.format(metric.pivot)}</div>
      )}
    </div>
  );
}
