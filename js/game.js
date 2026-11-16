/**
 * ByteHop: The Bug Hunter Mini-Game
 * Authentic HTML5 Canvas 2D Obstacle Arcade Runner
 */

class ByteHopGame {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');

    this.overlay = document.getElementById('gameOverlay');
    this.actionBtn = document.getElementById('gameActionBtn');
    this.restartBtn = document.getElementById('restartGameBtn');
    this.soundBtn = document.getElementById('gameSoundBtn');
    this.soundIcon = document.getElementById('gameSoundIcon');
    this.scoreEl = document.getElementById('liveScore');
    this.highScoreEl = document.getElementById('highScore');
    this.headingEl = document.getElementById('overlayHeading');
    this.instructionEl = document.getElementById('overlayInstructions');

    this.soundEnabled = true;
    this.audioCtx = null;

    // Load High Score
    this.highScore = parseInt(localStorage.getItem('bytehop_highscore'), 10) || 0;
    if (this.highScoreEl) this.highScoreEl.textContent = this.highScore;

    this.initPhysics();
    this.bindEvents();
    this.drawInitialScreen();
  }

  initPhysics() {
    this.score = 0;
    this.gameSpeed = 5;
    this.isPlaying = false;
    this.isGameOver = false;
    this.frameCount = 0;

    // Player Hero
    this.player = {
      x: 60,
      y: 190,
      width: 34,
      height: 38,
      vy: 0,
      gravity: 0.85,
      jumpForce: -13.5,
      isGrounded: true,
      color: '#4F46E5'
    };

    this.groundY = 230;
    this.obstacles = [];
    this.coins = [];
  }

  bindEvents() {
    if (this.actionBtn) {
      this.actionBtn.addEventListener('click', () => this.handleActionBtn());
    }
    if (this.restartBtn) {
      this.restartBtn.addEventListener('click', () => this.restartGame());
    }
    if (this.soundBtn) {
      this.soundBtn.addEventListener('click', () => this.toggleSound());
    }

    // Canvas Click / Tap to Jump
    this.canvas.addEventListener('mousedown', (e) => {
      e.preventDefault();
      if (!this.isPlaying && !this.isGameOver) {
        this.startGame();
      } else {
        this.jump();
      }
    });

    this.canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      if (!this.isPlaying && !this.isGameOver) {
        this.startGame();
      } else {
        this.jump();
      }
    });

    // Spacebar to Jump
    window.addEventListener('keydown', (e) => {
      if (e.code === 'Space') {
        const active = document.activeElement ? document.activeElement.tagName.toLowerCase() : '';
        if (active !== 'input' && active !== 'textarea') {
          e.preventDefault();
          if (!this.isPlaying && !this.isGameOver) {
            this.startGame();
          } else {
            this.jump();
          }
        }
      }
    });
  }

  initAudio() {
    if (!this.audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) this.audioCtx = new AudioContext();
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  toggleSound() {
    this.soundEnabled = !this.soundEnabled;
    if (this.soundBtn && this.soundIcon) {
      if (this.soundEnabled) {
        this.soundIcon.className = 'fa-solid fa-volume-high';
        this.soundBtn.innerHTML = '<i class="fa-solid fa-volume-high"></i> Audio On';
      } else {
        this.soundIcon.className = 'fa-solid fa-volume-xmark';
        this.soundBtn.innerHTML = '<i class="fa-solid fa-volume-xmark"></i> Audio Off';
      }
    }
  }

  playSound(type) {
    if (!this.soundEnabled) return;
    this.initAudio();
    if (!this.audioCtx) return;

    try {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      if (type === 'jump') {
        osc.type = 'square';
        osc.frequency.setValueAtTime(260, this.audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(540, this.audioCtx.currentTime + 0.12);
        gain.gain.setValueAtTime(0.08, this.audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.12);
        osc.start();
        osc.stop(this.audioCtx.currentTime + 0.12);
      } else if (type === 'coin') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(659, this.audioCtx.currentTime);
        osc.frequency.setValueAtTime(880, this.audioCtx.currentTime + 0.08);
        gain.gain.setValueAtTime(0.12, this.audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.2);
        osc.start();
        osc.stop(this.audioCtx.currentTime + 0.2);
      } else if (type === 'hit') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(180, this.audioCtx.currentTime);
        osc.frequency.linearRampToValueAtTime(60, this.audioCtx.currentTime + 0.25);
        gain.gain.setValueAtTime(0.15, this.audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.25);
        osc.start();
        osc.stop(this.audioCtx.currentTime + 0.25);
      }
    } catch (e) {}
  }

  handleActionBtn() {
    if (this.isGameOver) {
      this.restartGame();
    } else {
      this.startGame();
    }
  }

  startGame() {
    this.initPhysics();
    this.isPlaying = true;
    this.isGameOver = false;
    if (this.overlay) this.overlay.classList.add('hidden');
    this.playSound('jump');
    this.loop();
  }

  restartGame() {
    this.initPhysics();
    this.startGame();
  }

  jump() {
    if (this.player.isGrounded && this.isPlaying) {
      this.player.vy = this.player.jumpForce;
      this.player.isGrounded = false;
      this.playSound('jump');
    }
  }

  loop() {
    if (!this.isPlaying) return;

    this.update();
    this.render();

    requestAnimationFrame(() => this.loop());
  }

  update() {
    this.frameCount++;

    // Player Gravity & Vertical Physics
    this.player.vy += this.player.gravity;
    this.player.y += this.player.vy;

    if (this.player.y >= this.groundY - this.player.height) {
      this.player.y = this.groundY - this.player.height;
      this.player.vy = 0;
      this.player.isGrounded = true;
    }

    // Progressive Speed Increase
    if (this.frameCount % 400 === 0) {
      this.gameSpeed += 0.45;
    }

    // Score accumulation
    if (this.frameCount % 6 === 0) {
      this.score += 1;
      if (this.scoreEl) this.scoreEl.textContent = this.score;
    }

    // Spawn Obstacles (Bugs / Glitches)
    if (this.frameCount % 95 === 0) {
      const isTall = Math.random() > 0.6;
      this.obstacles.push({
        x: this.canvas.width + 20,
        y: isTall ? this.groundY - 44 : this.groundY - 30,
        width: 26,
        height: isTall ? 44 : 30,
        emoji: '👾'
      });
    }

    // Spawn Clean Code Coins (Collectibles)
    if (this.frameCount % 180 === 0) {
      this.coins.push({
        x: this.canvas.width + 40,
        y: this.groundY - 70 - Math.random() * 40,
        width: 22,
        height: 22,
        collected: false
      });
    }

    // Move & Clean Obstacles
    for (let i = this.obstacles.length - 1; i >= 0; i--) {
      const obs = this.obstacles[i];
      obs.x -= this.gameSpeed;

      // Check collision with Player
      if (
        this.player.x + this.player.width - 6 > obs.x &&
        this.player.x + 6 < obs.x + obs.width &&
        this.player.y + this.player.height - 4 > obs.y
      ) {
        this.gameOver();
        return;
      }

      if (obs.x < -40) {
        this.obstacles.splice(i, 1);
      }
    }

    // Move & Collect Coins
    for (let i = this.coins.length - 1; i >= 0; i--) {
      const c = this.coins[i];
      c.x -= this.gameSpeed;

      if (!c.collected &&
        this.player.x + this.player.width > c.x &&
        this.player.x < c.x + c.width &&
        this.player.y + this.player.height > c.y &&
        this.player.y < c.y + c.height
      ) {
        c.collected = true;
        this.score += 50;
        this.playSound('coin');
        if (this.scoreEl) this.scoreEl.textContent = this.score;
      }

      if (c.x < -30 || c.collected) {
        this.coins.splice(i, 1);
      }
    }
  }

  render() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // 1. Sky & Cloud decor
    this.ctx.fillStyle = '#F8FAFC';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // 2. Decorative moving ground track
    this.ctx.fillStyle = '#0F172A';
    this.ctx.fillRect(0, this.groundY, this.canvas.width, 4);

    this.ctx.fillStyle = '#E2E8F0';
    this.ctx.fillRect(0, this.groundY + 4, this.canvas.width, this.canvas.height - this.groundY);

    // Ground hashes
    this.ctx.strokeStyle = '#CBD5E1';
    this.ctx.lineWidth = 2;
    const offset = (this.frameCount * this.gameSpeed) % 25;
    for (let x = -offset; x < this.canvas.width; x += 25) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, this.groundY + 10);
      this.ctx.lineTo(x + 10, this.groundY + 22);
      this.ctx.stroke();
    }

    // 3. Render Collectible Coins
    this.coins.forEach(c => {
      this.ctx.save();
      this.ctx.fillStyle = '#F59E0B';
      this.ctx.strokeStyle = '#0F172A';
      this.ctx.lineWidth = 2;
      this.ctx.beginPath();
      this.ctx.arc(c.x + c.width / 2, c.y + c.height / 2, c.width / 2, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.stroke();

      this.ctx.fillStyle = '#0F172A';
      this.ctx.font = 'bold 11px sans-serif';
      this.ctx.textAlign = 'center';
      this.ctx.fillText('{ }', c.x + c.width / 2, c.y + c.height / 2 + 4);
      this.ctx.restore();
    });

    // 4. Render Obstacles (Bugs)
    this.obstacles.forEach(obs => {
      this.ctx.save();
      this.ctx.fillStyle = '#EF4444';
      this.ctx.strokeStyle = '#0F172A';
      this.ctx.lineWidth = 2;

      // Spike / Bug Block
      this.ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
      this.ctx.strokeRect(obs.x, obs.y, obs.width, obs.height);

      // Warning Symbol
      this.ctx.fillStyle = '#FFFFFF';
      this.ctx.font = 'bold 13px sans-serif';
      this.ctx.textAlign = 'center';
      this.ctx.fillText('!', obs.x + obs.width / 2, obs.y + obs.height / 2 + 5);
      this.ctx.restore();
    });

    // 5. Render Player Hero (Cute Animated Tech Block)
    this.ctx.save();
    this.ctx.fillStyle = this.player.color;
    this.ctx.strokeStyle = '#0F172A';
    this.ctx.lineWidth = 2.5;

    // Body
    this.ctx.fillRect(this.player.x, this.player.y, this.player.width, this.player.height);
    this.ctx.strokeRect(this.player.x, this.player.y, this.player.width, this.player.height);

    // Hero Visor / Eyes
    this.ctx.fillStyle = '#00F59B';
    this.ctx.fillRect(this.player.x + 16, this.player.y + 8, 12, 9);
    this.ctx.strokeRect(this.player.x + 16, this.player.y + 8, 12, 9);

    // Cape / Trail
    if (!this.player.isGrounded) {
      this.ctx.fillStyle = '#EC4899';
      this.ctx.beginPath();
      this.ctx.moveTo(this.player.x, this.player.y + 12);
      this.ctx.lineTo(this.player.x - 14, this.player.y + 22);
      this.ctx.lineTo(this.player.x, this.player.y + 30);
      this.ctx.fill();
      this.ctx.stroke();
    }
    this.ctx.restore();
  }

  gameOver() {
    this.isPlaying = false;
    this.isGameOver = true;
    this.playSound('hit');

    // Update High Score
    if (this.score > this.highScore) {
      this.highScore = this.score;
      localStorage.setItem('bytehop_highscore', this.highScore);
      if (this.highScoreEl) this.highScoreEl.textContent = this.highScore;
      if (window.confetti) {
        window.confetti({ particleCount: 90, spread: 70, origin: { y: 0.6 } });
      }
    }

    if (this.headingEl) this.headingEl.textContent = `Game Over! Score: ${this.score}`;
    if (this.instructionEl) this.instructionEl.innerHTML = `You hit a runtime bug! High Score: <strong>${this.highScore}</strong>. Press button or Space to try again!`;
    if (this.actionBtn) this.actionBtn.innerHTML = '<i class="fa-solid fa-rotate-left"></i> Play Again';
    if (this.overlay) this.overlay.classList.remove('hidden');

    const wrapper = document.getElementById('canvasWrapper');
    if (wrapper) {
      wrapper.classList.add('shake');
      setTimeout(() => wrapper.classList.remove('shake'), 400);
    }
  }

  drawInitialScreen() {
    this.ctx.fillStyle = '#F8FAFC';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.fillStyle = '#0F172A';
    this.ctx.fillRect(0, this.groundY, this.canvas.width, 4);
  }
}

// Global initialization
document.addEventListener('DOMContentLoaded', () => {
  window.byteHopGame = new ByteHopGame();
});
