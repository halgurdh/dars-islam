declare module 'three/examples/jsm/geometries/RoundedBoxGeometry.js' {
  import type { BufferGeometry } from 'three';

  export class RoundedBoxGeometry extends BufferGeometry {
    constructor(
      width?: number,
      height?: number,
      depth?: number,
      segments?: number,
      radius?: number,
    );
  }
}

declare module 'three/examples/jsm/libs/meshopt_decoder.module.js' {
  export const MeshoptDecoder: {
    supported: boolean;
    ready: Promise<void>;
  };
}

declare module 'three/examples/jsm/loaders/GLTFLoader.js' {
  import type * as THREE from 'three';

  export interface GLTF {
    scene: THREE.Group;
    scenes: THREE.Group[];
    animations: THREE.AnimationClip[];
    asset: Record<string, unknown>;
    parser: unknown;
    userData: Record<string, unknown>;
  }

  export class GLTFLoader {
    setMeshoptDecoder(decoder: unknown): this;
    load(
      url: string,
      onLoad: (gltf: GLTF) => void,
      onProgress?: (event: ProgressEvent<EventTarget>) => void,
      onError?: (error: ErrorEvent | Error) => void,
    ): void;
  }
}
