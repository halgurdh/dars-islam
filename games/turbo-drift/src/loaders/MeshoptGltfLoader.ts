import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';

const loaderCache = new Map<string, Promise<THREE.Group>>();

function loadScene(url: string): Promise<THREE.Group> {
  const loader = new GLTFLoader();
  loader.setMeshoptDecoder(MeshoptDecoder);

  return new Promise((resolve, reject) => {
    loader.load(
      url,
      (gltf) => {
        const scene = gltf.scene;
        scene.traverse((object) => {
          if ((object as THREE.Mesh).isMesh) {
            const mesh = object as THREE.Mesh;
            mesh.castShadow = false;
            mesh.receiveShadow = false;
          }
        });
        resolve(scene);
      },
      undefined,
      reject,
    );
  });
}

export async function loadMeshoptGroup(url: string): Promise<THREE.Group> {
  const cached = loaderCache.get(url);
  if (cached) return cached;

  const promise = loadScene(url);
  loaderCache.set(url, promise);
  return promise;
}

export async function tryLoadMeshoptGroup(url: string): Promise<THREE.Group | null> {
  try {
    return await loadMeshoptGroup(url);
  } catch {
    loaderCache.delete(url);
    return null;
  }
}
