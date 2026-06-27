/**
 * OsmTrackLoader — fetches OSM raceway geometry via Overpass API,
 * chains the ways into a single ordered centerline, and projects
 * lat/lon to a flat local X/Z coordinate space (metres).
 */

const OVERPASS_URL = 'https://overpass-api.de/api/interpreter';

export const DEFAULT_TRACK = {
  lat:  45.6156,
  lon:  9.2811,
  name: 'Monza',
};

// ---- OSM response types -------------------------------------------------------

interface OsmNode { lat: number; lon: number; }

interface OsmWayElement {
  type: 'way';
  id:   number;
  tags?: Record<string, string>;
  geometry?: OsmNode[];
}

interface OsmResponse { elements: OsmWayElement[]; }

// ---- Helpers ------------------------------------------------------------------

function latLonToLocal(
  lat: number, lon: number,
  cLat: number, cLon: number,
): [number, number] {
  const mPerDegLat = 111_320;
  const mPerDegLon = 111_320 * Math.cos(cLat * (Math.PI / 180));
  return [
    (lon - cLon) * mPerDegLon,    // X → east
    -(lat - cLat) * mPerDegLat,   // Z → south  (north = −Z in PlayCanvas)
  ];
}

function dist2d(a: [number, number], b: [number, number]): number {
  const dx = a[0] - b[0], dz = a[1] - b[1];
  return Math.sqrt(dx * dx + dz * dz);
}

function wayLength(pts: Array<[number, number]>): number {
  let s = 0;
  for (let i = 1; i < pts.length; i++) s += dist2d(pts[i - 1], pts[i]);
  return s;
}

/**
 * Greedy chain: start with the longest way, then repeatedly append
 * the closest unvisited way (forward or reversed) until all are consumed.
 */
function chainWays(ways: Array<Array<[number, number]>>): Array<[number, number]> {
  if (ways.length === 0) return [];
  if (ways.length === 1) return ways[0];

  // Start with the longest piece (most likely the main straight)
  const byLen = [...ways].sort((a, b) => wayLength(b) - wayLength(a));
  const result = [...byLen[0]];
  const remaining = byLen.slice(1);

  while (remaining.length > 0) {
    const tail = result[result.length - 1];
    let bestIdx = -1, bestRev = false, bestDist = Infinity;

    for (let i = 0; i < remaining.length; i++) {
      const w = remaining[i];
      const d1 = dist2d(tail, w[0]);
      const d2 = dist2d(tail, w[w.length - 1]);
      if (d1 < bestDist) { bestDist = d1; bestIdx = i; bestRev = false; }
      if (d2 < bestDist) { bestDist = d2; bestIdx = i; bestRev = true; }
    }

    if (bestIdx === -1 || bestDist > 500) break; // gap too large — bail out

    const chosen = remaining.splice(bestIdx, 1)[0];
    const pts = bestRev ? [...chosen].reverse() : chosen;
    result.push(...pts.slice(1)); // skip first node (duplicate of tail)
  }

  return result;
}

// ---- Public API ---------------------------------------------------------------

export interface TrackData {
  centerline:    Array<[number, number]>; // [x, z] local metres
  startX:        number;
  startZ:        number;
  startHeading:  number;  // radians — atan2(dx,dz) matches PlayCanvas fwd convention
  lengthM:       number;
  name:          string;
}

export async function fetchOsmTrack(
  lat     = DEFAULT_TRACK.lat,
  lon     = DEFAULT_TRACK.lon,
  name    = DEFAULT_TRACK.name,
  radiusM = 4000,
): Promise<TrackData> {
  const query = `[out:json][timeout:30];
way["highway"="raceway"](around:${radiusM},${lat},${lon});
out geom;`;

  const resp = await fetch(OVERPASS_URL, {
    method:  'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body:    `data=${encodeURIComponent(query)}`,
    signal:  AbortSignal.timeout(30_000),
  });

  if (!resp.ok) throw new Error(`Overpass API ${resp.status}`);

  const json = (await resp.json()) as OsmResponse;

  const ways = json.elements
    .filter(el => el.type === 'way' && el.geometry && el.geometry.length > 1)
    .map(el => el.geometry!.map(nd => latLonToLocal(nd.lat, nd.lon, lat, lon)));

  if (ways.length === 0) {
    throw new Error(`No raceway found in OSM within ${radiusM}m of ${name}`);
  }

  const centerline = chainWays(ways);

  // Close the loop if start and end are close
  const first = centerline[0], last = centerline[centerline.length - 1];
  if (dist2d(first, last) < 50) centerline.push([...first]);

  let lengthM = 0;
  for (let i = 1; i < centerline.length; i++) lengthM += dist2d(centerline[i - 1], centerline[i]);

  const [sx, sz] = centerline[0];
  const [nx, nz] = centerline[1];
  const startHeading = Math.atan2(nx - sx, nz - sz);

  return { centerline, startX: sx, startZ: sz, startHeading, lengthM, name };
}
