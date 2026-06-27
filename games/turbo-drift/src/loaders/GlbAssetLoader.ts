import * as pc from 'playcanvas';

/**
 * Loads a GLB/GLTF from a URL and returns an instantiated PlayCanvas entity.
 * Returns null if the file doesn't exist or loading fails — callers should
 * treat null as "no GLB asset available" and fall back to procedural geometry.
 */
export function loadGlbEntity(app: pc.Application, url: string): Promise<pc.Entity | null> {
  return new Promise((resolve) => {
    const filename = url.split('/').pop() ?? 'model.glb';

    app.assets.loadFromUrlAndFilename(
      url,
      filename,
      'container',
      (err: string | null, asset?: pc.Asset) => {
        if (err || !asset?.resource) {
          resolve(null);
          return;
        }
        try {
          const entity = (asset.resource as pc.ContainerResource).instantiateRenderEntity();
          resolve(entity);
        } catch {
          resolve(null);
        }
      },
    );
  });
}
