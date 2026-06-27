import * as pc from 'playcanvas';

class WatercolorCompositeEffect extends pc.PostEffect {
  private readonly shader: pc.Shader;
  private time = 0;

  constructor(device: pc.GraphicsDevice) {
    super(device);

    const vertexWGSL = /* wgsl */ `
        attribute vertex_position: vec2f;
        varying vUv0: vec2f;

        @vertex
        fn vertexMain(input: VertexInput) -> VertexOutput {
          var output: VertexOutput;
          output.position = vec4f(input.vertex_position, 0.5, 1.0);
          output.vUv0 = input.vertex_position * 0.5 + vec2f(0.5);
          return output;
        }
      `;

    const fragmentWGSL = /* wgsl */ `
        varying vUv0: vec2f;
        var uColorBuffer: texture_2d<f32>;
        var uColorBufferSampler: sampler;
        uniform uResolution: vec2f;
        uniform uTime: f32;

        fn hash21(p: vec2f) -> f32 {
          let q = fract(p * vec2f(123.34, 456.21));
          return fract(q.x * q.y * (q.x + q.y));
        }

        fn noise2(p: vec2f) -> f32 {
          let i = floor(p);
          let f = fract(p);
          let a = hash21(i);
          let b = hash21(i + vec2f(1.0, 0.0));
          let c = hash21(i + vec2f(0.0, 1.0));
          let d = hash21(i + vec2f(1.0, 1.0));
          let u = f * f * (3.0 - 2.0 * f);
          return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
        }

        fn paper(p: vec2f) -> f32 {
          var v = 0.0;
          var amp = 0.55;
          var freq = 1.0;
          for (var i = 0; i < 4; i = i + 1) {
            v += noise2(p * freq) * amp;
            freq *= 2.17;
            amp *= 0.5;
          }
          return v;
        }

        @fragment
        fn fragmentMain(input: FragmentInput) -> FragmentOutput {
          var output: FragmentOutput;

          let uv = input.vUv0;
          let texel = 1.0 / uniform.uResolution;
          let base = textureSample(uColorBuffer, uColorBufferSampler, uv).rgb;
          let blur =
            textureSample(uColorBuffer, uColorBufferSampler, uv + vec2f(texel.x, 0.0)).rgb +
            textureSample(uColorBuffer, uColorBufferSampler, uv - vec2f(texel.x, 0.0)).rgb +
            textureSample(uColorBuffer, uColorBufferSampler, uv + vec2f(0.0, texel.y)).rgb +
            textureSample(uColorBuffer, uColorBufferSampler, uv - vec2f(0.0, texel.y)).rgb;

          let pixelUv = floor(uv * uniform.uResolution / 1.35) * 1.35 / uniform.uResolution;
          let snapped = textureSample(uColorBuffer, uColorBufferSampler, pixelUv).rgb;
          let bloom = blur * 0.18;
          let grain = paper(uv * uniform.uResolution * 0.06 + vec2f(uniform.uTime * 0.03, -uniform.uTime * 0.02));
          let vignette = smoothstep(0.98, 0.24, distance(uv, vec2f(0.5)));
          let lifted = mix(snapped, bloom, 0.08) * (0.96 + grain * 0.05);
          let tone = floor(lifted * 7.0) / 7.0;
          let warm = tone + vec3f(0.01, 0.004, -0.002) * vignette;

          output.color = vec4f(warm, 1.0);
          return output;
        }
      `;

    this.shader = pc.createShaderFromCode(
      device,
      vertexWGSL,
      fragmentWGSL,
      'watercolor-composite-v2',
      {
        vertex_position: pc.SEMANTIC_POSITION,
      },
      false,
      {
        shaderLanguage: pc.SHADERLANGUAGE_WGSL,
        fragmentOutputTypes: 'vec4',
      },
    );
  }

  setTime(time: number): void {
    this.time = time;
  }

  render(inputTarget: pc.RenderTarget, outputTarget: pc.RenderTarget, rect?: pc.Vec4): void {
    const colorBuffer = inputTarget.colorBuffer;
    this.device.scope.resolve('uColorBuffer').setValue(colorBuffer);
    this.device.scope.resolve('uResolution').setValue([colorBuffer.width, colorBuffer.height]);
    this.device.scope.resolve('uTime').setValue(this.time);
    this.drawQuad(outputTarget ?? null, this.shader, rect);
  }
}

class PremiumGhibliRacer {
  private readonly app: pc.Application;
  private readonly canvas: HTMLCanvasElement;
  private readonly root: pc.Entity;
  private readonly carRoot = new pc.Entity('ghibli-racer');
  private readonly roadRoot = new pc.Entity('track-root');
  private readonly worldRoot = new pc.Entity('world-root');
  private readonly wheels: pc.Entity[] = [];
  private readonly animatedMaterials: pc.Material[] = [];
  private readonly speedLabel: HTMLDivElement;
  private readonly lapLabel: HTMLDivElement;
  private readonly introOverlay: HTMLDivElement;
  private readonly countdownLabel: HTMLDivElement;
  private readonly postEffect: WatercolorCompositeEffect;
  private readonly trackPoints: pc.Vec3[] = [];
  private readonly trackTangents: pc.Vec3[] = [];
  private camera!: pc.Entity;
  private sun!: pc.Entity;
  private time = 0;
  private trackT = 0;
  private speed = 0;

  constructor(app: pc.Application, canvas: HTMLCanvasElement) {
    this.app = app;
    this.canvas = canvas;
    this.canvas.style.background = '#d7e7f0';
    this.root = app.root;

    const hud = this.createHud();
    this.speedLabel = hud.speedLabel;
    this.lapLabel = hud.lapLabel;
    this.introOverlay = hud.introOverlay;
    this.countdownLabel = hud.countdownLabel;

    this.configureApp();
    this.createCamera();
    this.createLighting();
    this.createSky();
    this.buildTrackSpline();
    this.createTerrain();
    this.createTrack();
    this.createCar();
    this.createScenery();

    this.root.addChild(this.worldRoot);
    this.worldRoot.addChild(this.roadRoot);
    this.worldRoot.addChild(this.carRoot);

    this.postEffect = new WatercolorCompositeEffect(this.app.graphicsDevice);
    this.camera.camera?.postEffects.addEffect(this.postEffect);

    this.app.on('update', (dt: number) => this.update(dt));
  }

  private configureApp(): void {
    this.app.setCanvasFillMode(pc.FILLMODE_FILL_WINDOW);
    this.app.setCanvasResolution(pc.RESOLUTION_AUTO);
    this.app.graphicsDevice.maxPixelRatio = Math.min(window.devicePixelRatio || 1, 2);

    const scene = this.app.scene as pc.Scene & { exposure?: number };
    scene.ambientLight = new pc.Color(0.52, 0.56, 0.66);
    scene.exposure = 1.0;
    scene.fog.type = pc.FOG_EXP2;
    scene.fog.color = new pc.Color(0.14, 0.16, 0.19);
    scene.fog.density = 0.018;
    scene.skyboxMip = 0;
  }

  private createHud(): { speedLabel: HTMLDivElement; lapLabel: HTMLDivElement; introOverlay: HTMLDivElement; countdownLabel: HTMLDivElement } {
    const overlay = document.createElement('div');
    overlay.style.cssText = [
      'position:fixed',
      'inset:0',
      'pointer-events:none',
      'font-family:"Courier New",monospace',
      'color:#f2f0ea',
      'z-index:20',
    ].join(';');

    const style = document.createElement('style');
    style.textContent = `
      @keyframes atelierPulse {
        0% { transform: translateY(0px) scale(1); opacity: 0.9; }
        50% { transform: translateY(-3px) scale(1.01); opacity: 1; }
        100% { transform: translateY(0px) scale(1); opacity: 0.92; }
      }
    `;
    document.head.appendChild(style);

    const introOverlay = document.createElement('div');
    introOverlay.style.cssText = [
      'position:absolute',
      'inset:0',
      'display:grid',
      'place-items:center',
      'background:radial-gradient(circle at 50% 38%, rgba(70,76,88,0.16), rgba(12,14,18,0.58) 45%, rgba(10,11,14,0.92) 100%)',
      'transition:opacity 700ms ease',
    ].join(';');

    const introCard = document.createElement('div');
    introCard.style.cssText = [
      'width:min(620px, calc(100vw - 32px))',
      'padding:28px 28px 18px',
      'border-radius:24px',
      'background:rgba(29,31,36,0.86)',
      'border:1px solid rgba(255,255,255,0.08)',
      'box-shadow:0 24px 80px rgba(0,0,0,0.36)',
      'backdrop-filter:blur(12px)',
      'text-align:center',
      'animation:atelierPulse 4s ease-in-out infinite',
    ].join(';');
    introCard.innerHTML = `
      <div style="font-size:12px;letter-spacing:0.34em;text-transform:uppercase;opacity:0.62">PlayCanvas V2 / WebGPU / 2.5D</div>
      <div style="margin-top:10px;font-size:clamp(34px,7vw,68px);line-height:0.94;letter-spacing:0.02em;">Turbo Drift Atelier</div>
      <div style="margin-top:12px;font-size:15px;line-height:1.55;opacity:0.8;">A real-time 3D car rendered to read like a premium 2.5D racer sheet: compressed lensing, hard band shading, deep contour ink, and sprite-style silhouette clarity without using sprites.</div>
      <div style="margin-top:16px;height:4px;border-radius:999px;background:rgba(255,255,255,0.08);overflow:hidden;">
        <div style="width:100%;height:100%;transform-origin:left;background:linear-gradient(90deg,#fb6b46,#e9402f,#ffc15c);animation:atelierPulse 2.2s ease-in-out infinite;"></div>
      </div>
    `;
    introOverlay.appendChild(introCard);

    const badge = document.createElement('div');
    badge.style.cssText = [
      'position:absolute',
      'left:24px',
      'top:24px',
      'padding:14px 18px',
      'background:rgba(27,29,34,0.8)',
      'border:1px solid rgba(255,255,255,0.08)',
      'backdrop-filter:blur(8px)',
      'box-shadow:0 18px 40px rgba(0,0,0,0.2)',
      'border-radius:18px',
      'max-width:320px',
    ].join(';');
    badge.innerHTML = `
      <div style="font-size:12px;letter-spacing:0.22em;text-transform:uppercase;opacity:0.72">Static / Reference</div>
      <div style="font-size:28px;line-height:1.1;margin-top:6px">2.5D Racer Render</div>
      <div style="font-size:13px;line-height:1.5;margin-top:8px;opacity:0.78">Directional sprite-sheet energy, but fully modeled and shaded in WebGPU.</div>
    `;

    const cluster = document.createElement('div');
    cluster.style.cssText = [
      'position:absolute',
      'right:24px',
      'bottom:24px',
      'display:grid',
      'gap:12px',
    ].join(';');

    const statCard = (title: string): HTMLDivElement => {
      const card = document.createElement('div');
      card.style.cssText = [
        'padding:12px 16px',
        'min-width:144px',
        'background:rgba(27,29,34,0.8)',
        'border:1px solid rgba(255,255,255,0.08)',
        'border-radius:16px',
        'box-shadow:0 16px 30px rgba(0,0,0,0.16)',
        'text-align:right',
      ].join(';');
      const label = document.createElement('div');
      label.textContent = title;
      label.style.cssText = 'font-size:11px;letter-spacing:0.22em;text-transform:uppercase;opacity:0.6;';
      const value = document.createElement('div');
      value.style.cssText = 'font-size:30px;line-height:1.05;margin-top:4px;';
      card.append(label, value);
      cluster.appendChild(card);
      return value;
    };

    const speedLabel = statCard('Speed');
    const lapLabel = statCard('Race State');
    speedLabel.textContent = '084';
    lapLabel.textContent = 'Rolling';

    const countdownLabel = document.createElement('div');
    countdownLabel.style.cssText = [
      'position:absolute',
      'left:50%',
      'top:50%',
      'transform:translate(-50%, -50%)',
      'padding:18px 28px',
      'border-radius:22px',
      'background:rgba(27,29,34,0.88)',
      'border:1px solid rgba(255,255,255,0.08)',
      'box-shadow:0 24px 60px rgba(0,0,0,0.28)',
      'font-size:72px',
      'line-height:1',
      'opacity:0',
      'transition:opacity 220ms ease, transform 220ms ease',
    ].join(';');
    countdownLabel.textContent = '3';

    const footer = document.createElement('div');
    footer.style.cssText = [
      'position:absolute',
      'left:50%',
      'bottom:24px',
      'transform:translateX(-50%)',
      'padding:10px 14px',
      'border-radius:14px',
      'background:rgba(27,29,34,0.82)',
      'border:1px solid rgba(255,255,255,0.08)',
      'font-size:12px',
      'letter-spacing:0.16em',
      'text-transform:uppercase',
      'opacity:0.72',
    ].join(';');
    footer.textContent = 'Autopilot showcase / compressed 3-4 view / inked NPR composite';

    overlay.append(introOverlay, badge, cluster, countdownLabel, footer);
    document.body.appendChild(overlay);

    return { speedLabel, lapLabel, introOverlay, countdownLabel };
  }

  private createCamera(): void {
    this.camera = new pc.Entity('camera');
    this.camera.addComponent('camera', {
      clearColor: new pc.Color(0.67, 0.81, 0.92, 1),
      nearClip: 0.05,
      farClip: 400,
      fov: 29,
    });
    this.root.addChild(this.camera);
  }

  private createLighting(): void {
    this.sun = new pc.Entity('sun');
    this.sun.addComponent('light', {
      type: 'directional',
      color: new pc.Color(1.0, 0.82, 0.58),
      intensity: 2.5,
      castShadows: true,
      shadowDistance: 96,
      shadowResolution: 2048,
      shadowType: pc.SHADOW_PCSS_32F,
      shadowBias: 0.08,
      normalOffsetBias: 0.03,
      shadowUpdateMode: pc.SHADOWUPDATE_REALTIME,
    });
    this.sun.setEulerAngles(39, -42, 0);
    this.root.addChild(this.sun);

    const skyFill = new pc.Entity('sky-fill');
    skyFill.addComponent('light', {
      type: 'omni',
      color: new pc.Color(0.48, 0.54, 0.66),
      intensity: 0.95,
      range: 120,
      castShadows: false,
    });
    skyFill.setLocalPosition(-12, 18, 14);
    this.root.addChild(skyFill);

    const bounce = new pc.Entity('ground-bounce');
    bounce.addComponent('light', {
      type: 'omni',
      color: new pc.Color(0.52, 0.26, 0.21),
      intensity: 0.32,
      range: 50,
      castShadows: false,
    });
    bounce.setLocalPosition(0, 3.5, -12);
    this.root.addChild(bounce);
  }

  private createSky(): void {
    const skyMat = new pc.ShaderMaterial({
      uniqueName: 'sheet-sky',
      attributes: {
        vertex_position: pc.SEMANTIC_POSITION,
        aUv0: pc.SEMANTIC_TEXCOORD0,
      },
      vertexWGSL: /* wgsl */ `
        attribute vertex_position: vec3f;
        attribute aUv0: vec2f;
        uniform matrix_model: mat4x4f;
        uniform matrix_viewProjection: mat4x4f;
        varying uv0: vec2f;

        @vertex
        fn vertexMain(input: VertexInput) -> VertexOutput {
          var output: VertexOutput;
          let world = uniform.matrix_model * vec4f(input.vertex_position, 1.0);
          output.position = uniform.matrix_viewProjection * world;
          output.uv0 = input.aUv0;
          return output;
        }
      `,
      fragmentWGSL: /* wgsl */ `
        varying uv0: vec2f;

        fn hash21(p: vec2f) -> f32 {
          let q = fract(p * vec2f(113.4, 217.8));
          return fract(q.x * q.y * (q.x + q.y));
        }

        fn noise2(p: vec2f) -> f32 {
          let i = floor(p);
          let f = fract(p);
          let a = hash21(i);
          let b = hash21(i + vec2f(1.0, 0.0));
          let c = hash21(i + vec2f(0.0, 1.0));
          let d = hash21(i + vec2f(1.0, 1.0));
          let u = f * f * (3.0 - 2.0 * f);
          return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
        }

        @fragment
        fn fragmentMain(input: FragmentInput) -> FragmentOutput {
          var output: FragmentOutput;
          let uv = input.uv0;
          let horizon = smoothstep(0.0, 0.7, uv.y);
          let band = step(0.42, noise2(vec2f(uv.x * 2.0, uv.y * 5.0)));
          let base = mix(vec3f(0.10, 0.11, 0.13), vec3f(0.18, 0.20, 0.24), horizon);
          let color = mix(base, vec3f(0.28, 0.22, 0.20), band * 0.06 * (1.0 - horizon));
          output.color = vec4f(color, 1.0);
          return output;
        }
      `,
    });
    skyMat.cull = pc.CULLFACE_FRONT;
    skyMat.depthWrite = false;
    skyMat.depthTest = false;
    skyMat.update();

    const skyMesh = pc.createSphere(this.app.graphicsDevice, { radius: 1, latitudeBands: 40, longitudeBands: 40 });
    const sky = new pc.Entity('sky-dome');
    sky.addComponent('render', {
      meshInstances: [new pc.MeshInstance(skyMesh, skyMat)],
      castShadows: false,
      receiveShadows: false,
    });
    sky.setLocalScale(280, 140, 280);
    sky.setLocalPosition(0, 16, 0);
    this.root.addChild(sky);
  }

  private buildTrackSpline(): void {
    const count = 180;
    for (let i = 0; i < count; i += 1) {
      const t = (i / count) * Math.PI * 2;
      const r = 26 + Math.sin(t * 2.0) * 3.6 + Math.cos(t * 3.0) * 1.2;
      const x = Math.cos(t) * (r + Math.sin(t * 4.0) * 1.3);
      const z = Math.sin(t) * (r * 0.68 + Math.cos(t * 3.0) * 2.0);
      const y = Math.sin(t * 2.0 + 0.3) * 0.18 + Math.cos(t * 5.0) * 0.06;
      this.trackPoints.push(new pc.Vec3(x, y, z));
    }

    for (let i = 0; i < count; i += 1) {
      const a = this.trackPoints[(i + count - 1) % count];
      const b = this.trackPoints[(i + 1) % count];
      this.trackTangents.push(b.clone().sub(a).normalize());
    }
  }

  private createTerrain(): void {
    const terrainMat = this.createStandardMaterial({
      diffuse: new pc.Color(0.21, 0.24, 0.20),
      emissive: new pc.Color(0.01, 0.01, 0.01),
      gloss: 0.08,
      useLighting: true,
    });

    const terrainMesh = pc.createPlane(this.app.graphicsDevice, {
      width: 190,
      length: 190,
      widthSegments: 60,
      lengthSegments: 60,
    });

    const terrain = new pc.Entity('terrain');
    terrain.addComponent('render', {
      meshInstances: [new pc.MeshInstance(terrainMesh, terrainMat)],
      castShadows: false,
      receiveShadows: true,
    });
    terrain.setLocalEulerAngles(-90, 0, 0);
    terrain.setLocalPosition(0, -0.45, 0);
    this.worldRoot.addChild(terrain);

    this.createInstancedGrass();
  }

  private createTrack(): void {
    const roadMesh = this.createRibbonMesh(this.trackPoints, 3.2, 4.8);
    const shoulderMesh = this.createRibbonMesh(this.trackPoints, 4.4, 6.7);
    const stripeMesh = this.createRibbonMesh(this.trackPoints, 0.14, 0.28);

    const shoulderMat = this.createStandardMaterial({
      diffuse: new pc.Color(0.33, 0.27, 0.24),
      gloss: 0.08,
      useLighting: true,
    });
    const roadMat = this.createRoadMaterial();
    const stripeMat = this.createStandardMaterial({
      diffuse: new pc.Color(0.95, 0.87, 0.54),
      emissive: new pc.Color(0.07, 0.05, 0.01),
      gloss: 0.15,
      useLighting: true,
    });

    const shoulder = new pc.Entity('track-shoulder');
    shoulder.addComponent('render', {
      meshInstances: [new pc.MeshInstance(shoulderMesh, shoulderMat)],
      castShadows: false,
      receiveShadows: true,
    });

    const road = new pc.Entity('road');
    road.addComponent('render', {
      meshInstances: [new pc.MeshInstance(roadMesh, roadMat)],
      castShadows: false,
      receiveShadows: true,
    });
    road.setLocalPosition(0, 0.02, 0);

    const stripe = new pc.Entity('stripe');
    stripe.addComponent('render', {
      meshInstances: [new pc.MeshInstance(stripeMesh, stripeMat)],
      castShadows: false,
      receiveShadows: false,
    });
    stripe.setLocalPosition(0, 0.032, 0);

    this.roadRoot.addChild(shoulder);
    this.roadRoot.addChild(road);
    this.roadRoot.addChild(stripe);
  }

  private createCar(): void {
    const bodyMaterial = this.createPainterlyCarMaterial(
      new pc.Color(0.93, 0.24, 0.16),
      new pc.Color(0.98, 0.43, 0.24),
      new pc.Color(0.36, 0.07, 0.08),
    );
    const accentMaterial = this.createPainterlyCarMaterial(
      new pc.Color(0.99, 0.74, 0.19),
      new pc.Color(1.0, 0.84, 0.43),
      new pc.Color(0.36, 0.12, 0.04),
    );

    const chrome = this.createStandardMaterial({
      diffuse: new pc.Color(0.82, 0.82, 0.84),
      specular: new pc.Color(1, 1, 1),
      gloss: 0.9,
      metalness: 0.7,
      useMetalness: true,
      useLighting: true,
    });

    const glass = this.createStandardMaterial({
      diffuse: new pc.Color(0.82, 0.95, 1.0),
      emissive: new pc.Color(0.03, 0.05, 0.06),
      opacity: 0.32,
      blendType: pc.BLEND_NORMAL,
      cull: pc.CULLFACE_NONE,
      gloss: 0.92,
      useLighting: true,
    });
    glass.depthWrite = false;
    glass.update();

    const interior = this.createStandardMaterial({
      diffuse: new pc.Color(0.42, 0.21, 0.14),
      gloss: 0.35,
      useLighting: true,
    });
    const darkRubber = this.createStandardMaterial({
      diffuse: new pc.Color(0.13, 0.115, 0.11),
      gloss: 0.22,
      useLighting: true,
    });

    const bodyMesh = this.createCarBodyMesh();
    const body = this.createMeshEntity('body-shell', bodyMesh, bodyMaterial, true, true);
    const outline = this.createOutlineEntity('body-outline', bodyMesh, 0.038);
    body.addChild(outline);
    this.carRoot.addChild(body);

    const cabinGlass = this.createMeshEntity('cabin-glass', this.createCabinGlassMesh(), glass, false, false);
    this.carRoot.addChild(cabinGlass);

    const floor = this.createBoxEntity('floor-pan', new pc.Vec3(0, 0.38, 0), new pc.Vec3(1.6, 0.16, 3.46), darkRubber);
    this.carRoot.addChild(floor);

    const bumperFront = this.createBoxEntity('front-bumper', new pc.Vec3(0, 0.56, 2.03), new pc.Vec3(1.44, 0.12, 0.18), chrome);
    const bumperRear = this.createBoxEntity('rear-bumper', new pc.Vec3(0, 0.57, -2.0), new pc.Vec3(1.46, 0.12, 0.2), chrome);
    const hoodStripe = this.createBoxEntity('hood-stripe', new pc.Vec3(0, 0.92, 0.64), new pc.Vec3(0.32, 0.02, 2.0), accentMaterial);
    this.carRoot.addChild(bumperFront);
    this.carRoot.addChild(bumperRear);
    this.carRoot.addChild(hoodStripe);

    const grille = this.createBoxEntity('grille', new pc.Vec3(0, 0.73, 1.92), new pc.Vec3(0.88, 0.22, 0.08), chrome);
    const grilleSlatLeft = this.createBoxEntity('grille-slat-left', new pc.Vec3(-0.16, 0.73, 1.97), new pc.Vec3(0.02, 0.18, 0.04), darkRubber);
    const grilleSlatRight = this.createBoxEntity('grille-slat-right', new pc.Vec3(0.16, 0.73, 1.97), new pc.Vec3(0.02, 0.18, 0.04), darkRubber);
    this.carRoot.addChild(grille);
    this.carRoot.addChild(grilleSlatLeft);
    this.carRoot.addChild(grilleSlatRight);

    const headlightL = this.createSphereEntity('headlight-l', new pc.Vec3(-0.67, 0.81, 1.8), 0.18, chrome);
    const headlightR = this.createSphereEntity('headlight-r', new pc.Vec3(0.67, 0.81, 1.8), 0.18, chrome);
    const tailL = this.createBoxEntity('tail-l', new pc.Vec3(-0.62, 0.74, -1.86), new pc.Vec3(0.24, 0.1, 0.05), accentMaterial);
    const tailR = this.createBoxEntity('tail-r', new pc.Vec3(0.62, 0.74, -1.86), new pc.Vec3(0.24, 0.1, 0.05), accentMaterial);
    this.carRoot.addChild(headlightL);
    this.carRoot.addChild(headlightR);
    this.carRoot.addChild(tailL);
    this.carRoot.addChild(tailR);

    const mirrorL = this.createMirror(new pc.Vec3(-1.0, 1.25, 0.38), chrome, bodyMaterial);
    const mirrorR = this.createMirror(new pc.Vec3(1.0, 1.25, 0.38), chrome, bodyMaterial);
    this.carRoot.addChild(mirrorL);
    this.carRoot.addChild(mirrorR);

    const seats = this.createInteriorSeats(interior);
    const wheel = this.createSteeringWheel(chrome, interior);
    this.carRoot.addChild(seats);
    this.carRoot.addChild(wheel);

    const wheelOffsets = [
      new pc.Vec3(-1.16, 0.42, 1.18),
      new pc.Vec3(1.16, 0.42, 1.18),
      new pc.Vec3(-1.16, 0.42, -1.16),
      new pc.Vec3(1.16, 0.42, -1.16),
    ];

    for (const offset of wheelOffsets) {
      const wheelEntity = this.createWheelAssembly(chrome, darkRubber, interior);
      wheelEntity.setLocalPosition(offset);
      if (offset.x > 0) {
        wheelEntity.setLocalScale(-1, 1, 1);
      }
      this.wheels.push(wheelEntity);
      this.carRoot.addChild(wheelEntity);

      const suspension = this.createSuspensionAssembly(chrome, darkRubber);
      suspension.setLocalPosition(offset.clone().add(new pc.Vec3(offset.x * 0.03, 0.16, 0)));
      this.carRoot.addChild(suspension);
    }

    const shadow = this.createBlobShadow();
    this.carRoot.addChild(shadow);
  }

  private createScenery(): void {
    const treeLeaf = this.createStandardMaterial({
      diffuse: new pc.Color(0.28, 0.54, 0.29),
      gloss: 0.1,
      useLighting: true,
    });
    const treeBark = this.createStandardMaterial({
      diffuse: new pc.Color(0.44, 0.30, 0.19),
      gloss: 0.08,
      useLighting: true,
    });

    const flowerMat = this.createStandardMaterial({
      diffuse: new pc.Color(0.99, 0.91, 0.73),
      gloss: 0.05,
      useLighting: true,
    });

    for (let i = 0; i < 36; i += 1) {
      const angle = (i / 36) * Math.PI * 2;
      const radius = 42 + Math.sin(i * 1.7) * 8;
      const base = new pc.Vec3(Math.cos(angle) * radius, 0, Math.sin(angle) * radius);
      const tree = new pc.Entity(`tree-${i}`);
      const trunk = this.createCylinderEntity('trunk', new pc.Vec3(0, 1.7, 0), new pc.Vec3(0.34, 1.8, 0.34), treeBark);
      const crownA = this.createSphereEntity('crown-a', new pc.Vec3(0, 3.8, 0), 1.7, treeLeaf);
      const crownB = this.createSphereEntity('crown-b', new pc.Vec3(0.8, 3.4, 0.3), 1.2, treeLeaf);
      const crownC = this.createSphereEntity('crown-c', new pc.Vec3(-0.7, 3.15, -0.4), 1.0, treeLeaf);
      tree.addChild(trunk);
      tree.addChild(crownA);
      tree.addChild(crownB);
      tree.addChild(crownC);
      tree.setLocalPosition(base);
      tree.setLocalScale(0.92 + (i % 5) * 0.08, 0.92 + (i % 4) * 0.09, 0.92 + (i % 3) * 0.05);
      this.worldRoot.addChild(tree);
    }

    for (let i = 0; i < 120; i += 1) {
      const seed = i * 0.61803398875;
      const angle = seed * Math.PI * 2;
      const radius = 18 + (i % 9) * 4.7;
      const flower = this.createCylinderEntity('flower', new pc.Vec3(0, 0.14, 0), new pc.Vec3(0.08, 0.15 + (i % 3) * 0.03, 0.08), flowerMat);
      flower.setLocalPosition(
        Math.cos(angle) * radius + Math.sin(i * 1.23) * 3.2,
        0,
        Math.sin(angle) * radius + Math.cos(i * 1.41) * 2.5,
      );
      this.worldRoot.addChild(flower);
    }
  }

  private createInstancedGrass(): void {
    const bladeMesh = this.createGrassBladeMesh();
    const bladeMaterial = this.createGrassMaterial();
    const node = new pc.GraphNode('grass-cluster');
    const meshInstance = new pc.MeshInstance(bladeMesh, bladeMaterial, node);
    meshInstance.receiveShadow = true;
    meshInstance.castShadow = true;

    const count = 1600;
    const format = pc.VertexFormat.getDefaultInstancingFormat(this.app.graphicsDevice);
    const vb = new pc.VertexBuffer(this.app.graphicsDevice, format, count, { usage: pc.BUFFER_STATIC });
    const data = new Float32Array(vb.lock());

    for (let i = 0; i < count; i += 1) {
      const angle = i * 0.61803398875 * Math.PI * 2;
      const radius = Math.sqrt((i + 0.5) / count) * 92;
      const x = Math.cos(angle) * radius + Math.sin(i * 1.27) * 1.2;
      const z = Math.sin(angle) * radius + Math.cos(i * 1.71) * 1.2;
      const y = -0.42;
      const scale = 0.55 + (i % 11) * 0.08;
      const yaw = angle * 0.7 + (i % 5) * 0.33;
      const matrix = new pc.Mat4().setTRS(
        new pc.Vec3(x, y, z),
        new pc.Quat().setFromEulerAngles(0, yaw * pc.math.RAD_TO_DEG, 0),
        new pc.Vec3(scale, scale * (1.2 + (i % 7) * 0.08), scale),
      );
      data.set(matrix.data as unknown as number[], i * 16);
    }
    vb.unlock();

    meshInstance.setInstancing(vb);
    meshInstance.instancingCount = count;

    const grass = new pc.Entity('instanced-grass');
    grass.addComponent('render', {
      meshInstances: [meshInstance],
      castShadows: true,
      receiveShadows: true,
    });
    this.worldRoot.addChild(grass);

    this.animatedMaterials.push(bladeMaterial);
  }

  private createPainterlyCarMaterial(base: pc.Color, mid: pc.Color, shadow: pc.Color): pc.ShaderMaterial {
    const material = new pc.ShaderMaterial({
      uniqueName: `painterly-${base.toString(true)}`,
      attributes: {
        vertex_position: pc.SEMANTIC_POSITION,
        vertex_normal: pc.SEMANTIC_NORMAL,
        aUv0: pc.SEMANTIC_TEXCOORD0,
      },
      vertexWGSL: /* wgsl */ `
        attribute vertex_position: vec3f;
        attribute vertex_normal: vec3f;
        attribute aUv0: vec2f;

        uniform matrix_model: mat4x4f;
        uniform matrix_viewProjection: mat4x4f;
        uniform matrix_normal: mat3x3f;

        varying uv0: vec2f;
        varying normalW: vec3f;
        varying worldPos: vec3f;
        varying localPos: vec3f;
        varying screenUv: vec2f;

        @vertex
        fn vertexMain(input: VertexInput) -> VertexOutput {
          var output: VertexOutput;
          let world = uniform.matrix_model * vec4f(input.vertex_position, 1.0);
          let clip = uniform.matrix_viewProjection * world;
          output.position = clip;
          output.uv0 = input.aUv0;
          output.normalW = normalize(uniform.matrix_normal * input.vertex_normal);
          output.worldPos = world.xyz;
          output.localPos = input.vertex_position;
          output.screenUv = clip.xy / max(clip.w, 0.0001) * 0.5 + vec2f(0.5);
          return output;
        }
      `,
      fragmentWGSL: /* wgsl */ `
        varying uv0: vec2f;
        varying normalW: vec3f;
        varying worldPos: vec3f;
        varying localPos: vec3f;
        varying screenUv: vec2f;

        uniform uSunDirection: vec3f;
        uniform uSunColor: vec3f;
        uniform uSkyColor: vec3f;
        uniform uBaseColor: vec3f;
        uniform uMidColor: vec3f;
        uniform uShadowColor: vec3f;
        uniform uTime: f32;

        fn hash21(p: vec2f) -> f32 {
          let q = fract(p * vec2f(234.34, 435.21));
          return fract(q.x * q.y * (q.x + q.y));
        }

        fn noise2(p: vec2f) -> f32 {
          let i = floor(p);
          let f = fract(p);
          let a = hash21(i);
          let b = hash21(i + vec2f(1.0, 0.0));
          let c = hash21(i + vec2f(0.0, 1.0));
          let d = hash21(i + vec2f(1.0, 1.0));
          let u = f * f * (3.0 - 2.0 * f);
          return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
        }

        fn fbm(p: vec2f) -> f32 {
          var v = 0.0;
          var a = 0.5;
          var f = 1.0;
          for (var i = 0; i < 5; i = i + 1) {
            v += noise2(p * f) * a;
            f *= 2.02;
            a *= 0.5;
          }
          return v;
        }

        @fragment
        fn fragmentMain(input: FragmentInput) -> FragmentOutput {
          var output: FragmentOutput;
          let n = normalize(input.normalW);
          let sunN = saturate(dot(n, -normalize(uniform.uSunDirection)));
          let hemi = saturate(n.y * 0.5 + 0.5);

          let lightBand = select(0.0, 1.0, sunN > 0.28) + select(0.0, 1.0, sunN > 0.62);
          let stepped = lightBand / 2.0;

          var color = mix(uniform.uShadowColor, uniform.uMidColor, stepped);
          color = mix(color, uniform.uBaseColor, select(0.0, 1.0, sunN > 0.62));
          color += uniform.uSkyColor * hemi * 0.08;

          let highlight = pow(saturate(dot(reflect(normalize(uniform.uSunDirection), n), vec3f(0.0, 0.0, 1.0))), 7.0);
          color += uniform.uSunColor * select(0.0, 0.11, highlight > 0.4);

          let hatchUv = floor(input.screenUv * vec2f(540.0, 320.0)) + vec2f(input.worldPos.x * 5.0, input.worldPos.z * 4.0);
          let hatchA = abs(sin(hatchUv.x * 0.8 + fbm(hatchUv * 0.02) * 4.0));
          let hatchB = abs(sin((hatchUv.y + hatchUv.x) * 0.58));
          let hatch = min(hatchA, hatchB);
          let shadowMask = select(1.0, 0.0, sunN > 0.28);
          color *= 1.0 - (1.0 - hatch) * shadowMask * 0.24;

          let paper = fbm(input.worldPos.xz * 3.8 + input.uv0 * 12.0 + vec2f(uniform.uTime * 0.01));
          color *= 0.97 + floor(paper * 4.0) * 0.02;

          let panel = smoothstep(0.035, 0.0, abs(input.localPos.x) - 0.82) * smoothstep(0.5, 1.8, input.localPos.y);
          color = mix(color, color * 0.84, panel * 0.12);

          output.color = vec4f(color, 1.0);
          return output;
        }
      `,
    });
    material.cull = pc.CULLFACE_BACK;
    material.setParameter('uBaseColor', [base.r, base.g, base.b]);
    material.setParameter('uMidColor', [mid.r, mid.g, mid.b]);
    material.setParameter('uShadowColor', [shadow.r, shadow.g, shadow.b]);
    material.setParameter('uSunDirection', [-0.43, -0.76, -0.49]);
    material.setParameter('uSunColor', [1.0, 0.85, 0.65]);
    material.setParameter('uSkyColor', [0.85, 0.9, 1.0]);
    material.setParameter('uTime', 0);
    material.update();
    this.animatedMaterials.push(material);
    return material;
  }

  private createGrassMaterial(): pc.ShaderMaterial {
    const material = new pc.ShaderMaterial({
      uniqueName: 'wind-grass',
      attributes: {
        vertex_position: pc.SEMANTIC_POSITION,
        vertex_normal: pc.SEMANTIC_NORMAL,
        aUv0: pc.SEMANTIC_TEXCOORD0,
        instance_line1: pc.SEMANTIC_ATTR11,
        instance_line2: pc.SEMANTIC_ATTR12,
        instance_line3: pc.SEMANTIC_ATTR14,
        instance_line4: pc.SEMANTIC_ATTR15,
      },
      vertexWGSL: /* wgsl */ `
        attribute vertex_position: vec3f;
        attribute vertex_normal: vec3f;
        attribute aUv0: vec2f;
        attribute instance_line1: vec4f;
        attribute instance_line2: vec4f;
        attribute instance_line3: vec4f;
        attribute instance_line4: vec4f;

        uniform matrix_model: mat4x4f;
        uniform matrix_viewProjection: mat4x4f;
        uniform uTime: f32;

        varying uv0: vec2f;
        varying normalW: vec3f;
        varying worldPos: vec3f;

        @vertex
        fn vertexMain(input: VertexInput) -> VertexOutput {
          var output: VertexOutput;
          let instanceModel = uniform.matrix_model * mat4x4f(
            input.instance_line1,
            input.instance_line2,
            input.instance_line3,
            input.instance_line4
          );

          let root = instanceModel[3].xyz;
          let swayPhase = root.x * 0.24 + root.z * 0.33 + uniform.uTime * 1.7;
          let tipMask = input.aUv0.y * input.aUv0.y;
          var local = input.vertex_position;
          local.x += sin(swayPhase) * 0.13 * tipMask;
          local.z += cos(swayPhase * 1.37) * 0.09 * tipMask;
          local.y += sin(swayPhase * 1.82) * 0.04 * tipMask;

          let world = instanceModel * vec4f(local, 1.0);
          output.position = uniform.matrix_viewProjection * world;
          output.uv0 = input.aUv0;
          output.worldPos = world.xyz;
          output.normalW = normalize((instanceModel * vec4f(input.vertex_normal, 0.0)).xyz);
          return output;
        }
      `,
      fragmentWGSL: /* wgsl */ `
        varying uv0: vec2f;
        varying normalW: vec3f;
        varying worldPos: vec3f;

        uniform uTime: f32;
        uniform uSunDirection: vec3f;

        fn hash21(p: vec2f) -> f32 {
          let q = fract(p * vec2f(123.45, 678.91));
          return fract(q.x * q.y * (q.x + q.y));
        }

        fn noise2(p: vec2f) -> f32 {
          let i = floor(p);
          let f = fract(p);
          let a = hash21(i);
          let b = hash21(i + vec2f(1.0, 0.0));
          let c = hash21(i + vec2f(0.0, 1.0));
          let d = hash21(i + vec2f(1.0, 1.0));
          let u = f * f * (3.0 - 2.0 * f);
          return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
        }

        @fragment
        fn fragmentMain(input: FragmentInput) -> FragmentOutput {
          var output: FragmentOutput;

          let widthMask = smoothstep(0.02, 0.2, input.uv0.x) * (1.0 - smoothstep(0.8, 0.98, input.uv0.x));
          if (widthMask < 0.04) {
            discard;
          }

          let n = normalize(input.normalW);
          let light = select(0.45, 0.9, dot(n, -normalize(uniform.uSunDirection)) > 0.18);
          let base = mix(vec3f(0.14, 0.19, 0.14), vec3f(0.28, 0.38, 0.22), input.uv0.y);
          let breeze = noise2(input.worldPos.xz * 1.6 + vec2f(uniform.uTime * 0.15, -uniform.uTime * 0.07));
          let paper = noise2(input.worldPos.xz * 12.0 + input.uv0 * 8.0);
          let color = base * light * (0.96 + floor(paper * 3.0) * 0.03) + vec3f(0.03, 0.05, 0.02) * breeze;

          output.color = vec4f(color, 0.95);
          return output;
        }
      `,
    });
    material.cull = pc.CULLFACE_NONE;
    material.blendType = pc.BLEND_NORMAL;
    material.setParameter('uSunDirection', [-0.43, -0.76, -0.49]);
    material.setParameter('uTime', 0);
    material.update();
    return material;
  }

  private createRoadMaterial(): pc.ShaderMaterial {
    const material = new pc.ShaderMaterial({
      uniqueName: 'painterly-road',
      attributes: {
        vertex_position: pc.SEMANTIC_POSITION,
        vertex_normal: pc.SEMANTIC_NORMAL,
        aUv0: pc.SEMANTIC_TEXCOORD0,
      },
      vertexWGSL: /* wgsl */ `
        attribute vertex_position: vec3f;
        attribute vertex_normal: vec3f;
        attribute aUv0: vec2f;

        uniform matrix_model: mat4x4f;
        uniform matrix_viewProjection: mat4x4f;
        uniform matrix_normal: mat3x3f;

        varying uv0: vec2f;
        varying normalW: vec3f;
        varying worldPos: vec3f;

        @vertex
        fn vertexMain(input: VertexInput) -> VertexOutput {
          var output: VertexOutput;
          let world = uniform.matrix_model * vec4f(input.vertex_position, 1.0);
          output.position = uniform.matrix_viewProjection * world;
          output.uv0 = input.aUv0;
          output.normalW = normalize(uniform.matrix_normal * input.vertex_normal);
          output.worldPos = world.xyz;
          return output;
        }
      `,
      fragmentWGSL: /* wgsl */ `
        varying uv0: vec2f;
        varying normalW: vec3f;
        varying worldPos: vec3f;

        uniform uSunDirection: vec3f;
        uniform uTime: f32;

        fn hash21(p: vec2f) -> f32 {
          let q = fract(p * vec2f(174.3, 289.7));
          return fract(q.x * q.y * (q.x + q.y));
        }

        fn noise2(p: vec2f) -> f32 {
          let i = floor(p);
          let f = fract(p);
          let a = hash21(i);
          let b = hash21(i + vec2f(1.0, 0.0));
          let c = hash21(i + vec2f(0.0, 1.0));
          let d = hash21(i + vec2f(1.0, 1.0));
          let u = f * f * (3.0 - 2.0 * f);
          return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
        }

        @fragment
        fn fragmentMain(input: FragmentInput) -> FragmentOutput {
          var output: FragmentOutput;
          let light = select(0.72, 0.9, dot(normalize(input.normalW), -normalize(uniform.uSunDirection)) > 0.14);
          let grain = noise2(input.worldPos.xz * 3.0 + vec2f(uniform.uTime * 0.02));
          let stripe = step(0.87, fract(input.uv0.y * 2.0));
          let asphalt = vec3f(0.19, 0.20, 0.22) * (0.94 + floor(grain * 3.0) * 0.03);
          let laneDust = vec3f(0.05, 0.04, 0.03) * stripe * 0.16;
          output.color = vec4f(asphalt * light + laneDust, 1.0);
          return output;
        }
      `,
    });
    material.setParameter('uSunDirection', [-0.43, -0.76, -0.49]);
    material.setParameter('uTime', 0);
    material.update();
    this.animatedMaterials.push(material);
    return material;
  }

  private createOutlineEntity(name: string, mesh: pc.Mesh, thickness: number): pc.Entity {
    const outlineMat = new pc.ShaderMaterial({
      uniqueName: `${name}-outline`,
      attributes: {
        vertex_position: pc.SEMANTIC_POSITION,
        vertex_normal: pc.SEMANTIC_NORMAL,
      },
      vertexWGSL: /* wgsl */ `
        attribute vertex_position: vec3f;
        attribute vertex_normal: vec3f;

        uniform matrix_model: mat4x4f;
        uniform matrix_viewProjection: mat4x4f;
        uniform matrix_normal: mat3x3f;
        uniform uCameraPos: vec3f;
        uniform uTime: f32;
        uniform uThickness: f32;

        varying fade: f32;

        fn hash31(p: vec3f) -> f32 {
          return fract(sin(dot(p, vec3f(12.9898, 78.233, 45.164))) * 43758.5453);
        }

        @vertex
        fn vertexMain(input: VertexInput) -> VertexOutput {
          var output: VertexOutput;
          let world = uniform.matrix_model * vec4f(input.vertex_position, 1.0);
          let normalW = normalize(uniform.matrix_normal * input.vertex_normal);
          let dist = distance(world.xyz, uniform.uCameraPos);
          let curvature = 1.0 - abs(dot(normalW, vec3f(0.0, 1.0, 0.0)));
          let hand = hash31(world.xyz * 0.7 + vec3f(uniform.uTime * 0.25));
          let width = uniform.uThickness * (1.0 + curvature * 0.9) * (0.72 + min(dist * 0.03, 0.7)) * (0.86 + hand * 0.42);
          let extruded = world.xyz + normalW * width;
          output.position = uniform.matrix_viewProjection * vec4f(extruded, 1.0);
          output.fade = clamp(1.1 - dist * 0.018, 0.25, 1.0);
          return output;
        }
      `,
      fragmentWGSL: /* wgsl */ `
        varying fade: f32;
        uniform uOutlineColor: vec3f;

        @fragment
        fn fragmentMain(input: FragmentInput) -> FragmentOutput {
          var output: FragmentOutput;
          output.color = vec4f(uniform.uOutlineColor, input.fade);
          return output;
        }
      `,
    });
    outlineMat.cull = pc.CULLFACE_FRONT;
    outlineMat.blendType = pc.BLEND_NORMAL;
    outlineMat.depthWrite = false;
    outlineMat.setParameter('uOutlineColor', [0.05, 0.045, 0.05]);
    outlineMat.setParameter('uThickness', thickness);
    outlineMat.setParameter('uCameraPos', [0, 0, 0]);
    outlineMat.setParameter('uTime', 0);
    outlineMat.update();
    this.animatedMaterials.push(outlineMat);

    const outline = new pc.Entity(name);
    outline.addComponent('render', {
      meshInstances: [new pc.MeshInstance(mesh, outlineMat)],
      castShadows: false,
      receiveShadows: false,
    });
    return outline;
  }

  private createCarBodyMesh(): pc.Mesh {
    const slices = 26;
    const ring = 24;
    const positions: number[] = [];
    const uvs: number[] = [];
    const indices: number[] = [];

    const wheelA = 1.14;
    const wheelB = -1.12;

    for (let i = 0; i < slices; i += 1) {
      const v = i / (slices - 1);
      const z = pc.math.lerp(-2.12, 2.12, v);
      const centerBias = 1.0 - Math.abs(v * 2 - 1);
      const width = 0.58 + centerBias * 0.54 + Math.exp(-Math.pow((z - wheelA) * 0.92, 2)) * 0.18 + Math.exp(-Math.pow((z - wheelB) * 0.92, 2)) * 0.18;
      const height = 0.48 + centerBias * 0.2 + Math.exp(-Math.pow(z * 0.72, 2)) * 0.18;
      const roof = 0.88 + Math.exp(-Math.pow(z * 0.62, 2)) * 0.52 - Math.max(0, z - 0.9) * 0.08;
      const bottom = 0.28 + Math.exp(-Math.pow((Math.abs(z) - 1.25) * 1.2, 2)) * 0.05;
      const nosePinch = 1.0 - smoothPulse(1.45, 2.15, Math.abs(z)) * 0.22;

      for (let j = 0; j < ring; j += 1) {
        const u = j / ring;
        const a = u * Math.PI * 2;
        const cx = Math.cos(a);
        const sy = Math.sin(a);

        const sx = Math.sign(cx) * Math.pow(Math.abs(cx), 0.55);
        const yy = Math.sign(sy) * Math.pow(Math.abs(sy), 0.78);

        let x = sx * width * nosePinch;
        let y = yy * height;

        if (y > 0) {
          y = pc.math.lerp(y, roof, Math.pow(Math.max(0, y), 1.2));
        } else {
          y = pc.math.lerp(y, -bottom, Math.pow(Math.max(0, -y), 1.4));
        }

        const wheelMask = Math.max(
          Math.exp(-Math.pow((z - wheelA) * 2.2, 2)),
          Math.exp(-Math.pow((z - wheelB) * 2.2, 2)),
        );
        const sideMask = smoothStep(0.55, 0.9, Math.abs(sx));

        if (y < 0.12 && sideMask > 0.4 && wheelMask > 0.08) {
          const arch = (0.12 - y) * sideMask * wheelMask * 1.8;
          y += arch;
        }

        x *= 1.0 + sideMask * wheelMask * 0.12;
        y += sideMask * wheelMask * 0.05;

        if (z > 0.9 && y > 0.3) {
          y -= (z - 0.9) * 0.07;
        }

        positions.push(x, y + 0.86, z);
        uvs.push(u, v);
      }
    }

    for (let i = 0; i < slices - 1; i += 1) {
      for (let j = 0; j < ring; j += 1) {
        const a = i * ring + j;
        const b = i * ring + ((j + 1) % ring);
        const c = (i + 1) * ring + j;
        const d = (i + 1) * ring + ((j + 1) % ring);
        indices.push(a, c, b, b, c, d);
      }
    }

    const normals = pc.calculateNormals(positions, indices);
    return pc.createMesh(this.app.graphicsDevice, positions, { normals, uvs, indices });
  }

  private createCabinGlassMesh(): pc.Mesh {
    const positions = [
      -0.74, 1.05, 0.86, 0.74, 1.05, 0.86, -0.54, 1.66, 0.22, 0.54, 1.66, 0.22,
      -0.62, 1.58, -0.82, 0.62, 1.58, -0.82, -0.78, 1.0, -1.24, 0.78, 1.0, -1.24,
    ];
    const indices = [
      0, 2, 1, 1, 2, 3,
      2, 4, 3, 3, 4, 5,
      4, 6, 5, 5, 6, 7,
      0, 6, 2, 2, 6, 4,
      1, 3, 7, 3, 5, 7,
    ];
    const uvs = [
      0, 0, 1, 0, 0, 0.33, 1, 0.33,
      0, 0.66, 1, 0.66, 0, 1, 1, 1,
    ];
    const normals = pc.calculateNormals(positions, indices);
    return pc.createMesh(this.app.graphicsDevice, positions, { normals, uvs, indices });
  }

  private createGrassBladeMesh(): pc.Mesh {
    const positions: number[] = [];
    const uvs: number[] = [];
    const indices: number[] = [];

    const quads = 3;
    const segments = 5;
    let indexBase = 0;

    for (let q = 0; q < quads; q += 1) {
      const yaw = (q / quads) * Math.PI;
      for (let y = 0; y <= segments; y += 1) {
        const v = y / segments;
        const width = pc.math.lerp(0.12, 0.02, v);
        const height = v * 1.3;
        const dx = Math.cos(yaw) * width;
        const dz = -Math.sin(yaw) * width;

        positions.push(-dx, height, -dz, dx, height, dz);
        uvs.push(0, v, 1, v);

        if (y < segments) {
          const base = indexBase + y * 2;
          indices.push(base, base + 2, base + 1, base + 1, base + 2, base + 3);
        }
      }

      indexBase += (segments + 1) * 2;
    }

    const normals = pc.calculateNormals(positions, indices);
    return pc.createMesh(this.app.graphicsDevice, positions, { normals, uvs, indices });
  }

  private createRibbonMesh(points: pc.Vec3[], innerWidth: number, outerWidth: number): pc.Mesh {
    const positions: number[] = [];
    const uvs: number[] = [];
    const indices: number[] = [];

    for (let i = 0; i < points.length; i += 1) {
      const p = points[i];
      const t = this.trackTangents[i];
      const normal = new pc.Vec3(-t.z, 0, t.x).normalize();

      const left = p.clone().add(normal.clone().mulScalar(-outerWidth * 0.5));
      const right = p.clone().add(normal.clone().mulScalar(outerWidth * 0.5));
      const innerLeft = p.clone().add(normal.clone().mulScalar(-innerWidth * 0.5));
      const innerRight = p.clone().add(normal.clone().mulScalar(innerWidth * 0.5));

      positions.push(left.x, left.y, left.z, innerLeft.x, innerLeft.y, innerLeft.z, innerRight.x, innerRight.y, innerRight.z, right.x, right.y, right.z);
      const v = i / points.length * 24;
      uvs.push(0, v, 0.33, v, 0.66, v, 1, v);
    }

    for (let i = 0; i < points.length; i += 1) {
      const next = (i + 1) % points.length;
      const a = i * 4;
      const b = next * 4;
      indices.push(a, b, a + 1, a + 1, b, b + 1);
      indices.push(a + 1, b + 1, a + 2, a + 2, b + 1, b + 2);
      indices.push(a + 2, b + 2, a + 3, a + 3, b + 2, b + 3);
    }

    const normals = pc.calculateNormals(positions, indices);
    return pc.createMesh(this.app.graphicsDevice, positions, { normals, uvs, indices });
  }

  private createInteriorSeats(material: pc.Material): pc.Entity {
    const root = new pc.Entity('interior-seats');
    const seatLeft = this.createSeat(material);
    seatLeft.setLocalPosition(-0.42, 0.72, 0.12);
    const seatRight = this.createSeat(material);
    seatRight.setLocalPosition(0.42, 0.72, 0.12);
    root.addChild(seatLeft);
    root.addChild(seatRight);
    return root;
  }

  private createSeat(material: pc.Material): pc.Entity {
    const seat = new pc.Entity('bucket-seat');
    seat.addChild(this.createBoxEntity('seat-base', new pc.Vec3(0, 0, 0), new pc.Vec3(0.46, 0.14, 0.46), material));
    seat.addChild(this.createBoxEntity('seat-back', new pc.Vec3(0, 0.34, -0.1), new pc.Vec3(0.42, 0.58, 0.14), material));
    seat.addChild(this.createBoxEntity('seat-side-l', new pc.Vec3(-0.19, 0.08, 0.02), new pc.Vec3(0.08, 0.18, 0.38), material));
    seat.addChild(this.createBoxEntity('seat-side-r', new pc.Vec3(0.19, 0.08, 0.02), new pc.Vec3(0.08, 0.18, 0.38), material));
    seat.addChild(this.createBoxEntity('headrest', new pc.Vec3(0, 0.64, -0.18), new pc.Vec3(0.22, 0.16, 0.08), material));
    return seat;
  }

  private createSteeringWheel(chrome: pc.Material, grip: pc.Material): pc.Entity {
    const wheelRoot = new pc.Entity('steering-wheel');
    wheelRoot.setLocalPosition(-0.38, 1.08, 0.88);
    wheelRoot.setLocalEulerAngles(28, 0, 18);

    const ringMesh = pc.createTorus(this.app.graphicsDevice, {
      tubeRadius: 0.026,
      ringRadius: 0.17,
      segments: 32,
      sides: 14,
    });
    const ring = this.createMeshEntity('wheel-ring', ringMesh, grip, false, false);
    wheelRoot.addChild(ring);

    const hub = this.createCylinderEntity('wheel-hub', new pc.Vec3(0, 0, 0), new pc.Vec3(0.06, 0.04, 0.06), chrome);
    hub.setLocalEulerAngles(90, 0, 0);
    wheelRoot.addChild(hub);

    for (let i = 0; i < 3; i += 1) {
      const spoke = this.createBoxEntity('spoke', new pc.Vec3(0, 0.0, 0), new pc.Vec3(0.03, 0.02, 0.12), chrome);
      spoke.setLocalEulerAngles(0, i * 120, 0);
      wheelRoot.addChild(spoke);
    }

    return wheelRoot;
  }

  private createWheelAssembly(chrome: pc.Material, tire: pc.Material, accent: pc.Material): pc.Entity {
    const root = new pc.Entity('wheel-assembly');

    const tireEntity = this.createCylinderEntity('tire', new pc.Vec3(0, 0, 0), new pc.Vec3(0.37, 0.18, 0.37), tire);
    tireEntity.setLocalEulerAngles(0, 0, 90);
    root.addChild(tireEntity);

    const rimMesh = pc.createCylinder(this.app.graphicsDevice, { radius: 0.23, height: 0.17, capSegments: 2, heightSegments: 1 });
    const rim = this.createMeshEntity('rim', rimMesh, chrome, true, true);
    rim.setLocalEulerAngles(0, 0, 90);
    rim.addChild(this.createOutlineEntity('rim-outline', rimMesh, 0.01));
    root.addChild(rim);

    const hub = this.createCylinderEntity('hub', new pc.Vec3(0, 0, 0), new pc.Vec3(0.08, 0.18, 0.08), accent);
    hub.setLocalEulerAngles(0, 0, 90);
    root.addChild(hub);

    for (let i = 0; i < 10; i += 1) {
      const spoke = this.createBoxEntity('spoke', new pc.Vec3(0, 0, 0), new pc.Vec3(0.018, 0.018, 0.18), chrome);
      spoke.setLocalEulerAngles(0, 0, i * 36);
      root.addChild(spoke);
    }

    return root;
  }

  private createSuspensionAssembly(chrome: pc.Material, dark: pc.Material): pc.Entity {
    const root = new pc.Entity('suspension');
    const coil = new pc.Entity('coil-stack');
    root.addChild(coil);

    for (let i = 0; i < 7; i += 1) {
      const t = i / 6;
      const angle = t * Math.PI * 4.5;
      const x = Math.sin(angle) * 0.035;
      const z = Math.cos(angle) * 0.035;
      const y = 0.1 + t * 0.28;
      const segment = this.createCylinderEntity('coil-segment', new pc.Vec3(x, y, z), new pc.Vec3(0.018, 0.03, 0.018), chrome);
      segment.setLocalEulerAngles(0, angle * pc.math.RAD_TO_DEG, 90);
      coil.addChild(segment);
    }

    root.addChild(this.createCylinderEntity('damper', new pc.Vec3(0, 0.23, 0), new pc.Vec3(0.03, 0.22, 0.03), dark));
    root.addChild(this.createBoxEntity('wishbone', new pc.Vec3(0, 0.02, 0), new pc.Vec3(0.26, 0.04, 0.08), dark));
    return root;
  }

  private createMirror(position: pc.Vec3, chrome: pc.Material, body: pc.Material): pc.Entity {
    const mirror = new pc.Entity('mirror');
    mirror.setLocalPosition(position);
    mirror.addChild(this.createCylinderEntity('arm', new pc.Vec3(0, 0, 0), new pc.Vec3(0.02, 0.12, 0.02), chrome));
    mirror.addChild(this.createSphereEntity('cap', new pc.Vec3(0, 0.12, 0), 0.09, body));
    return mirror;
  }

  private createBlobShadow(): pc.Entity {
    const shadowMat = this.createStandardMaterial({
      diffuse: new pc.Color(0, 0, 0),
      opacity: 0.18,
      blendType: pc.BLEND_NORMAL,
      useLighting: false,
      cull: pc.CULLFACE_NONE,
    });
    shadowMat.depthWrite = false;
    shadowMat.update();

    const shadow = new pc.Entity('blob-shadow');
    shadow.addComponent('render', {
      type: 'plane',
      material: shadowMat,
      castShadows: false,
      receiveShadows: false,
    });
    shadow.setLocalPosition(0, 0.02, 0);
    shadow.setLocalEulerAngles(-90, 0, 0);
    shadow.setLocalScale(3.0, 1, 5.4);
    return shadow;
  }

  private createMeshEntity(name: string, mesh: pc.Mesh, material: pc.Material, castShadows: boolean, receiveShadows: boolean): pc.Entity {
    const entity = new pc.Entity(name);
    entity.addComponent('render', {
      meshInstances: [new pc.MeshInstance(mesh, material)],
      castShadows,
      receiveShadows,
    });
    return entity;
  }

  private createBoxEntity(name: string, position: pc.Vec3, scale: pc.Vec3, material: pc.Material): pc.Entity {
    const entity = new pc.Entity(name);
    entity.addComponent('render', {
      type: 'box',
      material,
      castShadows: true,
      receiveShadows: true,
    });
    entity.setLocalPosition(position);
    entity.setLocalScale(scale);
    return entity;
  }

  private createSphereEntity(name: string, position: pc.Vec3, radius: number, material: pc.Material): pc.Entity {
    const entity = new pc.Entity(name);
    entity.addComponent('render', {
      type: 'sphere',
      material,
      castShadows: true,
      receiveShadows: true,
    });
    entity.setLocalPosition(position);
    entity.setLocalScale(radius * 2, radius * 2, radius * 2);
    return entity;
  }

  private createCylinderEntity(name: string, position: pc.Vec3, scale: pc.Vec3, material: pc.Material): pc.Entity {
    const entity = new pc.Entity(name);
    entity.addComponent('render', {
      type: 'cylinder',
      material,
      castShadows: true,
      receiveShadows: true,
    });
    entity.setLocalPosition(position);
    entity.setLocalScale(scale);
    return entity;
  }

  private createStandardMaterial(opts: {
    diffuse: pc.Color;
    emissive?: pc.Color;
    specular?: pc.Color;
    opacity?: number;
    blendType?: number;
    cull?: number;
    gloss?: number;
    metalness?: number;
    useMetalness?: boolean;
    useLighting?: boolean;
  }): pc.StandardMaterial {
    const material = new pc.StandardMaterial();
    material.diffuse = opts.diffuse.clone();
    material.emissive = opts.emissive?.clone() ?? new pc.Color(0, 0, 0);
    material.specular = opts.specular?.clone() ?? new pc.Color(0.2, 0.2, 0.2);
    material.opacity = opts.opacity ?? 1;
    material.blendType = opts.blendType ?? pc.BLEND_NONE;
    material.cull = opts.cull ?? pc.CULLFACE_BACK;
    material.gloss = opts.gloss ?? 0.25;
    material.useMetalness = opts.useMetalness ?? false;
    material.metalness = opts.metalness ?? 0;
    material.useLighting = opts.useLighting ?? true;
    material.update();
    return material;
  }

  private update(dt: number): void {
    this.time += dt;
    this.trackT = (this.trackT + dt * 0.042) % 1;

    const carPose = this.sampleTrack(this.trackT);
    const carPos = carPose.position.clone().add(new pc.Vec3(0, 0.28, 0));
    this.carRoot.setPosition(carPos);
    this.carRoot.setRotation(this.lookRotation(carPose.tangent));

    this.speed = 82 + Math.sin(this.time * 1.7) * 11 + Math.cos(this.time * 0.74) * 6;
    const wheelSpin = this.speed * dt * 0.11;
    for (const wheel of this.wheels) {
      wheel.rotateLocal(0, 0, -wheelSpin * pc.math.RAD_TO_DEG);
    }

    const camTarget = carPos.clone().add(new pc.Vec3(0, 0.72, 0));
    const back = carPose.tangent.clone().mulScalar(-8.6);
    const right = new pc.Vec3(-carPose.tangent.z, 0, carPose.tangent.x);
    const side = right.mulScalar(4.2);
    const camPos = carPos.clone().add(back).add(side).add(new pc.Vec3(0, 5.3, 0));
    this.camera.setPosition(camPos);
    this.camera.lookAt(camTarget);

    for (const material of this.animatedMaterials) {
      material.setParameter('uTime', this.time);
      material.setParameter('uCameraPos', this.camera.getPosition().toArray());
    }
    this.postEffect.setTime(this.time);

    this.speedLabel.textContent = `${Math.round(this.speed).toString().padStart(3, '0')}`;
    this.lapLabel.textContent = this.time < 2.8 ? 'Static' : this.time < 6.2 ? 'Init' : this.time % 18 < 6 ? 'Down' : this.time % 18 < 12 ? 'Left' : 'Right';

    if (this.time < 2.8) {
      this.introOverlay.style.opacity = '1';
      this.countdownLabel.style.opacity = '0';
    } else {
      this.introOverlay.style.opacity = '0';
      this.introOverlay.style.pointerEvents = 'none';

      const countdownTime = this.time - 2.8;
      if (countdownTime < 3.2) {
        const step = Math.floor(countdownTime);
        const labels = ['3', '2', '1', 'GO'];
        this.countdownLabel.textContent = labels[Math.min(step, labels.length - 1)];
        this.countdownLabel.style.opacity = '1';
        this.countdownLabel.style.transform = 'translate(-50%, -50%) scale(1)';
      } else {
        this.countdownLabel.style.opacity = '0';
        this.countdownLabel.style.transform = 'translate(-50%, -50%) scale(0.96)';
      }
    }
  }

  private sampleTrack(t: number): { position: pc.Vec3; tangent: pc.Vec3 } {
    const scaled = t * this.trackPoints.length;
    const i0 = Math.floor(scaled) % this.trackPoints.length;
    const i1 = (i0 + 1) % this.trackPoints.length;
    const f = scaled - Math.floor(scaled);
    const position = new pc.Vec3().lerp(this.trackPoints[i0], this.trackPoints[i1], f);
    const tangent = new pc.Vec3().lerp(this.trackTangents[i0], this.trackTangents[i1], f).normalize();
    return { position, tangent };
  }

  private lookRotation(forward: pc.Vec3): pc.Quat {
    const yaw = Math.atan2(forward.x, forward.z) * pc.math.RAD_TO_DEG;
    const pitch = -forward.y * 8;
    return new pc.Quat().setFromEulerAngles(0, yaw, pitch);
  }
}

function smoothPulse(edge0: number, edge1: number, x: number): number {
  const t = pc.math.clamp((x - edge0) / Math.max(edge1 - edge0, 0.0001), 0, 1);
  return t * t * (3 - 2 * t);
}

function smoothStep(edge0: number, edge1: number, x: number): number {
  const t = pc.math.clamp((x - edge0) / Math.max(edge1 - edge0, 0.0001), 0, 1);
  return t * t * (3 - 2 * t);
}

function ensureCanvas(root: HTMLElement): HTMLCanvasElement {
  root.innerHTML = '';
  const canvas = document.createElement('canvas');
  canvas.setAttribute('aria-label', 'Studio Ghibli racer scene');
  canvas.style.cssText = 'display:block;width:100vw;height:100vh;';
  root.appendChild(canvas);
  return canvas;
}

export async function bootstrapPremiumGhibliRacer(): Promise<void> {
  const root = document.getElementById('app');
  if (!(root instanceof HTMLElement)) {
    throw new Error('Turbo Drift root element #app is missing');
  }

  const canvas = ensureCanvas(root);
  const graphicsDevice = await pc.createGraphicsDevice(canvas, {
    deviceTypes: [pc.DEVICETYPE_WEBGPU],
    antialias: true,
    powerPreference: 'high-performance',
    depth: true,
    stencil: true,
  });

  const app = new pc.Application(canvas, {
    graphicsDevice,
    mouse: new pc.Mouse(document.body),
    touch: new pc.TouchDevice(document.body),
  });

  const resize = (): void => {
    app.graphicsDevice.maxPixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    app.resizeCanvas();
  };

  window.addEventListener('resize', resize, { passive: true });
  window.addEventListener('orientationchange', resize, { passive: true });

  app.start();
  new PremiumGhibliRacer(app, canvas);
  resize();
}
