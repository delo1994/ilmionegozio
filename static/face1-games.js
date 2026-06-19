(function () {
  "use strict";

  const overlay = document.getElementById("face1Arcade");
  const canvas = document.getElementById("face1ArcadeCanvas");
  const stage = overlay && overlay.querySelector(".face1-arcade-stage");
  const title = document.getElementById("face1ArcadeTitle");
  const description = document.getElementById("face1ArcadeDescription");
  const scoreLabel = document.getElementById("face1ArcadeScore");
  const timeLabel = document.getElementById("face1ArcadeTime");
  const instructions = document.getElementById("face1ArcadeInstructions");
  const feedback = document.getElementById("face1ArcadeFeedback");
  const restartButton = document.getElementById("face1ArcadeRestart");
  const closeButton = document.getElementById("face1ArcadeClose");

  if (!overlay || !canvas || !stage || !window.THREE) return;
  overlay.inert = true;

  const THREE = window.THREE;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const games = {
    virtual: {
      title: "Portale VR",
      description: "Attraversa una rete virtuale tridimensionale e stabilizza i nodi del portale.",
      instructions: "Tocca i nodi luminosi nello spazio 3D. Stabilizzane 12 prima che il portale collassi.",
      goal: 12,
      duration: 30,
      targetCount: 11,
      color: 0x44ddff,
      accent: 0x8b5cff
    },
    diamond: {
      title: "Prisma Quantico",
      description: "Il diamante ha aperto una camera di rifrazione nel mondo virtuale.",
      instructions: "Cattura 10 frammenti di diamante mentre orbitano nel campo quantico.",
      goal: 10,
      duration: 26,
      targetCount: 9,
      color: 0x55aaff,
      accent: 0xff55dd
    },
    coffee: {
      title: "Barista Orbitale",
      description: "La SpaceDrive ha disperso una miscela di caffe nello spazio 3D.",
      instructions: "Raccogli 15 chicchi buoni. I chicchi bruciati neri fanno perdere un punto.",
      goal: 15,
      duration: 32,
      targetCount: 12,
      color: 0xd58a4a,
      accent: 0xffd166
    }
  };

  let renderer = null;
  let scene = null;
  let camera = null;
  let centerpiece = null;
  let activeType = null;
  let playing = false;
  let score = 0;
  let timeLeft = 0;
  let lastFrame = 0;
  let frameId = 0;
  let lastTrigger = null;
  let resizeObserver = null;
  const targets = [];
  const particles = [];
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();

  function disposeMaterial(material) {
    if (!material) return;
    if (Array.isArray(material)) material.forEach(disposeMaterial);
    else material.dispose();
  }

  function disposeScene() {
    if (!scene) return;
    scene.traverse(function (object) {
      if (object.geometry) object.geometry.dispose();
      if (object.material) disposeMaterial(object.material);
    });
    targets.length = 0;
    particles.length = 0;
    scene = null;
    centerpiece = null;
  }

  function ensureRenderer() {
    if (renderer) return true;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        antialias: !window.matchMedia("(max-width: 700px)").matches,
        alpha: false,
        powerPreference: "high-performance"
      });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.6));
      renderer.outputEncoding = THREE.sRGBEncoding;
      resizeRenderer();
      resizeObserver = new ResizeObserver(resizeRenderer);
      resizeObserver.observe(stage);
      return true;
    } catch (error) {
      feedback.textContent = "WebGL non e disponibile su questo dispositivo.";
      document.documentElement.dataset.face1GameState = "fallback";
      console.error("Face1 arcade WebGL fallback", error);
      return false;
    }
  }

  function resizeRenderer() {
    if (!renderer || !stage) return;
    const width = Math.max(1, stage.clientWidth);
    const height = Math.max(1, stage.clientHeight);
    renderer.setSize(width, height, false);
    if (camera) {
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    }
  }

  function addStars(config) {
    const count = window.matchMedia("(max-width: 700px)").matches ? 120 : 220;
    const positions = new Float32Array(count * 3);
    for (let index = 0; index < count; index += 1) {
      positions[index * 3] = (Math.random() - 0.5) * 24;
      positions[index * 3 + 1] = (Math.random() - 0.5) * 15;
      positions[index * 3 + 2] = -2 - Math.random() * 14;
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const material = new THREE.PointsMaterial({ color: config.color, size: 0.055, transparent: true, opacity: 0.7 });
    scene.add(new THREE.Points(geometry, material));
  }

  function createCoffeeCup() {
    const group = new THREE.Group();
    const cup = new THREE.Mesh(
      new THREE.CylinderGeometry(0.9, 0.72, 1.45, 28, 1, true),
      new THREE.MeshStandardMaterial({ color: 0xf5eee6, roughness: 0.28, metalness: 0.12, side: THREE.DoubleSide })
    );
    const coffee = new THREE.Mesh(
      new THREE.CylinderGeometry(0.7, 0.7, 0.08, 28),
      new THREE.MeshStandardMaterial({ color: 0x4b230e, emissive: 0x180803, roughness: 0.65 })
    );
    coffee.position.y = 0.7;
    const handle = new THREE.Mesh(
      new THREE.TorusGeometry(0.5, 0.13, 12, 28, Math.PI * 1.55),
      new THREE.MeshStandardMaterial({ color: 0xf5eee6, roughness: 0.28 })
    );
    handle.position.x = 0.8;
    handle.rotation.z = Math.PI / 2;
    group.add(cup, coffee, handle);
    return group;
  }

  function createCenterpiece(type, config) {
    if (type === "virtual") {
      const group = new THREE.Group();
      const knot = new THREE.Mesh(
        new THREE.TorusKnotGeometry(1.45, 0.34, 120, 14, 2, 3),
        new THREE.MeshStandardMaterial({ color: config.color, emissive: config.accent, emissiveIntensity: 0.45, wireframe: true })
      );
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(2.55, 0.05, 10, 80),
        new THREE.MeshBasicMaterial({ color: config.accent, transparent: true, opacity: 0.68 })
      );
      ring.rotation.x = Math.PI / 2.7;
      group.add(knot, ring);
      return group;
    }
    if (type === "diamond") {
      const group = new THREE.Group();
      const prism = new THREE.Mesh(
        new THREE.OctahedronGeometry(1.8, 1),
        new THREE.MeshPhysicalMaterial({
          color: config.color,
          emissive: config.accent,
          emissiveIntensity: 0.18,
          metalness: 0.25,
          roughness: 0.08,
          transparent: true,
          opacity: 0.72,
          wireframe: true
        })
      );
      const halo = new THREE.Mesh(
        new THREE.TorusGeometry(2.45, 0.08, 12, 72),
        new THREE.MeshBasicMaterial({ color: config.accent, transparent: true, opacity: 0.6 })
      );
      halo.rotation.x = Math.PI / 2;
      group.add(prism, halo);
      return group;
    }
    return createCoffeeCup();
  }

  function buildScene(type) {
    disposeScene();
    const config = games[type];
    scene = new THREE.Scene();
    scene.background = new THREE.Color(type === "coffee" ? 0x120905 : 0x03050d);
    scene.fog = new THREE.FogExp2(scene.background, 0.045);
    camera = new THREE.PerspectiveCamera(55, 1, 0.1, 80);
    camera.position.set(0, 0.25, 10.8);

    scene.add(new THREE.HemisphereLight(0xffffff, type === "coffee" ? 0x4b1808 : 0x15103d, 1.45));
    const key = new THREE.PointLight(config.color, 2.4, 25);
    key.position.set(4, 5, 7);
    scene.add(key);
    const rim = new THREE.PointLight(config.accent, 2, 22);
    rim.position.set(-5, -2, 4);
    scene.add(rim);

    const grid = new THREE.GridHelper(24, 24, config.color, 0x172038);
    grid.rotation.x = Math.PI / 2;
    grid.position.z = -5;
    grid.material.transparent = true;
    grid.material.opacity = 0.22;
    scene.add(grid);
    addStars(config);

    centerpiece = createCenterpiece(type, config);
    centerpiece.position.set(0, 0, -1.4);
    scene.add(centerpiece);
    for (let index = 0; index < config.targetCount; index += 1) spawnTarget(index);
    resizeRenderer();
  }

  function targetGeometry(type) {
    if (type === "virtual") return new THREE.IcosahedronGeometry(0.42, 1);
    if (type === "diamond") return new THREE.OctahedronGeometry(0.48, 0);
    return new THREE.SphereGeometry(0.42, 18, 12);
  }

  function spawnTarget(index) {
    const config = games[activeType];
    const burnt = activeType === "coffee" && index % 5 === 0;
    const color = burnt ? 0x090909 : activeType === "coffee" ? (index % 4 === 0 ? 0xffd166 : 0x8b451f) : (index % 3 === 0 ? config.accent : config.color);
    const material = new THREE.MeshStandardMaterial({
      color: color,
      emissive: burnt ? 0x220000 : color,
      emissiveIntensity: burnt ? 0.08 : 0.42,
      roughness: activeType === "coffee" ? 0.48 : 0.16,
      metalness: activeType === "coffee" ? 0.05 : 0.55
    });
    const target = new THREE.Mesh(targetGeometry(activeType), material);
    if (activeType === "coffee") target.scale.set(0.66, 1.05, 0.48);
    target.position.set((Math.random() - 0.5) * 7.7, (Math.random() - 0.5) * 4.6, -0.4 + Math.random() * 2.4);
    target.userData.arcadeTarget = true;
    target.userData.positive = !burnt;
    target.userData.value = activeType === "coffee" && index % 4 === 0 && !burnt ? 2 : 1;
    target.userData.velocity = new THREE.Vector3((Math.random() - 0.5) * 0.52, (Math.random() - 0.5) * 0.44, 0);
    target.userData.phase = Math.random() * Math.PI * 2;
    target.userData.orbitRadius = 2.4 + Math.random() * 2.1;
    target.userData.orbitSpeed = 0.35 + Math.random() * 0.48;
    target.userData.baseScale = target.scale.clone();
    targets.push(target);
    scene.add(target);
  }

  function createBurst(position, color) {
    for (let index = 0; index < 9; index += 1) {
      const particle = new THREE.Mesh(
        new THREE.TetrahedronGeometry(0.08 + Math.random() * 0.08),
        new THREE.MeshBasicMaterial({ color: color, transparent: true, opacity: 0.9 })
      );
      particle.position.copy(position);
      particle.userData.velocity = new THREE.Vector3((Math.random() - 0.5) * 4, (Math.random() - 0.5) * 4, (Math.random() - 0.5) * 2);
      particle.userData.life = 0.55;
      particles.push(particle);
      scene.add(particle);
    }
  }

  function removeTarget(target) {
    const index = targets.indexOf(target);
    if (index >= 0) targets.splice(index, 1);
    createBurst(target.position, target.material.color);
    scene.remove(target);
    target.geometry.dispose();
    disposeMaterial(target.material);
    spawnTarget(Math.floor(Math.random() * 1000) + 1);
  }

  function updateHud() {
    const config = games[activeType];
    scoreLabel.textContent = "Punteggio " + score + " / " + config.goal;
    timeLabel.textContent = "Tempo " + Math.max(0, Math.ceil(timeLeft)) + "s";
    document.documentElement.dataset.face1GameScore = String(score);
  }

  function finish(won) {
    playing = false;
    document.documentElement.dataset.face1GameState = won ? "completed" : "timeout";
    feedback.textContent = won ? "MISSIONE COMPLETATA" : "TEMPO ESAURITO";
    feedback.classList.remove("active");
    void feedback.offsetWidth;
    feedback.classList.add("active");
    restartButton.textContent = "Rigioca";
    restartButton.hidden = false;
  }

  function registerHit(target) {
    if (!playing || !target) return;
    if (target.userData.positive) {
      score += target.userData.value || 1;
      feedback.textContent = activeType === "coffee" ? "+ miscela raccolta" : "+ nodo stabilizzato";
      feedback.dataset.tone = "positive";
    } else {
      score = Math.max(0, score - 1);
      feedback.textContent = "Chicco bruciato: -1";
      feedback.dataset.tone = "negative";
    }
    feedback.classList.remove("active");
    void feedback.offsetWidth;
    feedback.classList.add("active");
    removeTarget(target);
    updateHud();
    if (score >= games[activeType].goal) finish(true);
  }

  function handlePointer(event) {
    if (!playing || !camera || !scene) return;
    event.preventDefault();
    const rect = canvas.getBoundingClientRect();
    pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);
    const hits = raycaster.intersectObjects(targets, false);
    if (hits.length) registerHit(hits[0].object);
  }

  function updateTarget(target, delta, elapsed) {
    target.rotation.x += delta * 1.8;
    target.rotation.y += delta * 2.3;
    if (activeType === "diamond") {
      target.userData.phase += delta * target.userData.orbitSpeed;
      target.position.x = Math.cos(target.userData.phase) * target.userData.orbitRadius;
      target.position.y = Math.sin(target.userData.phase * 1.4) * 2.2;
      target.position.z = Math.sin(target.userData.phase) * 1.5;
    } else {
      target.position.addScaledVector(target.userData.velocity, delta);
      target.position.y += Math.sin(elapsed * 2 + target.userData.phase) * delta * 0.18;
      if (Math.abs(target.position.x) > 4.4) target.userData.velocity.x *= -1;
      if (Math.abs(target.position.y) > 2.8) target.userData.velocity.y *= -1;
    }
    if (!reduceMotion) {
      const pulse = 1 + Math.sin(elapsed * 3 + target.userData.phase) * 0.08;
      target.scale.copy(target.userData.baseScale).multiplyScalar(pulse);
    }
  }

  function renderFrame(timestamp) {
    if (!overlay.classList.contains("active") || !renderer || !scene) return;
    frameId = window.requestAnimationFrame(renderFrame);
    const delta = Math.min(0.05, Math.max(0, (timestamp - lastFrame) / 1000 || 0));
    lastFrame = timestamp;
    const elapsed = timestamp / 1000;
    if (playing) {
      timeLeft -= delta;
      if (timeLeft <= 0) finish(false);
      updateHud();
    }
    if (centerpiece && !reduceMotion) {
      centerpiece.rotation.x += delta * 0.2;
      centerpiece.rotation.y += delta * 0.42;
    }
    targets.forEach(function (target) { updateTarget(target, delta, elapsed); });
    for (let index = particles.length - 1; index >= 0; index -= 1) {
      const particle = particles[index];
      particle.userData.life -= delta;
      particle.position.addScaledVector(particle.userData.velocity, delta);
      particle.material.opacity = Math.max(0, particle.userData.life / 0.55);
      if (particle.userData.life <= 0) {
        scene.remove(particle);
        particle.geometry.dispose();
        disposeMaterial(particle.material);
        particles.splice(index, 1);
      }
    }
    renderer.render(scene, camera);
  }

  function restart() {
    if (!activeType || !ensureRenderer()) return;
    const config = games[activeType];
    score = 0;
    timeLeft = config.duration;
    playing = true;
    feedback.textContent = "";
    feedback.classList.remove("active");
    restartButton.hidden = true;
    buildScene(activeType);
    updateHud();
    document.documentElement.dataset.face1Game = activeType;
    document.documentElement.dataset.face1GameState = "playing";
  }

  function start(type, trigger) {
    if (!games[type]) return false;
    activeType = type;
    lastTrigger = trigger || document.activeElement;
    const config = games[type];
    title.textContent = config.title;
    description.textContent = config.description;
    instructions.textContent = config.instructions;
    overlay.classList.add("active");
    overlay.inert = false;
    overlay.setAttribute("aria-hidden", "false");
    document.body.classList.add("face1-arcade-open");
    if (!ensureRenderer()) return false;
    restart();
    window.cancelAnimationFrame(frameId);
    lastFrame = performance.now();
    frameId = window.requestAnimationFrame(renderFrame);
    window.setTimeout(function () { closeButton.focus(); }, 40);
    return true;
  }

  function close() {
    playing = false;
    window.cancelAnimationFrame(frameId);
    overlay.classList.remove("active");
    overlay.inert = true;
    overlay.setAttribute("aria-hidden", "true");
    document.body.classList.remove("face1-arcade-open");
    document.documentElement.dataset.face1GameState = "closed";
    disposeScene();
    if (lastTrigger && typeof lastTrigger.focus === "function") lastTrigger.focus();
  }

  canvas.addEventListener("pointerdown", handlePointer, { passive: false });
  closeButton.addEventListener("click", close);
  restartButton.addEventListener("click", restart);
  overlay.querySelector(".face1-arcade-backdrop").addEventListener("click", close);
  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && overlay.classList.contains("active")) close();
  });
  window.addEventListener("pagehide", function () {
    window.cancelAnimationFrame(frameId);
    if (resizeObserver) resizeObserver.disconnect();
    disposeScene();
    if (renderer) renderer.dispose();
  }, { once: true });

  window.Face1Arcade = Object.freeze({
    start: start,
    close: close,
    restart: restart,
    simulateHit: function () {
      const target = targets.find(function (item) { return item.userData.positive; });
      if (target) registerHit(target);
    },
    targetPoint: function () {
      const target = targets.find(function (item) { return item.userData.positive; });
      if (!target || !camera) return null;
      const projected = target.position.clone().project(camera);
      const rect = canvas.getBoundingClientRect();
      return {
        x: rect.left + (projected.x + 1) * 0.5 * rect.width,
        y: rect.top + (-projected.y + 1) * 0.5 * rect.height
      };
    },
    state: function () {
      return {
        type: activeType,
        playing: playing,
        score: score,
        goal: activeType ? games[activeType].goal : 0,
        timeLeft: Math.max(0, timeLeft),
        targets: targets.length
      };
    }
  });
}());
