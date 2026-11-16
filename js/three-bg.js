/**
 * Interactive 3D Canvas Background & Matrix Rain Engine
 * High-performance, low-power WebGL / Canvas ambient background
 */

class BackgroundVisualizer {
  constructor() {
    this.canvas = document.getElementById('bg-canvas');
    this.matrixCanvas = document.getElementById('matrix-canvas');
    this.mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
    this.isMatrixActive = false;
    this.reducedMotion = document.body.classList.contains('reduced-motion') || 
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    this.init();
    this.initMatrixRain();
  }

  init() {
    if (this.reducedMotion || !this.canvas) return;

    if (window.THREE) {
      this.initThreeScene();
    } else {
      this.initCanvasFallback();
    }

    window.addEventListener('resize', () => this.onWindowResize());
    window.addEventListener('mousemove', (e) => this.onMouseMove(e));
  }

  initThreeScene() {
    try {
      this.scene = new THREE.Scene();
      this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
      this.camera.position.z = 24;

      this.renderer = new THREE.WebGLRenderer({
        canvas: this.canvas,
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance'
      });
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));

      // Particle Geometry & Mesh
      const particleCount = 140;
      const geometry = new THREE.BufferGeometry();
      const positions = new Float32Array(particleCount * 3);
      const velocities = [];

      for (let i = 0; i < particleCount * 3; i += 3) {
        positions[i] = (Math.random() - 0.5) * 45;
        positions[i + 1] = (Math.random() - 0.5) * 45;
        positions[i + 2] = (Math.random() - 0.5) * 30;

        velocities.push({
          x: (Math.random() - 0.5) * 0.02,
          y: (Math.random() - 0.5) * 0.02,
          z: (Math.random() - 0.5) * 0.015
        });
      }

      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      this.particleVelocities = velocities;

      const pMaterial = new THREE.PointsMaterial({
        color: 0x00f2fe,
        size: 1.6,
        transparent: true,
        opacity: 0.65,
        blending: THREE.AdditiveBlending
      });

      this.particles = new THREE.Points(geometry, pMaterial);
      this.scene.add(this.particles);

      // Rotating Wireframe Icosahedron node
      const icoGeo = new THREE.IcosahedronGeometry(7, 1);
      const icoMat = new THREE.MeshBasicMaterial({
        color: 0x4facfe,
        wireframe: true,
        transparent: true,
        opacity: 0.14
      });
      this.wireframeMesh = new THREE.Mesh(icoGeo, icoMat);
      this.scene.add(this.wireframeMesh);

      this.animate();
    } catch (err) {
      console.warn("Three.js initialization failed, switching to Canvas fallback", err);
      this.initCanvasFallback();
    }
  }

  initCanvasFallback() {
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;

    this.dots = [];
    const count = Math.floor((window.innerWidth * window.innerHeight) / 18000);
    for (let i = 0; i < count; i++) {
      this.dots.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        vx: (Math.random() - 0.5) * 0.6,
        vy: (Math.random() - 0.5) * 0.6,
        radius: Math.random() * 2 + 1
      });
    }

    this.animateCanvas();
  }

  onMouseMove(e) {
    this.mouse.targetX = (e.clientX / window.innerWidth - 0.5) * 2;
    this.mouse.targetY = -(e.clientY / window.innerHeight - 0.5) * 2;
  }

  onWindowResize() {
    if (this.camera && this.renderer) {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    } else if (this.canvas) {
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
    }

    if (this.matrixCanvas) {
      this.matrixCanvas.width = window.innerWidth;
      this.matrixCanvas.height = window.innerHeight;
    }
  }

  animate() {
    if (this.reducedMotion) return;

    requestAnimationFrame(() => this.animate());

    // Mouse ease
    this.mouse.x += (this.mouse.targetX - this.mouse.x) * 0.05;
    this.mouse.y += (this.mouse.targetY - this.mouse.y) * 0.05;

    if (this.wireframeMesh) {
      this.wireframeMesh.rotation.x += 0.002;
      this.wireframeMesh.rotation.y += 0.003;
      this.wireframeMesh.position.x = this.mouse.x * 2;
      this.wireframeMesh.position.y = this.mouse.y * 2;
    }

    if (this.particles) {
      this.particles.rotation.y += 0.0008;
      const positions = this.particles.geometry.attributes.position.array;
      const count = positions.length / 3;

      for (let i = 0; i < count; i++) {
        const idx = i * 3;
        positions[idx] += this.particleVelocities[i].x;
        positions[idx + 1] += this.particleVelocities[i].y;
        positions[idx + 2] += this.particleVelocities[i].z;

        if (positions[idx] > 25 || positions[idx] < -25) this.particleVelocities[i].x *= -1;
        if (positions[idx + 1] > 25 || positions[idx + 1] < -25) this.particleVelocities[i].y *= -1;
        if (positions[idx + 2] > 18 || positions[idx + 2] < -18) this.particleVelocities[i].z *= -1;
      }
      this.particles.geometry.attributes.position.needsUpdate = true;
    }

    this.renderer.render(this.scene, this.camera);
  }

  animateCanvas() {
    if (this.reducedMotion) return;
    requestAnimationFrame(() => this.animateCanvas());

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    for (let i = 0; i < this.dots.length; i++) {
      const d = this.dots[i];
      d.x += d.vx;
      d.y += d.vy;

      if (d.x < 0 || d.x > this.canvas.width) d.vx *= -1;
      if (d.y < 0 || d.y > this.canvas.height) d.vy *= -1;

      this.ctx.beginPath();
      this.ctx.arc(d.x, d.y, d.radius, 0, Math.PI * 2);
      this.ctx.fillStyle = 'rgba(0, 242, 254, 0.45)';
      this.ctx.fill();

      // Connect nearby dots
      for (let j = i + 1; j < this.dots.length; j++) {
        const d2 = this.dots[j];
        const dist = Math.hypot(d.x - d2.x, d.y - d2.y);
        if (dist < 110) {
          this.ctx.beginPath();
          this.ctx.moveTo(d.x, d.y);
          this.ctx.lineTo(d2.x, d2.y);
          this.ctx.strokeStyle = `rgba(0, 242, 254, ${0.18 * (1 - dist / 110)})`;
          this.ctx.lineWidth = 0.8;
          this.ctx.stroke();
        }
      }
    }
  }

  // ==========================================
  // MATRIX RAIN CANVAS ENGINE
  // ==========================================
  initMatrixRain() {
    if (!this.matrixCanvas) return;
    this.mCtx = this.matrixCanvas.getContext('2d');
    this.matrixCanvas.width = window.innerWidth;
    this.matrixCanvas.height = window.innerHeight;

    this.matrixChars = '0123456789ABCDEFΣΠΩλψITPYTHONJAVASCRIPT';
    this.fontSize = 15;
    this.columns = Math.floor(this.matrixCanvas.width / this.fontSize);
    this.drops = [];

    for (let i = 0; i < this.columns; i++) {
      this.drops[i] = Math.floor(Math.random() * -100);
    }
  }

  toggleMatrixRain(forceState = null) {
    this.isMatrixActive = forceState !== null ? forceState : !this.isMatrixActive;

    if (this.isMatrixActive) {
      this.matrixCanvas.classList.add('active');
      this.runMatrixLoop();
    } else {
      this.matrixCanvas.classList.remove('active');
    }

    return this.isMatrixActive;
  }

  runMatrixLoop() {
    if (!this.isMatrixActive) return;

    this.mCtx.fillStyle = 'rgba(5, 10, 8, 0.08)';
    this.mCtx.fillRect(0, 0, this.matrixCanvas.width, this.matrixCanvas.height);

    this.mCtx.fillStyle = '#00f59b';
    this.mCtx.font = `${this.fontSize}px 'Fira Code', monospace`;

    for (let i = 0; i < this.drops.length; i++) {
      const text = this.matrixChars.charAt(Math.floor(Math.random() * this.matrixChars.length));
      this.mCtx.fillText(text, i * this.fontSize, this.drops[i] * this.fontSize);

      if (this.drops[i] * this.fontSize > this.matrixCanvas.height && Math.random() > 0.975) {
        this.drops[i] = 0;
      }
      this.drops[i]++;
    }

    setTimeout(() => {
      requestAnimationFrame(() => this.runMatrixLoop());
    }, 33);
  }
}

// Global instance
window.bgVisualizer = new BackgroundVisualizer();
