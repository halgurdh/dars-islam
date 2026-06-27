import * as THREE from 'three';
import type { BumperStyle, CarConfig, CustomizablePart, HoodStyle, SpoilerStyle } from '../types';

type PartStyle = BumperStyle | HoodStyle | SpoilerStyle;

const PART_NAMES: Record<CustomizablePart, string> = {
  bumper: 'frontBumper',
  hood: 'hood',
  spoiler: 'spoiler',
};

function toon(color: number): THREE.MeshLambertMaterial {
  return new THREE.MeshLambertMaterial({ color, flatShading: true });
}

function box(
  name: string,
  width: number,
  height: number,
  depth: number,
  color: number,
  position: THREE.Vector3Tuple,
): THREE.Mesh {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), toon(color));
  mesh.name = name;
  mesh.position.set(position[0], position[1], position[2]);
  return mesh;
}

function darker(color: number, amount: number): number {
  const c = new THREE.Color(color);
  c.multiplyScalar(amount);
  return c.getHex();
}

function carDimensions(config: CarConfig): { width: number; height: number; length: number; cabinHeight: number } {
  return config.carClass === 'sedan'
    ? { width: 1.95, height: 0.5, length: 4.6, cabinHeight: 0.7 }
    : { width: 1.8, height: 0.5, length: 4.2, cabinHeight: 0.6 };
}

function makeWheel(x: number, z: number): THREE.Mesh {
  const wheel = new THREE.Mesh(
    new THREE.CylinderGeometry(0.35, 0.35, 0.25, 8),
    toon(0x161820),
  );
  wheel.name = 'wheel';
  wheel.rotation.z = Math.PI / 2;
  wheel.position.set(x, -0.22, z);
  return wheel;
}

function makeBumper(style: BumperStyle, config: CarConfig): THREE.Object3D {
  const dims = carDimensions(config);
  const color = darker(config.customization.bodyColor, 0.82);
  if (style === 'street') {
    const group = new THREE.Group();
    group.name = PART_NAMES.bumper;
    group.add(box('streetBumperCore', dims.width * 0.95, 0.22, 0.28, color, [0, -0.02, -dims.length / 2 - 0.05]));
    const wedge = box('streetBumperWedge', dims.width * 0.8, 0.08, 0.42, 0x202435, [0, -0.22, -dims.length / 2 - 0.24]);
    wedge.rotation.x = -0.18;
    group.add(wedge);
    return group;
  }

  if (style === 'race') {
    const group = new THREE.Group();
    group.name = PART_NAMES.bumper;
    group.add(box('raceBumperCore', dims.width * 1.05, 0.2, 0.3, color, [0, -0.04, -dims.length / 2 - 0.08]));
    group.add(box('raceSplitter', dims.width * 1.3, 0.06, 0.62, 0x08090f, [0, -0.28, -dims.length / 2 - 0.32]));
    return group;
  }

  return box(PART_NAMES.bumper, dims.width * 0.9, 0.2, 0.24, color, [0, -0.02, -dims.length / 2 - 0.05]);
}

function makeHood(style: HoodStyle, config: CarConfig): THREE.Object3D {
  const dims = carDimensions(config);
  const group = new THREE.Group();
  group.name = PART_NAMES.hood;
  const color = style === 'carbon' ? 0x101219 : darker(config.customization.bodyColor, 0.92);
  group.add(box('hoodPanel', dims.width * 0.8, 0.08, 1.15, color, [0, 0.31, -0.88]));

  if (style !== 'stock') {
    group.add(box('hoodVentLeft', 0.12, 0.025, 0.48, 0x03040a, [-0.32, 0.36, -0.86]));
    group.add(box('hoodVentRight', 0.12, 0.025, 0.48, 0x03040a, [0.32, 0.36, -0.86]));
  }

  return group;
}

function makeSpoiler(style: SpoilerStyle, config: CarConfig): THREE.Object3D {
  const dims = carDimensions(config);
  const group = new THREE.Group();
  group.name = PART_NAMES.spoiler;

  if (style === 'lip') {
    group.add(box('lipSpoiler', dims.width * 0.72, 0.08, 0.16, darker(config.customization.bodyColor, 0.78), [0, 0.36, dims.length / 2 - 0.32]));
  }

  if (style === 'wing') {
    group.add(box('wingLeftPost', 0.08, 0.48, 0.08, 0x111827, [-0.58, 0.55, dims.length / 2 - 0.5]));
    group.add(box('wingRightPost', 0.08, 0.48, 0.08, 0x111827, [0.58, 0.55, dims.length / 2 - 0.5]));
    group.add(box('wingBlade', dims.width * 0.95, 0.09, 0.32, 0x171b2b, [0, 0.82, dims.length / 2 - 0.52]));
  }

  return group;
}

function buildPart(part: CustomizablePart, style: PartStyle, config: CarConfig): THREE.Object3D {
  if (part === 'bumper') {
    return makeBumper(style as BumperStyle, config);
  }
  if (part === 'hood') {
    return makeHood(style as HoodStyle, config);
  }
  return makeSpoiler(style as SpoilerStyle, config);
}

export const CarMesh = {
  build(config: CarConfig): THREE.Group {
    const dims = carDimensions(config);
    const root = new THREE.Group();
    root.name = 'turboDriftCar';

    root.add(box('chassis', dims.width, dims.height, dims.length, config.customization.bodyColor, [0, 0, 0]));
    root.add(box('cabin', dims.width * 0.78, dims.cabinHeight, 2, darker(config.customization.bodyColor, 0.66), [0, 0.55, 0.34]));

    const wheelX = dims.width / 2 + 0.08;
    const frontZ = -dims.length * 0.32;
    const rearZ = dims.length * 0.34;
    root.add(makeWheel(-wheelX, frontZ));
    root.add(makeWheel(wheelX, frontZ));
    root.add(makeWheel(-wheelX, rearZ));
    root.add(makeWheel(wheelX, rearZ));

    root.add(makeBumper(config.customization.bumper, config));
    root.add(makeHood(config.customization.hood, config));
    root.add(makeSpoiler(config.customization.spoiler, config));

    const neon = new THREE.Mesh(
      new THREE.BoxGeometry(dims.width * 0.88, 0.04, dims.length * 0.9),
      new THREE.MeshBasicMaterial({ color: config.customization.neonColor }),
    );
    neon.name = 'neonStrip';
    neon.position.set(0, -0.34, 0);
    root.add(neon);

    return root;
  },

  swapPart(root: THREE.Group, part: CustomizablePart, style: string, config: CarConfig): void {
    const oldPart = root.getObjectByName(PART_NAMES[part]);
    if (oldPart) {
      root.remove(oldPart);
    }
    root.add(buildPart(part, style as PartStyle, config));
  },
};
