const root = document.documentElement;
const body = document.body;
const canvas = document.getElementById("quantum-network");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function setupInterface() {
  const menuToggle = document.querySelector(".menu-toggle");
  const mobileMenu = document.querySelector(".mobile-menu");
  const panels = Array.from(document.querySelectorAll(".overlay-panel"));
  let activePanel = null;
  let lastTrigger = null;
  let resourcesInitialized = false;

  function loadChartLibrary() {
    if (window.Chart) return Promise.resolve(window.Chart);
    return new Promise((resolve, reject) => {
      const existing = document.querySelector("script[data-face5-charts]");
      if (existing) {
        existing.addEventListener("load", () => resolve(window.Chart), { once: true });
        existing.addEventListener("error", reject, { once: true });
        return;
      }
      const script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/npm/chart.js@4.4.7/dist/chart.umd.min.js";
      script.async = true;
      script.dataset.face5Charts = "true";
      script.addEventListener("load", () => resolve(window.Chart), { once: true });
      script.addEventListener("error", reject, { once: true });
      document.head.append(script);
    });
  }

  function chartOptions(title) {
    return {
      responsive: true,
      maintainAspectRatio: false,
      animation: reduceMotion ? false : { duration: 700 },
      plugins: {
        title: { display: false, text: title },
        legend: { labels: { color: "rgba(255,255,255,.76)", boxWidth: 11, usePointStyle: true } }
      },
      scales: {
        x: { ticks: { color: "rgba(255,255,255,.62)" }, grid: { color: "rgba(255,255,255,.06)" } },
        y: { ticks: { color: "rgba(255,255,255,.62)" }, grid: { color: "rgba(255,255,255,.06)" }, beginAtZero: true }
      }
    };
  }

  async function initializeResources() {
    if (resourcesInitialized) return;
    resourcesInitialized = true;
    try {
      const Chart = await loadChartLibrary();
      const palette = ["#ff6f91", "#55d8ff", "#ffd166", "#00df8f", "#a78bfa"];
      const geo = document.getElementById("geoChart");
      const clicks = document.getElementById("clickChart");
      const demo = document.getElementById("demoChart");
      if (geo) new Chart(geo, {
        type: "pie",
        data: { labels: ["Firenze", "Pisa", "Siena", "Lucca", "Altri"], datasets: [{ data: [45,20,15,10,10], backgroundColor: palette, borderColor: "#0d0e18", borderWidth: 2 }] },
        options: { ...chartOptions("Distribuzione geografica"), scales: {} }
      });
      if (clicks) new Chart(clicks, {
        type: "bar",
        data: { labels: ["Inizio", "Prodotti", "Dettagli", "Contatti", "FAQ"], datasets: [{ label: "Clic", data: [180,130,90,70,40], backgroundColor: "rgba(85,216,255,.72)", borderColor: "#55d8ff", borderWidth: 1 }] },
        options: chartOptions("Interazioni sul sito")
      });
      if (demo) new Chart(demo, {
        type: "doughnut",
        data: { labels: ["Uomini", "Donne", "Non specificato"], datasets: [{ data: [50,45,5], backgroundColor: ["#55d8ff", "#ff6f91", "#ffd166"], borderColor: "#0d0e18", borderWidth: 2 }] },
        options: { ...chartOptions("Profilo demografico"), scales: {} }
      });
      root.dataset.resourcesState = "ready";
    } catch (error) {
      resourcesInitialized = false;
      root.dataset.resourcesState = "fallback";
      console.warn("Grafici Face5 non disponibili; i dati testuali restano visibili.", error);
    }
  }

  panels.forEach(panel => { panel.inert = true; });

  function setMenu(open) {
    mobileMenu.classList.toggle("open", open);
    mobileMenu.setAttribute("aria-hidden", String(!open));
    menuToggle.setAttribute("aria-expanded", String(open));
    menuToggle.setAttribute("aria-label", open ? "Chiudi menu" : "Apri menu");
  }

  function openPanel(id, trigger) {
    const panel = document.getElementById(id);
    if (!panel) return;
    if (activePanel) closePanel(false);
    lastTrigger = trigger || document.activeElement;
    activePanel = panel;
    panel.inert = false;
    panel.classList.add("is-open");
    panel.setAttribute("aria-hidden", "false");
    body.classList.add("panel-open");
    setMenu(false);
    if (id === "resources-panel") initializeResources();
    window.setTimeout(() => panel.querySelector(".panel-close")?.focus(), 40);
  }

  function closePanel(restoreFocus = true) {
    if (!activePanel) return;
    const panel = activePanel;
    panel.classList.remove("is-open");
    panel.setAttribute("aria-hidden", "true");
    panel.inert = true;
    activePanel = null;
    body.classList.remove("panel-open");
    if (restoreFocus && lastTrigger instanceof HTMLElement) lastTrigger.focus();
  }

  menuToggle.addEventListener("click", () => setMenu(!mobileMenu.classList.contains("open")));

  document.querySelectorAll("[data-panel-open]").forEach(button => {
    button.addEventListener("click", () => openPanel(button.dataset.panelOpen, button));
  });

  document.querySelectorAll("[data-panel-close]").forEach(button => {
    button.addEventListener("click", () => closePanel());
  });

  document.addEventListener("keydown", event => {
    if (event.key === "Escape") {
      if (activePanel) closePanel();
      else setMenu(false);
      return;
    }
    if (event.key !== "Tab" || !activePanel) return;
    const focusable = Array.from(activePanel.querySelectorAll("a[href], button:not([disabled]), [tabindex]:not([tabindex='-1'])"));
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 820) setMenu(false);
  }, { passive: true });
}

setupInterface();

function seededRandom(seed) {
  const value = Math.sin(seed * 127.1 + 311.7) * 43758.5453123;
  return value - Math.floor(value);
}

function buildNodeData(THREE, count) {
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const sizes = new Float32Array(count);
  const points = [];
  const palette = [
    new THREE.Color(0x667eea),
    new THREE.Color(0x764ba2),
    new THREE.Color(0x55d8ff),
    new THREE.Color(0xff6f91),
    new THREE.Color(0xffffff)
  ];
  const golden = Math.PI * (3 - Math.sqrt(5));

  for (let index = 0; index < count; index += 1) {
    const ratio = (index + 0.5) / count;
    const y = 1 - ratio * 2;
    const radiusAtY = Math.sqrt(Math.max(0, 1 - y * y));
    const theta = golden * index;
    const surfaceNoise = (seededRandom(index + 3) - 0.5) * 0.5;
    const radius = 3.42 + surfaceNoise;
    const point = new THREE.Vector3(
      Math.cos(theta) * radiusAtY * radius * 1.12,
      y * radius * 0.84,
      Math.sin(theta) * radiusAtY * radius
    );

    point.x += Math.sin(point.y * 1.8) * 0.24;
    point.z += Math.cos(point.x * 1.25) * 0.18;
    points.push(point);
    positions.set([point.x, point.y, point.z], index * 3);

    const color = palette[index % palette.length].clone();
    color.lerp(palette[(index + 2) % palette.length], seededRandom(index + 17) * 0.35);
    colors.set([color.r, color.g, color.b], index * 3);
    sizes[index] = 2.8 + seededRandom(index + 29) * 4.2;
  }

  return { positions, colors, sizes, points };
}

function buildConnections(points, maxDistance) {
  const segments = [];
  for (let index = 0; index < points.length; index += 1) {
    const candidates = [];
    for (let target = index + 1; target < points.length; target += 1) {
      const distance = points[index].distanceToSquared(points[target]);
      if (distance <= maxDistance * maxDistance) candidates.push({ target, distance });
    }
    candidates.sort((a, b) => a.distance - b.distance);
    candidates.slice(0, 4).forEach(({ target }) => {
      segments.push(points[index].x, points[index].y, points[index].z);
      segments.push(points[target].x, points[target].y, points[target].z);
    });
  }
  return new Float32Array(segments);
}

const noiseShader = `
  float hash31(vec3 p) {
    p = fract(p * 0.1031);
    p += dot(p, p.yzx + 33.33);
    return fract((p.x + p.y) * p.z);
  }
  float valueNoise(vec3 p) {
    vec3 i = floor(p);
    vec3 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(mix(hash31(i), hash31(i + vec3(1.0,0.0,0.0)), f.x), mix(hash31(i + vec3(0.0,1.0,0.0)), hash31(i + vec3(1.0,1.0,0.0)), f.x), f.y),
      mix(mix(hash31(i + vec3(0.0,0.0,1.0)), hash31(i + vec3(1.0,0.0,1.0)), f.x), mix(hash31(i + vec3(0.0,1.0,1.0)), hash31(i + vec3(1.0,1.0,1.0)), f.x), f.y),
      f.z
    );
  }
`;

const pulseShader = `
  float pulseStrength(vec3 point, out vec3 pulseColor) {
    float total = 0.0;
    pulseColor = vec3(0.0);
    for (int i = 0; i < 4; i++) {
      float age = uTime - uPulseTimes[i];
      if (age >= 0.0 && age < 3.0) {
        float waveDistance = age * 3.1;
        float distanceFromPulse = distance(point, uPulsePositions[i]);
        float ring = exp(-pow(distanceFromPulse - waveDistance, 2.0) * 3.2) * (1.0 - age / 3.0);
        total += ring;
        pulseColor += uPulseColors[i] * ring;
      }
    }
    pulseColor = total > 0.001 ? pulseColor / total : vec3(0.0);
    return total;
  }
`;

async function initNetwork() {
  if (!canvas) return;
  let renderer;
  let animationFrame = 0;

  try {
    const THREE = await import("three");
    const [{ OrbitControls }, { EffectComposer }, { RenderPass }, { UnrealBloomPass }] = await Promise.all([
      import("three/addons/controls/OrbitControls.js"),
      import("three/addons/postprocessing/EffectComposer.js"),
      import("three/addons/postprocessing/RenderPass.js"),
      import("three/addons/postprocessing/UnrealBloomPass.js")
    ]);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050508);
    scene.fog = new THREE.FogExp2(0x050508, 0.025);

    const camera = new THREE.PerspectiveCamera(54, 1, 0.1, 120);
    camera.position.set(0, 2.66, 9.33);

    renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: false,
      powerPreference: "high-performance"
    });
    renderer.setClearColor(0x050508, 1);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;

    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    const bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), 1.2, 0.6, 0);
    bloom.threshold = 0;
    bloom.strength = 1.2;
    bloom.radius = 0.6;
    composer.addPass(bloom);

    const mobile = window.matchMedia("(max-width: 768px)").matches;
    const nodeCount = mobile ? 168 : 280;
    const { positions, colors, sizes, points } = buildNodeData(THREE, nodeCount);
    const connectionPositions = buildConnections(points, mobile ? 1.45 : 1.28);
    const pulsePositions = Array.from({ length: 4 }, () => new THREE.Vector3(999, 999, 999));
    const pulseTimes = new Float32Array([-100, -100, -100, -100]);
    const pulseColors = [
      new THREE.Color(0x55d8ff),
      new THREE.Color(0x667eea),
      new THREE.Color(0xff6f91),
      new THREE.Color(0xffffff)
    ];

    const commonUniforms = {
      uTime: { value: 0 },
      uPulsePositions: { value: pulsePositions },
      uPulseTimes: { value: pulseTimes },
      uPulseColors: { value: pulseColors },
      fogColor: { value: scene.fog.color },
      fogDensity: { value: scene.fog.density },
      fogNear: { value: 1 },
      fogFar: { value: 120 }
    };

    const pointGeometry = new THREE.BufferGeometry();
    pointGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    pointGeometry.setAttribute("aColor", new THREE.BufferAttribute(colors, 3));
    pointGeometry.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));

    const pointMaterial = new THREE.ShaderMaterial({
      uniforms: commonUniforms,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      fog: true,
      vertexShader: `
        uniform float uTime;
        uniform vec3 uPulsePositions[4];
        uniform float uPulseTimes[4];
        uniform vec3 uPulseColors[4];
        attribute vec3 aColor;
        attribute float aSize;
        varying vec3 vColor;
        varying vec3 vPulseColor;
        varying float vPulse;
        #include <fog_pars_vertex>
        ${noiseShader}
        ${pulseShader}
        void main() {
          vec3 displaced = position;
          float organic = valueNoise(position * 0.72 + vec3(uTime * 0.075));
          displaced += normalize(position + vec3(0.001)) * (organic - 0.5) * 0.22;
          vec3 pulseColor;
          float pulse = pulseStrength(displaced, pulseColor);
          displaced += normalize(displaced + vec3(0.001)) * pulse * 0.24;
          vec4 mvPosition = modelViewMatrix * vec4(displaced, 1.0);
          gl_Position = projectionMatrix * mvPosition;
          gl_PointSize = (aSize + pulse * 7.0) * (36.0 / max(3.0, -mvPosition.z));
          vColor = aColor;
          vPulse = pulse;
          vPulseColor = pulseColor;
          #include <fog_vertex>
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        varying vec3 vPulseColor;
        varying float vPulse;
        #include <fog_pars_fragment>
        void main() {
          vec2 centered = gl_PointCoord * 2.0 - 1.0;
          float radius = dot(centered, centered);
          if (radius > 1.0) discard;
          float soft = 1.0 - smoothstep(0.05, 1.0, radius);
          vec3 color = mix(vColor, vPulseColor, clamp(vPulse, 0.0, 1.0));
          gl_FragColor = vec4(color, soft * (0.64 + min(vPulse, 1.0) * 0.36));
          #include <fog_fragment>
        }
      `
    });

    const lineGeometry = new THREE.BufferGeometry();
    lineGeometry.setAttribute("position", new THREE.BufferAttribute(connectionPositions, 3));
    const lineMaterial = new THREE.ShaderMaterial({
      uniforms: commonUniforms,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      fog: true,
      vertexShader: `
        uniform float uTime;
        uniform vec3 uPulsePositions[4];
        uniform float uPulseTimes[4];
        uniform vec3 uPulseColors[4];
        varying vec3 vPulseColor;
        varying float vPulse;
        #include <fog_pars_vertex>
        ${noiseShader}
        ${pulseShader}
        void main() {
          vec3 displaced = position;
          float organic = valueNoise(position * 0.72 + vec3(uTime * 0.075));
          displaced += normalize(position + vec3(0.001)) * (organic - 0.5) * 0.22;
          vec3 pulseColor;
          vPulse = pulseStrength(displaced, pulseColor);
          vPulseColor = pulseColor;
          vec4 mvPosition = modelViewMatrix * vec4(displaced, 1.0);
          gl_Position = projectionMatrix * mvPosition;
          #include <fog_vertex>
        }
      `,
      fragmentShader: `
        varying vec3 vPulseColor;
        varying float vPulse;
        #include <fog_pars_fragment>
        void main() {
          vec3 base = vec3(0.34, 0.48, 0.95);
          vec3 color = mix(base, vPulseColor, clamp(vPulse, 0.0, 1.0));
          gl_FragColor = vec4(color, 0.12 + min(vPulse, 1.0) * 0.58);
          #include <fog_fragment>
        }
      `
    });

    const network = new THREE.Group();
    const lines = new THREE.LineSegments(lineGeometry, lineMaterial);
    const nodes = new THREE.Points(pointGeometry, pointMaterial);
    network.add(lines, nodes);
    network.position.set(mobile ? 0 : 3.15, mobile ? -0.15 : 0, 0);
    network.scale.setScalar(mobile ? 0.84 : 1);
    scene.add(network);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.045;
    controls.enablePan = false;
    controls.autoRotate = !reduceMotion;
    controls.autoRotateSpeed = 0.2;
    controls.minDistance = 8;
    controls.maxDistance = 80;
    controls.target.copy(network.position);

    const clock = new THREE.Clock();
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    const interactionPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
    const intersection = new THREE.Vector3();
    let pulseIndex = 0;
    let running = true;

    function triggerPulse(point, colorIndex = pulseIndex) {
      const localPoint = network.worldToLocal(point.clone());
      pulsePositions[pulseIndex].copy(localPoint);
      pulseTimes[pulseIndex] = clock.getElapsedTime();
      pulseColors[pulseIndex].copy([
        new THREE.Color(0x55d8ff),
        new THREE.Color(0x667eea),
        new THREE.Color(0xff6f91),
        new THREE.Color(0xffffff)
      ][colorIndex % 4]);
      pulseIndex = (pulseIndex + 1) % 4;
    }

    function pulseFromEvent(event) {
      const rect = canvas.getBoundingClientRect();
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      if (raycaster.ray.intersectPlane(interactionPlane, intersection)) triggerPulse(intersection);
    }

    window.addEventListener("pointerdown", event => {
      if (event.target.closest("a, button, .panel-shell")) return;
      pulseFromEvent(event);
    }, { passive: true });

    function resize() {
      const width = window.innerWidth;
      const height = window.innerHeight;
      camera.aspect = width / height;
      camera.clearViewOffset();
      if (width > 768) camera.setViewOffset(width, height, width * -0.18, 0, width, height);
      camera.updateProjectionMatrix();
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, mobile ? 1.5 : 2));
      renderer.setSize(width, height, false);
      composer.setSize(width, height);
      bloom.setSize(width, height);
    }

    function animate() {
      if (!running) return;
      animationFrame = window.requestAnimationFrame(animate);
      const time = clock.getElapsedTime();
      commonUniforms.uTime.value = time;
      if (!reduceMotion) network.rotation.z = Math.sin(time * 0.08) * 0.05;
      controls.update();
      composer.render();
    }

    function dispose() {
      running = false;
      window.cancelAnimationFrame(animationFrame);
      controls.dispose();
      pointGeometry.dispose();
      pointMaterial.dispose();
      lineGeometry.dispose();
      lineMaterial.dispose();
      composer.dispose();
      renderer.dispose();
    }

    window.addEventListener("resize", resize, { passive: true });
    window.addEventListener("pagehide", dispose, { once: true });
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        running = false;
        window.cancelAnimationFrame(animationFrame);
      } else if (!running) {
        running = true;
        clock.getDelta();
        animate();
      }
    });

    resize();
    triggerPulse(network.localToWorld(new THREE.Vector3(0, 0, 0)), 0);
    animate();
    root.dataset.networkState = "ready";
    window.Face5Quantum = Object.freeze({
      ready: true,
      nodeCount,
      connectionCount: connectionPositions.length / 6,
      pulse: () => triggerPulse(network.localToWorld(new THREE.Vector3(0, 0, 0))),
      state: () => ({ ready: true, nodeCount, connectionCount: connectionPositions.length / 6, pulseIndex })
    });
  } catch (error) {
    window.cancelAnimationFrame(animationFrame);
    root.dataset.networkState = "fallback";
    window.Face5Quantum = Object.freeze({ ready: false, error: error.message });
    console.error("Face5 quantum network fallback", error);
    if (renderer) renderer.dispose();
  }
}

initNetwork();
