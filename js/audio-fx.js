/**
 * AudioFX - Lightweight Web Audio API Synthesizer
 * Provides futuristic UI feedback sounds without any external audio asset dependencies.
 */

class AudioController {
  constructor() {
    this.enabled = localStorage.getItem('sumit_portfolio_sound') === 'true';
    this.audioCtx = null;
    this.initElements();
  }

  initElements() {
    this.soundToggleBtn = document.getElementById('soundToggleBtn');
    this.soundIcon = document.getElementById('soundIcon');
    this.beacon = document.getElementById('audioBeacon');

    this.updateUI();

    if (this.soundToggleBtn) {
      this.soundToggleBtn.addEventListener('click', () => this.toggleSound());
    }
  }

  initAudioContext() {
    if (!this.audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.audioCtx = new AudioContext();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  toggleSound() {
    this.enabled = !this.enabled;
    localStorage.setItem('sumit_portfolio_sound', this.enabled);
    if (this.enabled) {
      this.initAudioContext();
      this.playChime(640, 0.15);
      this.showBeacon('Audio FX: Enabled');
    } else {
      this.showBeacon('Audio FX: Muted');
    }
    this.updateUI();
  }

  updateUI() {
    if (!this.soundIcon || !this.soundToggleBtn) return;
    if (this.enabled) {
      this.soundIcon.className = 'fa-solid fa-volume-high';
      this.soundToggleBtn.classList.add('active');
    } else {
      this.soundIcon.className = 'fa-solid fa-volume-xmark';
      this.soundToggleBtn.classList.remove('active');
    }
  }

  showBeacon(text) {
    if (!this.beacon) return;
    this.beacon.textContent = text;
    this.beacon.classList.add('show');
    clearTimeout(this.beaconTimeout);
    this.beaconTimeout = setTimeout(() => {
      this.beacon.classList.remove('show');
    }, 1800);
  }

  playClick() {
    if (!this.enabled) return;
    this.initAudioContext();
    if (!this.audioCtx) return;

    try {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, this.audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(300, this.audioCtx.currentTime + 0.05);

      gain.gain.setValueAtTime(0.08, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.05);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start();
      osc.stop(this.audioCtx.currentTime + 0.05);
    } catch (e) {
      // Audio autoplay policy fallback
    }
  }

  playHover() {
    if (!this.enabled) return;
    this.initAudioContext();
    if (!this.audioCtx) return;

    try {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(350, this.audioCtx.currentTime);
      osc.frequency.linearRampToValueAtTime(450, this.audioCtx.currentTime + 0.04);

      gain.gain.setValueAtTime(0.03, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.audioCtx.currentTime + 0.04);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start();
      osc.stop(this.audioCtx.currentTime + 0.04);
    } catch (e) {}
  }

  playTerminalKey() {
    if (!this.enabled) return;
    this.initAudioContext();
    if (!this.audioCtx) return;

    try {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(750 + Math.random() * 200, this.audioCtx.currentTime);

      gain.gain.setValueAtTime(0.02, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.audioCtx.currentTime + 0.03);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start();
      osc.stop(this.audioCtx.currentTime + 0.03);
    } catch (e) {}
  }

  playChime(freq = 587, duration = 0.2) {
    if (!this.enabled) return;
    this.initAudioContext();
    if (!this.audioCtx) return;

    try {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.5, this.audioCtx.currentTime + duration);

      gain.gain.setValueAtTime(0.09, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start();
      osc.stop(this.audioCtx.currentTime + duration);
    } catch (e) {}
  }

  playSuccess() {
    if (!this.enabled) return;
    this.playChime(523.25, 0.1);
    setTimeout(() => this.playChime(659.25, 0.12), 100);
    setTimeout(() => this.playChime(783.99, 0.25), 200);
  }
}

// Global instance
window.audioController = new AudioController();
