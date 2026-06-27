import * as pc from 'playcanvas';

/**
 * Loads a GLB from a URL and returns an instantiated PlayCanvas entity.
 * Performs a HEAD check first so PlayCanvas never sees a 404/HTML body —
 * this prevents the "Invalid magic number" console error spam when the
 * asset hasn't been generated yet.
 * Returns null if missing or invalid; callers fall back to procedural geometry.
 */
export async function loadGlbEntity(app: pc.Application, url: string): Promise<pc.Entity | null> {
  // Quick pre-flight: verify the resource exists and is binary before handing
  // it to the PlayCanvas asset loader (which retries and logs on failure).
  try {
    const head = await fetch(url, {
      method: 'HEAD',
      signal: AbortSignal.timeout(4000),
    });
    if (!head.ok) return null;
    const ct = head.headers.get('content-type') ?? '';
    // Reject HTML/text responses (404 pages, dev-server error pages, etc.)
    if (ct.includes('text/html') || ct.includes('text/plain')) return null;
  } catch {
    return null;
  }

  return new Promise((resolve) => {
    const filename = url.split('/').pop() ?? 'model.glb';
    app.assets.loadFromUrlAndFilename(
      url,
      filename,
      'container',
      (err: string | null, asset?: pc.Asset) => {
        if (err || !asset?.resource) { resolve(null); return; }
        try {
          const entity = (asset.resource as pc.ContainerResource).instantiateRenderEntity();
          resolve(entity);
        } catch { resolve(null); }
      },
    );
  });
}
