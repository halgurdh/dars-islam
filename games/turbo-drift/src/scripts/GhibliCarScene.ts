import * as pc from 'playcanvas';

type AttributeType = 'number' | 'rgb' | 'rgba';

interface AttributeOptions {
  type: AttributeType;
  default?: number | number[];
  min?: number;
  max?: number;
  title?: string;
  description?: string;
}

type ScriptCtor = typeof pc.ScriptType & {
  attributes: {
    add(name: string, options: AttributeOptions): void;
  };
};

const attributeQueue = new WeakMap<object, Map<string, AttributeOptions>>();

function property(options: AttributeOptions) {
  return (target: object, key: string | symbol): void => {
    const list = attributeQueue.get(target) ?? new Map<string, AttributeOptions>();
    list.set(String(key), options);
    attributeQueue.set(target, list);
  };
}

function applyDecoratedAttributes(script: ScriptCtor): void {
  const attrs = attributeQueue.get(script.prototype);
  attrs?.forEach((options, name) => script.attributes.add(name, options));
}

function colorFrom(value: pc.Color | number[] | undefined, fallback: pc.Color): pc.Color {
  if (value instanceof pc.Color) return value;
  if (Array.isArray(value)) {
    return new pc.Color(value[0] ?? fallback.r, value[1] ?? fallback.g, value[2] ?? fallback.b, value[3] ?? fallback.a);
  }
  return fallback.clone();
}

function tint(color: pc.Color, shadow: pc.Color, amount: number): pc.Color {
  return new pc.Color(
    pc.math.lerp(color.r, shadow.r, amount),
    pc.math.lerp(color.g, shadow.g, amount),
    pc.math.lerp(color.b, shadow.b, amount),
    color.a,
  );
}

export class GhibliCarScene extends pc.ScriptType {
  static readonly scriptName = 'ghibliCarScene';

  @property({
    type: 'rgba',
    default: [0.88, 0.31, 0.18, 1],
    title: 'Body Color',
    description: 'Watercolor base color for the hand-painted car body.',
  })
  bodyColor = new pc.Color(0.88, 0.31, 0.18, 1);

  @property({
    type: 'rgba',
    default: [0.11, 0.095, 0.075, 1],
    title: 'Wheel Color',
    description: 'Soft dark tire and wheel color.',
  })
  wheelColor = new pc.Color(0.11, 0.095, 0.075, 1);

  @property({
    type: 'rgba',
    default: [0.16, 0.105, 0.065, 1],
    title: 'Outline Color',
    description: 'Charcoal brown ink color for inverted-hull outlines.',
  })
  outlineColor = new pc.Color(0.16, 0.105, 0.065, 1);

  @property({
    type: 'number',
    default: 0.18,
    min: -2,
    max: 2,
    title: 'Rotation Speed',
    description: 'Camera orbit speed in radians per second.',
  })
  rotationSpeed = 0.18;

  private camera: pc.Entity | null = null;
  private carRoot: pc.Entity | null = null;
  private cameraFrame: pc.CameraFrame | null = null;
  private sun: pc.Entity | null = null;
  private relightTime = 0;
  private readonly raceMaterials: pc.StandardMaterial[] = [];
  private orbitAngle = -0.72;
  private readonly cameraTarget = new pc.Vec3(0, 0.92, 0);
  private readonly sunDirection = new pc.Vec3(-0.42, -0.64, -0.64).normalize();

  initialize(): void {
    this.bodyColor = colorFrom(this.bodyColor, new pc.Color(0.88, 0.31, 0.18, 1));
    this.wheelColor = colorFrom(this.wheelColor, new pc.Color(0.11, 0.095, 0.075, 1));
    this.outlineColor = colorFrom(this.outlineColor, new pc.Color(0.16, 0.105, 0.065, 1));

    this.configureScene();
    this.createLighting();
    this.createCamera();
    this.createProceduralSky();
    this.createWorld();
    this.createRaceScenerySplats();
    this.carRoot = this.createCar();
  }

  update(dt: number): void {
    if (!this.camera || !this.carRoot) return;

    this.orbitAngle += dt * this.rotationSpeed;
    const radius = 6.2;
    const height = 2.35 + Math.sin(this.orbitAngle * 0.7) * 0.12;
    this.camera.setPosition(
      Math.sin(this.orbitAngle) * radius,
      height,
      Math.cos(this.orbitAngle) * radius,
    );
    this.camera.lookAt(this.cameraTarget);

    this.carRoot.rotateLocal(0, dt * 4.5, 0);
    this.updateWheelSpin(this.carRoot, dt);
    this.updateRelighting(dt);
  }

  private configureScene(): void {
    const scene = this.app.scene as pc.Scene & {
      exposure?: number;
    };
    scene.ambientLight = new pc.Color(0.78, 0.88, 1.0);
    scene.exposure = 1.18;
    scene.fog.type = pc.FOG_EXP2;
    scene.fog.color = new pc.Color(0.72, 0.84, 0.94);
    scene.fog.density = 0.012;
    this.app.graphicsDevice.maxPixelRatio = Math.min(window.devicePixelRatio || 1, 1.5);
    this.configureSplatBudget();
  }

  private createLighting(): void {
    const sun = new pc.Entity('late-afternoon sun');
    sun.addComponent('light', {
      type: 'directional',
      color: new pc.Color(1.0, 0.74, 0.42),
      intensity: 3.4,
      castShadows: true,
      shadowDistance: 28,
      shadowResolution: 1024,
      shadowType: pc.SHADOW_PCSS_32F,
      shadowBias: 0.08,
      normalOffsetBias: 0.025,
      shadowUpdateMode: pc.SHADOWUPDATE_REALTIME,
    });
    sun.setEulerAngles(34, -38, 0);
    this.entity.addChild(sun);
    this.sun = sun;

    const skyFill = new pc.Entity('cream blue ambient fill');
    skyFill.addComponent('light', {
      type: 'omni',
      color: new pc.Color(0.78, 0.88, 1.0),
      intensity: 1.45,
      range: 18,
      castShadows: false,
    });
    skyFill.setPosition(-2, 4.2, 3.5);
    this.entity.addChild(skyFill);
  }

  private createCamera(): void {
    this.camera = new pc.Entity('orbit camera');
    this.camera.addComponent('camera', {
      clearColor: new pc.Color(0.66, 0.80, 0.92, 1),
      fov: 44,
      nearClip: 0.08,
      farClip: 80,
    });
    this.entity.addChild(this.camera);
    if (this.camera.camera) {
      this.camera.camera.toneMapping = pc.TONEMAP_ACES;
      this.camera.camera.gammaCorrection = pc.GAMMA_SRGB;
    }
    this.configureDepthOfField(this.camera);
  }

  private createWorld(): void {
    const grass = this.createPrimitive(
      'sunlit meadow',
      'box',
      new pc.Vec3(0, -0.07, 0),
      new pc.Vec3(16, 0.08, 16),
      this.createGhibliMaterial('meadow watercolor', new pc.Color(0.48, 0.66, 0.38), new pc.Color(0.34, 0.55, 0.50)),
    );
    grass.render!.receiveShadows = true;
    this.entity.addChild(grass);

    for (let i = 0; i < 14; i += 1) {
      const angle = (i / 14) * Math.PI * 2;
      const dist = 5.2 + (i % 4) * 0.65;
      const tuft = this.createPrimitive(
        `painted grass tuft ${i + 1}`,
        'cone',
        new pc.Vec3(Math.cos(angle) * dist, 0.22, Math.sin(angle) * dist),
        new pc.Vec3(0.22, 0.62 + (i % 3) * 0.12, 0.22),
        this.createFlatMaterial(`tuft ${i + 1}`, new pc.Color(0.28, 0.52, 0.30)),
      );
      tuft.setEulerAngles(0, -angle * pc.math.RAD_TO_DEG, 0);
      this.enableShadows(tuft);
      this.entity.addChild(tuft);
    }
  }

  private createProceduralSky(): void {
    const sky = new pc.Entity('procedural racing sky dome');
    sky.addComponent('render', {
      type: 'sphere',
      material: this.createSkyMaterial(),
      castShadows: false,
      receiveShadows: false,
    });
    sky.setLocalScale(72, 28, 72);
    sky.setLocalPosition(0, 9, 0);
    this.entity.addChild(sky);
  }

  private createRaceScenerySplats(): void {
    const count = 520;
    const format = new pc.GSplatFormat(this.app.graphicsDevice, [
      { name: 'data', format: pc.PIXELFORMAT_RGBA32F },
    ], {
      readGLSL: `
        vec4 d = loadData();
        splatCenter = d.xyz;
        splatColor = vec4(
            mix(vec3(0.28, 0.46, 0.34), vec3(0.66, 0.74, 0.84), smoothstep(2.0, 9.0, d.y)),
            0.34
        );
        splatScale = vec3(d.w * 1.65, d.w, d.w * 0.55);
        splatRotation = vec4(0.0, 0.0, 0.0, 1.0);
      `,
      readWGSL: `
        let d = loadData();
        splatCenter = d.xyz;
        splatColor = vec4f(
            mix(vec3f(0.28, 0.46, 0.34), vec3f(0.66, 0.74, 0.84), smoothstep(2.0, 9.0, d.y)),
            0.34
        );
        splatScale = vec3f(d.w * 1.65, d.w, d.w * 0.55);
        splatRotation = vec4f(0.0, 0.0, 0.0, 1.0);
      `,
    });

    const container = new pc.GSplatContainer(this.app.graphicsDevice, count, format);
    const data = container.getTexture('data')?.lock();
    const centers = new Float32Array(count * 3);

    if (data instanceof Float32Array) {
      for (let i = 0; i < count; i += 1) {
        const ring = i / count;
        const angle = ring * Math.PI * 2 * 7.0 + Math.sin(i * 12.9898) * 0.14;
        const radius = 20 + (i % 37) * 0.45;
        const skyline = i % 9 === 0;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        const y = skyline ? 2.6 + (i % 17) * 0.22 : 0.8 + (i % 11) * 0.08;
        const size = skyline ? 1.25 + (i % 5) * 0.24 : 0.72 + (i % 7) * 0.08;

        data[i * 4 + 0] = x;
        data[i * 4 + 1] = y;
        data[i * 4 + 2] = z;
        data[i * 4 + 3] = size;
        centers[i * 3 + 0] = x;
        centers[i * 3 + 1] = y;
        centers[i * 3 + 2] = z;
      }
      container.getTexture('data')?.unlock();
      container.centers = centers;
      container.aabb = new pc.BoundingBox(new pc.Vec3(0, 4, 0), new pc.Vec3(34, 9, 34));
      container.update(count, true);

      const splats = new pc.Entity('city scale racing splats');
      splats.addComponent('gsplat', {
        resource: container,
        castShadows: false,
        receiveShadows: false,
      });
      this.entity.addChild(splats);
    }
  }

  private createCar(): pc.Entity {
    const root = new pc.Entity('vintage ghibli car');
    root.setPosition(0, 0.28, 0);
    this.entity.addChild(root);

    const bodyMat = this.createGhibliMaterial('car body watercolor', this.bodyColor, new pc.Color(0.38, 0.50, 0.68));
    const glassMat = this.createGlassMaterial();
    const darkMat = this.createGhibliMaterial('wheel watercolor', this.wheelColor, new pc.Color(0.24, 0.22, 0.24));
    const creamMat = this.createGhibliMaterial('warm cream details', new pc.Color(0.92, 0.78, 0.52), new pc.Color(0.48, 0.44, 0.58));

    const chassis = this.createPrimitive('rounded curved chassis', 'sphere', new pc.Vec3(0, 0.58, 0), new pc.Vec3(2.82, 0.62, 1.18), bodyMat);
    root.addChild(chassis);
    this.addOutline(chassis, new pc.Vec3(2.93, 0.70, 1.28));

    const belly = this.createPrimitive('soft lower body', 'box', new pc.Vec3(0, 0.38, 0.02), new pc.Vec3(2.78, 0.46, 1.04), bodyMat);
    root.addChild(belly);
    this.addOutline(belly, new pc.Vec3(2.89, 0.55, 1.14));

    const hood = this.createPrimitive('swept bonnet', 'sphere', new pc.Vec3(0, 0.72, -0.74), new pc.Vec3(1.62, 0.38, 0.82), bodyMat);
    root.addChild(hood);
    this.addOutline(hood, new pc.Vec3(1.70, 0.45, 0.90));

    const cockpit = this.createPrimitive('arched cockpit window', 'sphere', new pc.Vec3(0, 1.02, 0.18), new pc.Vec3(1.26, 0.78, 0.88), glassMat);
    root.addChild(cockpit);
    this.addOutline(cockpit, new pc.Vec3(1.34, 0.86, 0.96));

    const windshield = this.createPrimitive('front blue glass wash', 'box', new pc.Vec3(0, 0.98, -0.32), new pc.Vec3(1.06, 0.38, 0.045), glassMat);
    windshield.setEulerAngles(-14, 0, 0);
    root.addChild(windshield);

    const grille = this.createPrimitive('tiny smiling grille', 'box', new pc.Vec3(0, 0.48, -0.98), new pc.Vec3(0.7, 0.11, 0.055), creamMat);
    root.addChild(grille);

    [-0.58, 0.58].forEach((x) => {
      const lamp = this.createPrimitive('warm round headlamp', 'sphere', new pc.Vec3(x, 0.62, -1.05), new pc.Vec3(0.2, 0.2, 0.08), creamMat);
      root.addChild(lamp);
    });

    const wheelPositions = [
      new pc.Vec3(-1.06, 0.23, -0.58),
      new pc.Vec3(1.06, 0.23, -0.58),
      new pc.Vec3(-1.06, 0.23, 0.58),
      new pc.Vec3(1.06, 0.23, 0.58),
    ];

    wheelPositions.forEach((position, index) => {
      const wheel = this.createWheel(index + 1, position, darkMat, creamMat);
      root.addChild(wheel);
      this.createSuspensionJoint(root, wheel, position, index);
    });

    this.enableShadows(root);
    return root;
  }

  private createWheel(index: number, position: pc.Vec3, tireMat: pc.Material, rimMat: pc.Material): pc.Entity {
    const wheel = new pc.Entity(`wheel ${index}`);
    wheel.tags.add('wheel');
    wheel.setPosition(position);
    wheel.setEulerAngles(0, 0, 90);

    const tire = this.createPrimitive('soft ink tire', 'cylinder', pc.Vec3.ZERO, new pc.Vec3(0.36, 0.22, 0.36), tireMat);
    wheel.addChild(tire);
    this.addOutline(tire, new pc.Vec3(0.42, 0.27, 0.42));

    const rim = this.createPrimitive('painted cream rim', 'cylinder', pc.Vec3.ZERO, new pc.Vec3(0.21, 0.24, 0.21), rimMat);
    wheel.addChild(rim);

    for (let i = 0; i < 6; i += 1) {
      const spoke = this.createPrimitive('brush stroke spoke', 'box', new pc.Vec3(0, 0, 0), new pc.Vec3(0.055, 0.035, 0.28), rimMat);
      spoke.setEulerAngles(0, (i / 6) * 360, 0);
      wheel.addChild(spoke);
    }

    this.enableShadows(wheel);
    return wheel;
  }

  private createSuspensionJoint(root: pc.Entity, wheel: pc.Entity, localPosition: pc.Vec3, index: number): void {
    const strut = this.createPrimitive(
      `visual suspension strut ${index + 1}`,
      'cylinder',
      new pc.Vec3(localPosition.x * 0.88, localPosition.y + 0.18, localPosition.z),
      new pc.Vec3(0.035, 0.34, 0.035),
      this.createFlatMaterial(`warm ink strut ${index + 1}`, new pc.Color(0.20, 0.16, 0.12)),
    );
    strut.setEulerAngles(0, 0, localPosition.x < 0 ? -12 : 12);
    root.addChild(strut);

    const ammo = (globalThis as typeof globalThis & { Ammo?: { addFunction?: unknown } }).Ammo;
    if (typeof ammo?.addFunction !== 'function') return;

    if (!root.collision) {
      root.addComponent('collision', {
        type: 'box',
        halfExtents: new pc.Vec3(1.45, 0.38, 0.68),
      });
      root.addComponent('rigidbody', {
        type: pc.BODYTYPE_KINEMATIC,
        mass: 900,
      });
    }

    wheel.addComponent('collision', {
      type: 'sphere',
      radius: 0.34,
    });
    wheel.addComponent('rigidbody', {
      type: pc.BODYTYPE_DYNAMIC,
      mass: 18,
      linearDamping: 0.82,
      angularDamping: 0.46,
    });

    const joint = new pc.Entity(`hinge suspension joint ${index + 1}`);
    joint.setLocalPosition(localPosition);
    joint.setLocalEulerAngles(0, 0, 90);
    joint.addComponent('joint', {
      type: pc.JOINTTYPE_HINGE,
      entityA: wheel,
      entityB: root,
      enableLimits: true,
      limits: new pc.Vec2(-24, 24),
      enableCollision: false,
    });
    root.addChild(joint);
  }

  private updateWheelSpin(root: pc.Entity, dt: number): void {
    const wheels = root.findByTag('wheel');
    for (const wheel of wheels) {
      wheel.rotateLocal(dt * 160, 0, 0);
    }
  }

  private createPrimitive(name: string, type: string, position: pc.Vec3, scale: pc.Vec3, material: pc.Material): pc.Entity {
    const entity = new pc.Entity(name);
    entity.addComponent('render', {
      type,
      material,
      castShadows: true,
      receiveShadows: true,
    });
    entity.setLocalPosition(position);
    entity.setLocalScale(scale);
    return entity;
  }

  private createGhibliMaterial(name: string, baseColor: pc.Color, shadowColor: pc.Color): pc.StandardMaterial {
    const material = new pc.StandardMaterial();
    material.name = name;
    material.diffuse = tint(baseColor, new pc.Color(1.0, 0.88, 0.58), 0.08);
    material.emissive = tint(shadowColor, new pc.Color(0.62, 0.74, 1.0), 0.16);
    material.emissiveIntensity = 0.08;
    material.ambient = tint(baseColor, shadowColor, 0.38);
    material.glossInvert = true;
    material.gloss = 0.96;
    material.metalness = 0;
    material.useLighting = true;

    this.injectWatercolorWgslChunk(material, baseColor, shadowColor);
    material.update();
    this.raceMaterials.push(material);
    return material;
  }

  private createFlatMaterial(name: string, color: pc.Color): pc.StandardMaterial {
    const material = new pc.StandardMaterial();
    material.name = name;
    material.diffuse = color;
    material.glossInvert = true;
    material.gloss = 1;
    material.metalness = 0;
    material.update();
    return material;
  }

  private createSkyMaterial(): pc.StandardMaterial {
    const material = new pc.StandardMaterial();
    material.name = 'procedural sky watercolor gradient';
    material.useLighting = false;
    material.cull = pc.CULLFACE_FRONT;
    material.depthWrite = false;
    material.diffuse = new pc.Color(0.66, 0.80, 0.92);
    material.emissive = new pc.Color(0.66, 0.80, 0.92);
    material.emissiveIntensity = 1.0;

    material.shaderChunksVersion = '2.20';
    material.getShaderChunks(pc.SHADERLANGUAGE_GLSL).set('diffusePS', `
void getAlbedo() {
    float h = clamp(normalize(vPositionW).y * 0.5 + 0.5, 0.0, 1.0);
    vec3 horizon = vec3(1.0, 0.78, 0.52);
    vec3 zenith = vec3(0.46, 0.70, 0.92);
    dAlbedo = mix(horizon, zenith, smoothstep(0.15, 0.95, h));
}
`);
    material.getShaderChunks(pc.SHADERLANGUAGE_WGSL).set('diffusePS', `
fn getAlbedo() {
    let h = clamp(normalize(vPositionW).y * 0.5 + 0.5, 0.0, 1.0);
    let horizon = vec3f(1.0, 0.78, 0.52);
    let zenith = vec3f(0.46, 0.70, 0.92);
    dAlbedo = mix(horizon, zenith, smoothstep(0.15, 0.95, h));
}
`);
    material.update();
    return material;
  }

  private createGlassMaterial(): pc.StandardMaterial {
    const material = this.createGhibliMaterial('arched blue glass watercolor', new pc.Color(0.58, 0.82, 0.92, 0.72), new pc.Color(0.38, 0.54, 0.78));
    material.opacity = 0.74;
    material.blendType = pc.BLEND_NORMAL;
    material.depthWrite = false;
    material.update();
    return material;
  }

  private createOutlineMaterial(): pc.StandardMaterial {
    const material = new pc.StandardMaterial();
    material.name = 'charcoal brown inverted hull outline';
    material.diffuse = this.outlineColor;
    material.emissive = this.outlineColor;
    material.emissiveIntensity = 0.08;
    material.useLighting = false;
    material.cull = pc.CULLFACE_FRONT;
    material.depthWrite = true;
    material.update();
    return material;
  }

  private addOutline(source: pc.Entity, outlineScale: pc.Vec3): void {
    const render = source.render;
    if (!render) return;

    const outline = new pc.Entity(`${source.name} ink outline`);
    outline.addComponent('render', {
      type: render.type,
      material: this.createOutlineMaterial(),
      castShadows: false,
      receiveShadows: false,
    });
    outline.setLocalPosition(source.getLocalPosition());
    outline.setLocalEulerAngles(source.getLocalEulerAngles());
    outline.setLocalScale(outlineScale);
    source.parent?.addChild(outline);
  }

  private enableShadows(entity: pc.Entity): void {
    const render = entity.render;
    if (render) {
      render.castShadows = true;
      render.receiveShadows = true;
    }
    for (const child of entity.children) {
      this.enableShadows(child as pc.Entity);
    }
  }

  private injectWatercolorWgslChunk(material: pc.StandardMaterial, baseColor: pc.Color, shadowColor: pc.Color): void {
    material.setParameter('uGhibliBaseColor', [baseColor.r, baseColor.g, baseColor.b]);
    material.setParameter('uGhibliShadowColor', [shadowColor.r, shadowColor.g, shadowColor.b]);
    material.setParameter('uGhibliSunDirection', [this.sunDirection.x, this.sunDirection.y, this.sunDirection.z]);

    material.shaderChunksVersion = '2.20';
    material.getShaderChunks(pc.SHADERLANGUAGE_GLSL).set('diffusePS', `
uniform vec3 uGhibliBaseColor;
uniform vec3 uGhibliShadowColor;
uniform vec3 uGhibliSunDirection;

float ghibliHash(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
}

void getAlbedo() {
    float ndl = clamp(dot(normalize(dNormalW), normalize(-uGhibliSunDirection)), 0.0, 1.0);
    float watercolorRamp = smoothstep(0.04, 0.92, ndl);
    float paperNoise = (ghibliHash(gl_FragCoord.xy * 0.42) - 0.5) * 0.075;
    vec3 litColor = mix(uGhibliShadowColor, uGhibliBaseColor, watercolorRamp);
    litColor += vec3(paperNoise);
    dAlbedo = clamp(litColor, vec3(0.0), vec3(1.0));
}
`);

    material.getShaderChunks(pc.SHADERLANGUAGE_WGSL).set('diffusePS', `
uniform uGhibliBaseColor: vec3f;
uniform uGhibliShadowColor: vec3f;
uniform uGhibliSunDirection: vec3f;

fn ghibli_hash(p_in: vec2f) -> f32 {
    var p = fract(p_in * vec2f(123.34, 456.21));
    p = p + dot(p, p + vec2f(45.32));
    return fract(p.x * p.y);
}

fn getAlbedo() {
    let ndl = clamp(dot(normalize(dNormalW), normalize(-uniform.uGhibliSunDirection)), 0.0, 1.0);
    let watercolorRamp = smoothstep(0.04, 0.92, ndl);
    let paperNoise = (ghibli_hash(pcPosition.xy * 0.42) - 0.5) * 0.075;
    let litColor = mix(uniform.uGhibliShadowColor, uniform.uGhibliBaseColor, watercolorRamp);
    dAlbedo = clamp(litColor + vec3f(paperNoise), vec3f(0.0), vec3f(1.0));
}
`);
  }

  private configureDepthOfField(camera: pc.Entity): void {
    if (!camera.camera) return;

    camera.camera.aperture = 2.8;
    this.cameraFrame = new pc.CameraFrame(this.app, camera.camera);
    this.cameraFrame.rendering.renderTargetScale = 0.82;
    this.cameraFrame.rendering.sceneDepthMap = true;
    this.cameraFrame.taa.enabled = true;
    this.cameraFrame.taa.jitter = 0.55;
    this.cameraFrame.dof.enabled = true;
    this.cameraFrame.dof.nearBlur = false;
    this.cameraFrame.dof.focusDistance = 6.2;
    this.cameraFrame.dof.focusRange = 3.4;
    this.cameraFrame.dof.blurRadius = 3.1;
    this.cameraFrame.dof.blurRings = 4;
    this.cameraFrame.dof.blurRingPoints = 5;
    this.cameraFrame.dof.highQuality = false;
    const grading = this.cameraFrame.grading;
    grading.enabled = true;
    grading.brightness = 1.04;
    grading.contrast = 1.08;
    grading.saturation = 1.12;
    grading.tint = new pc.Color(1.0, 0.94, 0.86);
    this.cameraFrame.update();
    this.cameraFrame.enabled = true;
  }

  private configureSplatBudget(): void {
    const { gsplat } = this.app.scene;
    gsplat.splatBudget = 18000;
    gsplat.minPixelSize = 1.5;
    gsplat.antiAlias = true;
    gsplat.useFog = true;
  }

  private updateRelighting(dt: number): void {
    this.relightTime += dt * 0.055;
    const warmth = 0.5 + Math.sin(this.relightTime) * 0.5;
    const sky = 0.5 + Math.cos(this.relightTime * 0.7) * 0.5;

    if (this.sun?.light) {
      this.sun.light.color = new pc.Color(1.0, 0.62 + warmth * 0.20, 0.38 + warmth * 0.18);
      this.sun.light.intensity = 2.8 + warmth * 0.8;
      this.sun.setEulerAngles(27 + warmth * 12, -46 + sky * 18, 0);
    }

    this.app.scene.ambientLight = new pc.Color(0.64 + sky * 0.18, 0.74 + sky * 0.14, 0.86 + sky * 0.10);

    const sun = this.sunDirection.set(-0.42 + sky * 0.12, -0.64, -0.64 + warmth * 0.18).normalize();
    for (const material of this.raceMaterials) {
      material.setParameter('uGhibliSunDirection', [sun.x, sun.y, sun.z]);
    }
  }
}

let registered = false;

export function registerGhibliCarScene(app: pc.Application): void {
  if (registered) return;

  (pc.registerScript as (script: typeof pc.ScriptType, name?: string, app?: pc.Application) => void)(
    GhibliCarScene,
    GhibliCarScene.scriptName,
    app,
  );
  applyDecoratedAttributes(GhibliCarScene as ScriptCtor);
  registered = true;
}
