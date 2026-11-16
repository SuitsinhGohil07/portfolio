/**
 * Interactive Typing Speed Benchmark Challenge
 * Direct interactive proof-of-work for "Fast Typing" skill
 */

class TypingBenchmark {
  constructor() {
    this.textDisplay = document.getElementById('typingTextDisplay');
    this.inputField = document.getElementById('typingInputField');
    this.startBtn = document.getElementById('startTypingBtn');
    this.resetBtn = document.getElementById('resetTypingBtn');
    this.timerEl = document.getElementById('gameTimer');
    this.wpmEl = document.getElementById('gameWPM');
    this.accuracyEl = document.getElementById('gameAccuracy');
    this.feedbackBanner = document.getElementById('gameFeedbackBanner');

    this.sampleTexts = [
      "Information Technology bridges computational theory with practical engineering to build scalable systems and dependable software architectures.",
      "Clean code is concise, expressive, and easily readable by both junior developers and senior architects across all phases of engineering.",
      "Asynchronous JavaScript handles network promises and event loops while maintaining a smooth sixty frames per second interactive user experience.",
      "Python scripts automate repetitive market analysis pipelines, parsing structured data tables into actionable business intelligence with minimal latency.",
      "Object-oriented programming in Java establishes encapsulated data classes, polymorphic method signatures, and robust enterprise design patterns."
    ];

    this.currentText = "";
    this.currentIndex = 0;
    this.totalTyped = 0;
    this.mistakes = 0;
    this.startTime = null;
    this.timerInterval = null;
    this.duration = 30; // seconds
    this.timeLeft = this.duration;
    this.isActive = false;

    this.bindEvents();
  }

  bindEvents() {
    if (this.startBtn) {
      this.startBtn.addEventListener('click', () => this.startGame());
    }
    if (this.resetBtn) {
      this.resetBtn.addEventListener('click', () => this.resetGame());
    }
    if (this.inputField) {
      this.inputField.addEventListener('input', (e) => this.handleTyping(e));
    }
  }

  startGame() {
    this.isActive = true;
    this.timeLeft = this.duration;
    this.totalTyped = 0;
    this.mistakes = 0;
    this.currentIndex = 0;

    // Pick random text
    const randIdx = Math.floor(Math.random() * this.sampleTexts.length);
    this.currentText = this.sampleTexts[randIdx];

    // Render characters
    this.renderCharacters();

    this.inputField.disabled = false;
    this.inputField.value = '';
    this.inputField.focus();

    this.timerEl.textContent = `${this.timeLeft}s`;
    this.wpmEl.textContent = `0 WPM`;
    this.accuracyEl.textContent = `100%`;
    this.feedbackBanner.innerHTML = `<span style="color: var(--accent-primary);">Challenge active! Type the text accurately above as fast as you can.</span>`;

    this.startBtn.disabled = true;
    this.startTime = Date.now();

    clearInterval(this.timerInterval);
    this.timerInterval = setInterval(() => {
      this.timeLeft--;
      this.timerEl.textContent = `${this.timeLeft}s`;
      this.updateMetrics();

      if (this.timeLeft <= 0) {
        this.endGame();
      }
    }, 1000);

    if (window.audioController) window.audioController.playClick();
  }

  renderCharacters() {
    this.textDisplay.innerHTML = '';
    this.currentText.split('').forEach((char, index) => {
      const span = document.createElement('span');
      span.textContent = char;
      span.className = 'typing-char';
      if (index === 0) span.classList.add('current');
      this.textDisplay.appendChild(span);
    });
  }

  handleTyping(e) {
    if (!this.isActive) return;

    const val = this.inputField.value;
    const charSpans = this.textDisplay.querySelectorAll('.typing-char');
    this.totalTyped++;

    if (window.audioController) window.audioController.playTerminalKey();

    // Check last entered character
    const typedChar = val[val.length - 1];
    const targetChar = this.currentText[val.length - 1];

    if (val.length <= this.currentText.length) {
      charSpans.forEach((span, i) => {
        span.classList.remove('current');
        if (i < val.length) {
          if (val[i] === this.currentText[i]) {
            span.className = 'typing-char correct';
          } else {
            span.className = 'typing-char incorrect';
          }
        } else {
          span.className = 'typing-char';
        }
      });

      if (val.length < this.currentText.length) {
        charSpans[val.length].classList.add('current');
      }

      // Track mistakes
      if (typedChar !== targetChar && typedChar !== undefined) {
        this.mistakes++;
      }
    }

    this.updateMetrics();

    // Completed all text in prompt
    if (val.length >= this.currentText.length) {
      this.endGame(true);
    }
  }

  updateMetrics() {
    if (!this.startTime) return;
    const elapsedMinutes = (Date.now() - this.startTime) / 60000;
    if (elapsedMinutes <= 0) return;

    const val = this.inputField.value;
    // Standard calculation: (characters / 5) / minutes
    const calculatedWPM = Math.round((val.length / 5) / elapsedMinutes) || 0;
    this.wpmEl.textContent = `${calculatedWPM} WPM`;

    const accuracy = this.totalTyped > 0 
      ? Math.max(0, Math.round(((this.totalTyped - this.mistakes) / this.totalTyped) * 100))
      : 100;
    this.accuracyEl.textContent = `${accuracy}%`;
  }

  endGame(finishedEarly = false) {
    clearInterval(this.timerInterval);
    this.isActive = false;
    this.inputField.disabled = true;
    this.startBtn.disabled = false;

    this.updateMetrics();
    const finalWPM = parseInt(this.wpmEl.textContent, 10) || 0;

    if (finalWPM >= 70) {
      this.feedbackBanner.innerHTML = `
        <span style="color: var(--accent-success); font-weight: 600;">
          🏆 Fantastic! You clocked in at ${finalWPM} WPM, matching Sumit's pro typing velocity!
        </span>
      `;
      if (window.confetti) {
        window.confetti({ particleCount: 120, spread: 80, origin: { y: 0.7 } });
      }
      if (window.audioController) window.audioController.playSuccess();
    } else {
      this.feedbackBanner.innerHTML = `
        <span style="color: var(--text-primary);">
          🎯 Good run! You achieved <strong>${finalWPM} WPM</strong>. Sumit clocks in at <strong>75+ WPM</strong> &mdash; try another round!
        </span>
      `;
      if (window.audioController) window.audioController.playChime(440, 0.2);
    }
  }

  resetGame() {
    clearInterval(this.timerInterval);
    this.isActive = false;
    this.timeLeft = this.duration;
    this.inputField.value = '';
    this.inputField.disabled = true;
    this.startBtn.disabled = false;
    this.timerEl.textContent = `${this.duration}s`;
    this.wpmEl.textContent = '0 WPM';
    this.accuracyEl.textContent = '100%';
    this.textDisplay.innerHTML = `Click "Start Challenge" to load a randomized IT/programming phrase and test your velocity!`;
    this.feedbackBanner.innerHTML = `<span>Ready to type? Benchmark tests your speed and accuracy in real-time.</span>`;
    if (window.audioController) window.audioController.playClick();
  }
}

// Global instance
window.typingBenchmark = new TypingBenchmark();
