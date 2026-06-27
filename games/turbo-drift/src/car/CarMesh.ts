import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import type { BumperStyle, CarConfig, CustomizablePart, HoodStyle, SpoilerStyle } from '../types';

type PartStyle = BumperStyle | HoodStyle | SpoilerStyle;

const PART_NAMES: Record<CustomizablePart, string> = {
  bumper: 'frontBumper',
  hood: 'hood',
  spoiler: 'spoiler',
};

function bodyMaterial(color: number): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    color,
    flatShading: true,
    metalness: 0.32,
    roughness: 0.28,
  });
}

function glowMaterial(color: number, emissiveIntensity: number): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    color,
    emissive: color,
    emissiveIntensity,
    roughness: 0.05,
    metalness: 0,
  });
}

function box(
  name: string,
  width: number,
  height: number,
  depth: number,
  color: number,
  position: THREE.Vector3Tuple,
  geometryDetail: number = 1,
): THREE.Mesh {
  const geometry =
    geometryDetail > 1
      ? new THREE.BoxGeometry(width, height, depth, geometryDetail, geometryDetail, geometryDetail)
      : new THREE.BoxGeometry(width, height, depth);
  const mesh = new THREE.Mesh(geometry, bodyMaterial(color));
  mesh.name = name;
  mesh.position.set(position[0], position[1], position[2]);
  return mesh;
}

function roundedBox(
  name: string,
  width: number,
  height: number,
  depth: number,
  color: number,
  position: THREE.Vector3Tuple,
  segments = 4,
  radius = 0.12,
): THREE.Mesh {
  const mesh = new THREE.Mesh(
    new RoundedBoxGeometry(width, height, depth, segments, radius),
    bodyMaterial(color),
  );
  mesh.name = name;
  mesh.position.set(position[0], position[1], position[2]);
  return mesh;
}

function glowBox(
  name: string,
  width: number,
  height: number,
  depth: number,
  color: number,
  emissiveIntensity: number,
  position: THREE.Vector3Tuple,
): THREE.Mesh {
  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(width, height, depth),
    glowMaterial(color, emissiveIntensity),
  );
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
    ? { width: 1.95, height: 0.5, length: 4.6, cabinHeight: 0.72 }
    : { width: 1.82, height: 0.5, length: 4.2, cabinHeight: 0.62 };
}

function makeWheel(x: number, z: number): THREE.Object3D {
  const group = new THREE.Group();
  group.name = 'wheelGroup';
  group.position.set(x, -0.24, z);

  // Wide rubber tire
  const tire = new THREE.Mesh(
    new THREE.CylinderGeometry(0.37, 0.37, 0.30, 20),
    new THREE.MeshStandardMaterial({ color: 0x101214, roughness: 0.94, metalness: 0 }),
  );
  tire.name = 'wheel';
  tire.rotation.z = Math.PI / 2;
  group.add(tire);

  // 6-sided rim — hexagonal so rotation is visually apparent
  const rim = new THREE.Mesh(
    new THREE.CylinderGeometry(0.23, 0.23, 0.32, 6),
    new THREE.MeshStandardMaterial({ color: 0x8a909e, metalness: 0.92, roughness: 0.08, flatShading: true }),
  );
  rim.name = 'wheel';
  rim.rotation.z = Math.PI / 2;
  group.add(rim);

  // Centre hub
  const hub = new THREE.Mesh(
    new THREE.CylinderGeometry(0.065, 0.065, 0.35, 8),
    new THREE.MeshStandardMaterial({ color: 0xccccdd, metalness: 1.0, roughness: 0.04 }),
  );
  hub.name = 'wheel';
  hub.rotation.z = Math.PI / 2;
  group.add(hub);

  return group;
}

function makeBumper(style: BumperStyle, config: CarConfig): THREE.Object3D {
  const dims = carDimensions(config);
  const color = darker(config.customization.bodyColor, 0.8);
  if (style === 'street') {
  const group = new THREE.Group();
  group.name = PART_NAMES.bumper;
  group.add(roundedBox('streetBumperCore', dims.width * 0.95, 0.22, 0.28, color, [0, -0.02, -dims.length / 2 - 0.05], 3, 0.04));
  const wedge = box('streetBumperWedge', dims.width * 0.8, 0.08, 0.42, 0x202435, [0, -0.22, -dims.length / 2 - 0.24]);
    wedge.rotation.x = -0.18;
    group.add(wedge);
    return group;
  }

  if (style === 'race') {
  const group = new THREE.Group();
  group.name = PART_NAMES.bumper;
  group.add(roundedBox('raceBumperCore', dims.width * 1.05, 0.2, 0.3, color, [0, -0.04, -dims.length / 2 - 0.08], 3, 0.04));
  group.add(box('raceSplitter', dims.width * 1.32, 0.06, 0.66, 0x08090f, [0, -0.28, -dims.length / 2 - 0.34]));
  return group;
}

  return roundedBox(PART_NAMES.bumper, dims.width * 0.9, 0.2, 0.24, color, [0, -0.02, -dims.length / 2 - 0.05], 3, 0.04);
}

function makeHood(style: HoodStyle, config: CarConfig): THREE.Object3D {
  const dims = carDimensions(config);
  const group = new THREE.Group();
  group.name = PART_NAMES.hood;
  const color = style === 'carbon' ? 0x0e1018 : darker(config.customization.bodyColor, 0.9);
  group.add(roundedBox('hoodPanel', dims.width * 0.8, 0.08, 1.15, color, [0, 0.31, -0.88], 5, 0.03));

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
    group.add(roundedBox('lipSpoiler', dims.width * 0.72, 0.08, 0.16, darker(config.customization.bodyColor, 0.76), [0, 0.36, dims.length / 2 - 0.32], 3, 0.025));
  }

  if (style === 'wing') {
    group.add(box('wingLeftPost', 0.08, 0.5, 0.08, 0x111827, [-0.58, 0.56, dims.length / 2 - 0.52]));
    group.add(box('wingRightPost', 0.08, 0.5, 0.08, 0x111827, [0.58, 0.56, dims.length / 2 - 0.52]));
    group.add(box('wingBlade', dims.width * 0.96, 0.09, 0.34, 0x161a2a, [0, 0.84, dims.length / 2 - 0.54]));
  }

  return group;
}

function buildPart(part: CustomizablePart, style: PartStyle, config: CarConfig): THREE.Object3D {
  if (part === 'bumper') return makeBumper(style as BumperStyle, config);
  if (part === 'hood') return makeHood(style as HoodStyle, config);
  return makeSpoiler(style as SpoilerStyle, config);
}

export const CarMesh = {
  build(config: CarConfig): THREE.Group {
    const dims = carDimensions(config);
    const root = new THREE.Group();
    root.name = 'turboDriftCar';

    // Body
    root.add(roundedBox('chassis', dims.width, dims.height, dims.length, config.customization.bodyColor, [0, 0, 0], 10, 0.16));
    root.add(roundedBox('cabin', dims.width * 0.76, dims.cabinHeight, 2.1, darker(config.customization.bodyColor, 0.58), [0, 0.56, 0.32], 8, 0.12));
    root.add(roundedBox('nose', dims.width * 0.62, 0.34, 1.06, darker(config.customization.bodyColor, 0.84), [0, 0.08, -dims.length * 0.47], 7, 0.08));
    root.add(roundedBox('tail', dims.width * 0.66, 0.32, 0.94, darker(config.customization.bodyColor, 0.72), [0, 0.1, dims.length * 0.44], 7, 0.08));
    root.add(box('roofScoop', dims.width * 0.32, 0.12, 0.62, darker(config.customization.bodyColor, 0.56), [0, 1.06, 0.04], 12));
    root.add(roundedBox('frontLip', dims.width * 0.94, 0.08, 0.18, darker(config.customization.bodyColor, 0.76), [0, -0.18, -dims.length * 0.49], 4, 0.03));
    root.add(roundedBox('rearDiffuser', dims.width * 0.78, 0.07, 0.22, 0x0c1017, [0, -0.17, dims.length * 0.48], 4, 0.025));
    root.add(box('leftMirror', 0.14, 0.12, 0.22, darker(config.customization.bodyColor, 0.58), [-(dims.width * 0.58), 0.62, -0.55], 8));
    root.add(box('rightMirror', 0.14, 0.12, 0.22, darker(config.customization.bodyColor, 0.58), [(dims.width * 0.58), 0.62, -0.55], 8));
    root.add(box('hoodBulgeLeft', 0.22, 0.08, 0.92, darker(config.customization.bodyColor, 0.88), [-0.34, 0.42, -0.64], 8));
    root.add(box('hoodBulgeRight', 0.22, 0.08, 0.92, darker(config.customization.bodyColor, 0.88), [0.34, 0.42, -0.64], 8));
    root.add(roundedBox('fenderLeftFront', 0.16, 0.18, 0.84, darker(config.customization.bodyColor, 0.78), [-dims.width * 0.5, 0.18, -1.18], 4, 0.03));
    root.add(roundedBox('fenderRightFront', 0.16, 0.18, 0.84, darker(config.customization.bodyColor, 0.78), [dims.width * 0.5, 0.18, -1.18], 4, 0.03));
    root.add(roundedBox('fenderLeftRear', 0.16, 0.18, 0.84, darker(config.customization.bodyColor, 0.78), [-dims.width * 0.5, 0.18, 1.16], 4, 0.03));
    root.add(roundedBox('fenderRightRear', 0.16, 0.18, 0.84, darker(config.customization.bodyColor, 0.78), [dims.width * 0.5, 0.18, 1.16], 4, 0.03));

    // Emissive headlights
    root.add(glowBox('leftHeadlight', 0.2, 0.11, 0.18, 0xd8f4ff, 3.5, [-(dims.width * 0.22), 0.13, -dims.length * 0.53]));
    root.add(glowBox('rightHeadlight', 0.2, 0.11, 0.18, 0xd8f4ff, 3.5, [(dims.width * 0.22), 0.13, -dims.length * 0.53]));
    root.add(glowBox('leftHeadlightOuter', 0.12, 0.08, 0.14, 0x88ccff, 2.0, [-(dims.width * 0.34), 0.14, -dims.length * 0.52]));
    root.add(glowBox('rightHeadlightOuter', 0.12, 0.08, 0.14, 0x88ccff, 2.0, [(dims.width * 0.34), 0.14, -dims.length * 0.52]));

    // Emissive taillights
    root.add(glowBox('leftTaillight', 0.22, 0.1, 0.16, 0xff1533, 2.8, [-(dims.width * 0.24), 0.16, dims.length * 0.5]));
    root.add(glowBox('rightTaillight', 0.22, 0.1, 0.16, 0xff1533, 2.8, [(dims.width * 0.24), 0.16, dims.length * 0.5]));
    root.add(glowBox('centerBrakeLight', dims.width * 0.3, 0.06, 0.12, 0xff4400, 1.8, [0, 0.48, dims.length * 0.49]));

    // Wheels
    const wheelX = dims.width / 2 + 0.1;
    const frontZ = -dims.length * 0.32;
    const rearZ = dims.length * 0.34;
    root.add(makeWheel(-wheelX, frontZ));
    root.add(makeWheel(wheelX, frontZ));
    root.add(makeWheel(-wheelX, rearZ));
    root.add(makeWheel(wheelX, rearZ));

    // Customizable parts
    root.add(makeBumper(config.customization.bumper, config));
    root.add(makeHood(config.customization.hood, config));
    root.add(makeSpoiler(config.customization.spoiler, config));

    // Side skirts
    root.add(roundedBox('sideSkirtLeft', dims.width * 0.9, 0.06, 0.16, darker(config.customization.bodyColor, 0.7), [-0.01, -0.24, 0], 4, 0.02));
    root.add(roundedBox('sideSkirtRight', dims.width * 0.9, 0.06, 0.16, darker(config.customization.bodyColor, 0.7), [0.01, -0.24, 0], 4, 0.02));

    // Neon underflow strip
    root.add(glowBox('neonStrip', dims.width * 0.86, 0.04, dims.length * 0.88, config.customization.neonColor, 2.2, [0, -0.34, 0]));

    // Engine intake glow
    root.add(glowBox('engineIntake', 0.18, 0.16, 0.36, 0xff9b40, 2.8, [0.44, 0.7, -0.92]));

    return root;
  },

  swapPart(root: THREE.Group, part: CustomizablePart, style: string, config: CarConfig): void {
    const oldPart = root.getObjectByName(PART_NAMES[part]);
    if (oldPart) root.remove(oldPart);
    root.add(buildPart(part, style as PartStyle, config));
  },

  spinWheels(carGroup: THREE.Group, deltaMs: number, speedKph: number): void {
    const speedMs = speedKph / 3.6;
    const angle = (speedMs * deltaMs * 0.001) / 0.37;
    if (Math.abs(angle) < 0.0001) return;
    const worldX = new THREE.Vector3(1, 0, 0);
    carGroup.traverse((obj) => {
      if (obj.name === 'wheel') {
        (obj as THREE.Mesh).rotateOnWorldAxis(worldX, angle);
      }
    });
  },
};
