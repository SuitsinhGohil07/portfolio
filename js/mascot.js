/**
 * Interactive Cartoon Bot Mascot
 * Eye tracking system following mouse cursor + playful click interactions
 */

document.addEventListener('DOMContentLoaded', () => {
  const pupilLeft = document.getElementById('pupilLeft');
  const pupilRight = document.getElementById('pupilRight');
  const botMouth = document.getElementById('botMouth');
  const botMascot = document.getElementById('botMascot');
  const speechBubble = document.getElementById('speechBubble');

  if (!pupilLeft || !pupilRight) return;

  // Track cursor position and move pupils
  window.addEventListener('mousemove', (e) => {
    movePupil(pupilLeft, e.clientX, e.clientY);
    movePupil(pupilRight, e.clientX, e.clientY);
  });

  function movePupil(pupilEl, mouseX, mouseY) {
    const rect = pupilEl.parentElement.getBoundingClientRect();
    const eyeCenterX = rect.left + rect.width / 2;
    const eyeCenterY = rect.top + rect.height / 2;

    const deltaX = mouseX - eyeCenterX;
    const deltaY = mouseY - eyeCenterY;
    const angle = Math.atan2(deltaY, deltaX);

    // Limit maximum pupil offset inside eye socket
    const distance = Math.min(Math.hypot(deltaX, deltaY) / 18, 6.5);
    const offsetX = Math.cos(angle) * distance;
    const offsetY = Math.sin(angle) * distance;

    pupilEl.style.transform = `translate(calc(-50% + ${offsetX}px), calc(-50% + ${offsetY}px))`;
  }

  // Mascot Click Interactions & Easter Eggs
  const quips = [
    "Beep boop! Sumit's code compiled with 0 errors! 🚀",
    "Fun Fact: Sumit earned an 8.62 CGPA in IT Diploma! 🎓",
    "Did you try playing the ByteHop game below? 👾",
    "Clean code, high velocity, and scalable systems! ⚡",
    "Adding coffee to developer fuel tanks... ☕"
  ];

  let quipIdx = 0;

  if (botMascot) {
    botMascot.addEventListener('click', () => {
      // Smile animation
      if (botMouth) {
        botMouth.style.height = '14px';
        botMouth.style.borderRadius = '0 0 14px 14px';
        botMouth.style.background = '#EC4899';
      }

      // Confetti burst
      if (window.confetti) {
        window.confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.45, x: 0.75 }
        });
      }

      // Speech bubble quote
      if (speechBubble) {
        speechBubble.innerHTML = `<span>${quips[quipIdx]}</span>`;
        quipIdx = (quipIdx + 1) % quips.length;
      }

      setTimeout(() => {
        if (botMouth) {
          botMouth.style.height = '6px';
          botMouth.style.borderRadius = '4px';
          botMouth.style.background = 'var(--color-cyan)';
        }
      }, 2400);
    });
  }
});
