declare module 'three' {
  export type Vector3Tuple = [number, number, number];

  export class Vector3 {
    x: number;
    y: number;
    z: number;
    constructor(x?: number, y?: number, z?: number);
    set(x: number, y: number, z: number): this;
    normalize(): this;
    dot(v: Vector3): number;
    add(v: Vector3): this;
    addScaledVector(v: Vector3, s: number): this;
    clone(): Vector3;
    copy(v: Vector3): this;
    multiplyScalar(s: number): this;
    setLength(length: number): this;
    length(): number;
    lerp(v: Vector3, alpha: number): this;
  }

  export class Euler {
    x: number;
    y: number;
    z: number;
    copy(euler: Euler): this;
    set(x: number, y: number, z: number): this;
  }

  export class Color {
    constructor(color: number);
    multiplyScalar(amount: number): this;
    getHex(): number;
  }

  export class Object3D {
    position: Vector3;
    rotation: Euler;
    name: string;
    add(...objects: Object3D[]): this;
    remove(object: Object3D): this;
    lookAt(x: number, y: number, z: number): void;
    getWorldDirection(target: Vector3): Vector3;
    getObjectByName(name: string): Object3D | undefined;
  }

  export class Group extends Object3D {}
  export class Scene extends Object3D {
    background: Color | null;
  }

  export class Camera extends Object3D {
    lookAt(x: number, y: number, z: number): void;
  }

  export class PerspectiveCamera extends Camera {}

  export class WebGLRenderer {
    shadowMap: { enabled: boolean };
  }

  export class BoxGeometry {
    constructor(width: number, height: number, depth: number);
  }

  export class CylinderGeometry {
    constructor(radiusTop: number, radiusBottom: number, height: number, radialSegments: number);
  }

  export class EdgesGeometry {
    constructor(geometry: BoxGeometry);
  }

  export class TorusGeometry {
    constructor(radius: number, tube: number, radialSegments: number, tubularSegments: number);
  }

  export class MeshToonMaterial {
    constructor(options: { color: number });
  }

  export class MeshLambertMaterial {
    constructor(options: { color: number; flatShading: boolean });
  }

  export class MeshBasicMaterial {
    constructor(options: { color: number; transparent?: boolean; opacity?: number });
  }

  export class LineBasicMaterial {
    constructor(options: { color: number });
  }

  export class Mesh extends Object3D {
    constructor(geometry: object, material: object);
  }

  export class LineSegments extends Object3D {
    constructor(geometry: object, material: object);
  }

  export class AmbientLight extends Object3D {
    constructor(color: number, intensity: number);
  }

  export class DirectionalLight extends Object3D {
    constructor(color: number, intensity: number);
  }
}

declare module '@enable3d/phaser-extension' {
  import Phaser from 'phaser';

  export const enable3d: (ready: () => Phaser.Game) => {
    withPhysics(path: string): void;
  };

  export class Scene3D extends Phaser.Scene {
    accessThirdDimension(options?: unknown): void;
    third: unknown;
  }
}
