import * as THREE from 'three';

const container = document.getElementById('robot-canvas');

if (container) {
  boot();
}

/* --------------------------------- Scene -------------------------------- */

function boot() {
  const wrap = container;

  const getSize = () => ({
    w: wrap.clientWidth || 480,
    h: wrap.clientHeight || 320,
  });

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  } catch (err) {
    return;
  }

  const size = getSize();
  renderer.setSize(size.w, size.h);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.setClearColor(0x000000, 0);
  wrap.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(40, size.w / size.h, 0.1, 100);

  // Keep the robot framed nicely inside whatever container size we're given
  const FIT_H = 4.75; // vertical world units to keep in view (matches the original framing)
  const FIT_W = 3.4; // horizontal world units to keep in view
  function fitCamera() {
    const aspect = size.w / size.h;
    const vFov = THREE.MathUtils.degToRad(camera.fov);
    const distH = (FIT_H / 2) / Math.tan(vFov / 2);
    const distW = (FIT_W / 2) / Math.tan(vFov / 2) / aspect;
    const dist = Math.max(distH, distW);
    camera.position.set(0, 0.3, dist);
    camera.lookAt(0, 0.3, 0);
  }
  fitCamera();

  scene.add(new THREE.AmbientLight(0xffffff, 0.95));
  const key = new THREE.DirectionalLight(0xffffff, 0.9);
  key.position.set(3, 5, 5);
  key.castShadow = true;
  scene.add(key);
  const rim = new THREE.DirectionalLight(0x4cc9ff, 0.35);
  rim.position.set(-4, 2, -3);
  scene.add(rim);

  // Materials - نفس الالوان بتاعة صورة الروبوت بالظبط
  const whiteMat = new THREE.MeshStandardMaterial({ color: 0xf8f9fa, roughness: 0.22, metalness: 0.12 });
  const whiteMat2 = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.15, metalness: 0.08 });
  const silverMat = new THREE.MeshStandardMaterial({ color: 0xb8bec4, roughness: 0.28, metalness: 0.75 });
  const darkMat = new THREE.MeshStandardMaterial({ color: 0x18202c, roughness: 0.35, metalness: 0.2 });
  const eyeMat = new THREE.MeshBasicMaterial({ color: 0x00d5ff });
  const eyeGlow = new THREE.MeshBasicMaterial({ color: 0x00aaff, transparent: true, opacity: 0.3 });

  const robot = new THREE.Group();
  scene.add(robot);

  // --- BODY - زي الصورة: جسم ابيض مدور ---
  const body = new THREE.Group();
  robot.add(body);
  const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.85, 0.75, 8, 32), whiteMat);
  torso.position.y = 0;
  torso.scale.set(1, 1.08, 0.82);
  torso.castShadow = true;
  body.add(torso);
  const chest = new THREE.Mesh(new THREE.CylinderGeometry(0.52, 0.58, 0.55, 24), new THREE.MeshStandardMaterial({ color: 0xeef1f4, roughness: 0.18 }));
  chest.position.set(0, 0.15, 0.42);
  chest.scale.set(1, 1, 0.35);
  body.add(chest);
  const waist = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.58, 0.4, 24), silverMat);
  waist.position.y = -0.98;
  body.add(waist);

  // --- HEAD - زي الصورة بالظبط: مدور ابيض وودان فضي ---
  const headGroup = new THREE.Group();
  headGroup.position.set(0, 1.48, 0);
  robot.add(headGroup);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.78, 40, 40), whiteMat2);
  head.scale.set(1, 1.03, 0.96);
  head.castShadow = true;
  headGroup.add(head);
  [-1, 1].forEach((s) => {
    const ear = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.2, 32), silverMat);
    ear.rotation.z = Math.PI / 2;
    ear.position.set(s * 0.76, 0.02, 0);
    headGroup.add(ear);
    const earHole = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.17, 0.22, 24), new THREE.MeshStandardMaterial({ color: 0x8a9096, roughness: 0.4, metalness: 0.7 }));
    earHole.rotation.z = Math.PI / 2;
    earHole.position.set(s * 0.77, 0.02, 0);
    headGroup.add(earHole);
  });
  // Face - شاشة سودا
  const face = new THREE.Mesh(new THREE.BoxGeometry(0.98, 0.44, 0.14), darkMat);
  face.position.set(0, 0.06, 0.68);
  face.rotation.x = 0.06;
  headGroup.add(face);
  const eyeGroup = new THREE.Group();
  eyeGroup.position.set(0, 0.06, 0.76);
  headGroup.add(eyeGroup);
  function makeEye(x) {
    const g = new THREE.Group();
    g.position.x = x;
    eyeGroup.add(g);
    const glow = new THREE.Mesh(new THREE.CircleGeometry(0.17, 32), eyeGlow);
    g.add(glow);
    const outer = new THREE.Mesh(new THREE.CircleGeometry(0.12, 32), eyeMat);
    outer.position.z = 0.01;
    g.add(outer);
    const pupil = new THREE.Mesh(new THREE.CircleGeometry(0.055, 24), new THREE.MeshBasicMaterial({ color: 0x002a4d }));
    pupil.position.z = 0.02;
    g.add(pupil);
    const highlight = new THREE.Mesh(new THREE.CircleGeometry(0.022, 12), new THREE.MeshBasicMaterial({ color: 0xffffff }));
    highlight.position.set(0.035, 0.045, 0.03);
    g.add(highlight);
    return { g, glow };
  }
  const leftEye = makeEye(-0.26);
  const rightEye = makeEye(0.26);
  const mouth = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.018, 0.01), new THREE.MeshBasicMaterial({ color: 0x1a1a1a }));
  mouth.position.set(0, -0.38, 0.74);
  headGroup.add(mouth);
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.22, 0.35, 20), darkMat);
  neck.position.y = 1.08;
  robot.add(neck);

  // --- ARMS ---
  function makeArm(side) {
    const g = new THREE.Group();
    g.position.set(side * 0.92, 0.48, 0);
    robot.add(g);
    const shoulder = new THREE.Mesh(new THREE.SphereGeometry(0.33, 24, 24), whiteMat);
    shoulder.castShadow = true;
    g.add(shoulder);
    const upper = new THREE.Group();
    upper.position.set(side * 0.18, -0.28, 0.12);
    g.add(upper);
    const upperMesh = new THREE.Mesh(new THREE.CapsuleGeometry(0.22, 0.38, 6, 20), whiteMat);
    upperMesh.castShadow = true;
    upper.add(upperMesh);
    const elbow = new THREE.Mesh(new THREE.SphereGeometry(0.24, 20, 20), silverMat);
    elbow.position.y = -0.48;
    upper.add(elbow);
    const fore = new THREE.Group();
    fore.position.y = -0.52;
    upper.add(fore);
    const foreMesh = new THREE.Mesh(new THREE.CapsuleGeometry(0.18, 0.42, 6, 20), whiteMat);
    foreMesh.position.y = -0.28;
    foreMesh.castShadow = true;
    fore.add(foreMesh);
    const hand = new THREE.Group();
    hand.position.y = -0.62;
    fore.add(hand);
    const palm = new THREE.Mesh(new THREE.SphereGeometry(0.18, 20, 20), whiteMat);
    palm.scale.set(1, 0.72, 1.25);
    hand.add(palm);
    const fingers = [];
    for (let i = 0; i < 4; i++) {
      const f = new THREE.Group();
      f.position.set(-0.09 + i * 0.06, -0.06, 0.18);
      hand.add(f);
      const seg = new THREE.Mesh(new THREE.CapsuleGeometry(0.028, 0.18, 4, 10), whiteMat);
      seg.rotation.x = Math.PI / 2.3;
      seg.position.z = 0.08;
      f.add(seg);
      fingers.push(f);
    }
    return { g, upper, fore, hand, fingers };
  }
  const armR = makeArm(1);
  const armL = makeArm(-1);
  armR.g.rotation.set(0.35, -0.3, -0.22);
  armR.upper.rotation.x = 0.55;
  armR.fore.rotation.x = -0.95;
  armL.g.rotation.set(0.42, 0.3, 0.22);
  armL.upper.rotation.x = 0.6;
  armL.fore.rotation.x = -0.95;

  // --- LEGS - قاعد زي الصورة ---
  function makeLeg(side) {
    const g = new THREE.Group();
    g.position.set(side * 0.35, -1.15, 0);
    robot.add(g);
    const thigh = new THREE.Mesh(new THREE.CapsuleGeometry(0.28, 0.45, 6, 20), whiteMat);
    thigh.rotation.x = 1.1;
    thigh.position.set(0, -0.12, 0.28);
    thigh.castShadow = true;
    g.add(thigh);
    const knee = new THREE.Mesh(new THREE.SphereGeometry(0.3, 20, 20), whiteMat);
    knee.position.set(0, -0.28, 0.58);
    g.add(knee);
    const shin = new THREE.Mesh(new THREE.CapsuleGeometry(0.26, 0.55, 6, 20), whiteMat);
    shin.position.set(0, -0.85, 0.58);
    shin.castShadow = true;
    g.add(shin);
    const foot = new THREE.Mesh(new THREE.SphereGeometry(0.28, 20, 20), whiteMat);
    foot.position.set(0, -1.25, 0.68);
    foot.scale.set(1, 0.7, 1.4);
    g.add(foot);
    return g;
  }
  makeLeg(1);
  makeLeg(-1);

  // --- LAPTOP - زي الصورة: فضي والكيبورد اسود ---
  const laptop = new THREE.Group();
  laptop.position.set(0.12, -0.32, 1.0);
  laptop.rotation.y = -0.28;
  laptop.rotation.x = 0.06;
  robot.add(laptop);
  const base = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.06, 1.05), silverMat);
  base.castShadow = true;
  laptop.add(base);
  const keyboard = new THREE.Mesh(new THREE.BoxGeometry(1.55, 0.02, 0.88), new THREE.MeshStandardMaterial({ color: 0x2a2f36 }));
  keyboard.position.set(0, 0.045, -0.02);
  laptop.add(keyboard);
  for (let r = 0; r < 4; r++) for (let c = 0; c < 10; c++) {
    const k = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.015, 0.1), new THREE.MeshStandardMaterial({ color: 0x555b63 }));
    k.position.set(-0.65 + c * 0.145, 0.06, -0.32 + r * 0.16);
    laptop.add(k);
  }
  const screenGroup = new THREE.Group();
  screenGroup.position.set(0, 0.02, -0.5);
  laptop.add(screenGroup);
  const screen = new THREE.Mesh(new THREE.BoxGeometry(1.7, 1.08, 0.05), silverMat);
  screen.position.y = 0.54;
  screen.rotation.x = -0.18;
  screen.castShadow = true;
  screenGroup.add(screen);
  const screenFace = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.98, 0.01), new THREE.MeshStandardMaterial({ color: 0x0a1622, emissive: 0x0a2a4a, emissiveIntensity: 0.35 }));
  screenFace.position.set(0, 0.54, 0.035);
  screenFace.rotation.x = -0.18;
  screenGroup.add(screenFace);

  robot.position.y = 0.25;
  robot.rotation.y = -0.12;
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(12, 12), new THREE.ShadowMaterial({ opacity: 0.1 }));
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -1.6;
  ground.receiveShadow = true;
  scene.add(ground);

  /* ------------------------------ Interaction ----------------------------- */

  // --- التفاعل: بيبص على الماوس ---
  let mouseX = 0;
  let mouseY = 0;
  let targetRX = 0;
  let targetRY = 0;
  function onMove(e) {
    const r = wrap.getBoundingClientRect();
    const x = e.clientX ?? e.touches?.[0]?.clientX;
    const y = e.clientY ?? e.touches?.[0]?.clientY;
    if (x == null) return;
    mouseX = THREE.MathUtils.clamp(((x - r.left) / r.width) * 2 - 1, -1, 1);
    mouseY = THREE.MathUtils.clamp(-((y - r.top) / r.height) * 2 + 1, -1, 1);
    targetRY = mouseX * 0.6;
    targetRX = mouseY * 0.3;
  }
  window.addEventListener('mousemove', onMove);
  window.addEventListener('touchmove', onMove, { passive: true });

  // --- التفاعل: بيوحّي بيده لما تضغط عليه (الفقاعة بتظهر من script.js) ---
  let waveTime = -1;
  function wave() {
    waveTime = 0;
  }
  wrap.addEventListener('click', wave);

  /* --------------------------------- Loop --------------------------------- */

  let blinkTimer = 0;
  let isBlinking = false;
  let typingPhase = 0;
  const clock = new THREE.Clock();

  function tick() {
    const t = clock.getElapsedTime();
    headGroup.rotation.y += (targetRY - headGroup.rotation.y) * 0.08;
    headGroup.rotation.x += (targetRX * 0.6 - headGroup.rotation.x) * 0.08;
    robot.rotation.y += ((-0.12 + mouseX * 0.12) - robot.rotation.y) * 0.05;
    robot.position.y = 0.25 + Math.sin(t * 1.8) * 0.03;
    eyeGroup.position.x += (mouseX * 0.07 - eyeGroup.position.x) * 0.12;
    eyeGroup.position.y += (0.06 + mouseY * 0.045 - eyeGroup.position.y) * 0.12;
    blinkTimer += 0.016;
    if (blinkTimer > 3.4 && !isBlinking) {
      isBlinking = true;
      blinkTimer = 0;
    }
    if (isBlinking) {
      const s = Math.abs(Math.sin(blinkTimer * 12));
      leftEye.g.scale.y = rightEye.g.scale.y = Math.max(0.08, s);
      if (blinkTimer > 0.25) {
        isBlinking = false;
        leftEye.g.scale.y = rightEye.g.scale.y = 1;
      }
    }
    typingPhase += 0.12;
    const tap = Math.sin(typingPhase) * 0.12;
    armR.fingers.forEach((f, i) => (f.rotation.x = Math.sin(typingPhase * 2 + i) * 0.35 + tap));
    armL.fingers.forEach((f, i) => (f.rotation.x = Math.cos(typingPhase * 2 + i) * 0.35 + tap));
    armR.fore.rotation.x = -0.95 + Math.sin(typingPhase) * 0.08;
    armL.fore.rotation.x = -0.95 + Math.cos(typingPhase) * 0.08;
    const pulse = 1 + Math.sin(t * 2.5) * 0.08;
    leftEye.glow.scale.set(pulse, pulse, 1);
    rightEye.glow.scale.set(pulse, pulse, 1);
    if (waveTime >= 0) {
      waveTime += 0.016;
      if (waveTime < 1.2) {
        armR.g.rotation.z = -0.22 + Math.sin(waveTime * 12) * 0.4;
        mouth.scale.x = 1.6;
      } else {
        waveTime = -1;
        armR.g.rotation.z = -0.22;
        mouth.scale.x = 1;
      }
    }
    renderer.render(scene, camera);
  }

  renderer.setAnimationLoop(tick);

  // Pause rendering while the hero is off screen
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          clock.getDelta();
          renderer.setAnimationLoop(tick);
        } else {
          renderer.setAnimationLoop(null);
        }
      },
      { threshold: 0 }
    );
    io.observe(wrap);
  }

  /* -------------------------------- Resize ------------------------------- */

  function resize() {
    const next = getSize();
    size.w = next.w;
    size.h = next.h;
    camera.aspect = size.w / size.h;
    camera.updateProjectionMatrix();
    fitCamera();
    renderer.setSize(size.w, size.h);
  }

  window.addEventListener('resize', resize);
  if ('ResizeObserver' in window) {
    new ResizeObserver(resize).observe(wrap);
  }

  // Debug hook (harmless): inspect the scene from the console
  window.__robot = { scene, renderer, camera, robot };
}
