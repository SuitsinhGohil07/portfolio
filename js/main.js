/**
 * Main Application Logic
 * Sumitsinh Gohil - IT Engineering Portfolio
 */

document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initContactForm();
});

// ==========================================
// 1. NAVIGATION & MOBILE HAMBURGER
// ==========================================
function initNavigation() {
  const mobileToggle = document.getElementById('mobileToggle');
  const navMenu = document.getElementById('navMenu');
  const navItems = document.querySelectorAll('.nav-item');

  if (mobileToggle && navMenu) {
    mobileToggle.addEventListener('click', () => {
      navMenu.classList.toggle('open');
    });

    navItems.forEach(item => {
      item.addEventListener('click', () => {
        navMenu.classList.remove('open');
      });
    });
  }

  // Active section scrollspy
  window.addEventListener('scroll', () => {
    const scrollPos = window.scrollY + 140;
    const sections = document.querySelectorAll('section[id]');

    sections.forEach(sec => {
      const top = sec.offsetTop;
      const height = sec.offsetHeight;
      const id = sec.getAttribute('id');

      if (scrollPos >= top && scrollPos < top + height) {
        navItems.forEach(link => {
          link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
        });
      }
    });
  });
}

// ==========================================
// 2. CONTACT FORM SIMULATION
// ==========================================
function initContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('userName').value;
    const email = document.getElementById('userEmail').value;
    const subject = document.getElementById('userSubject').value;
    const message = document.getElementById('userMessage').value;

    const mailtoLink = `mailto:gohilsumitsinhsanjubhai26@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent("From: " + name + " (" + email + ")\n\n" + message)}`;

    showToast(`Thanks ${name}! Opening your email client...`);
    if (window.confetti) {
      window.confetti({ particleCount: 70, spread: 60, origin: { y: 0.8 } });
    }

    setTimeout(() => {
      window.location.href = mailtoLink;
      form.reset();
    }, 900);
  });
}

// ==========================================
// 3. RESUME MODAL & CLIPBOARD COPY HELPERS
// ==========================================
window.openResumeModal = function() {
  const modal = document.getElementById('resumeModal');
  if (modal) modal.classList.add('open');
};

window.closeResumeModal = function() {
  const modal = document.getElementById('resumeModal');
  if (modal) modal.classList.remove('open');
};

window.copyContact = function(text, btnEl = null) {
  navigator.clipboard.writeText(text).then(() => {
    showToast(`Copied: ${text}`);
    if (btnEl) {
      const original = btnEl.innerHTML;
      btnEl.innerHTML = `<i class="fa-solid fa-check"></i>`;
      setTimeout(() => btnEl.innerHTML = original, 1800);
    }
  }).catch(() => {
    showToast(`Failed to copy. Please select manually.`);
  });
};

window.copyResumeText = function() {
  const text = `
Sumitsinh Sanjubhai Gohil - Information Technology Engineer
Location: Dholka, Ahmedabad, Gujarat, India
Phone: +91 6355967642 | Email: gohilsumitsinhsanjubhai26@gmail.com
LinkedIn: https://www.linkedin.com/in/sumitsinh-gohil-2a344a306

EDUCATION:
- Bachelor of Engineering (B.E.) in Information Technology (Currently Pursuing)
- Diploma in Information Technology, Government Polytechnic, Kheda (2022 - 2025) - 8.62 CGPA (Distinction)
- Secondary School Certificate (SSC), Shree B.P Davda Sarasvati vidhyalaya (2022) - 72.83%

TECHNICAL ARSENAL:
- Languages: Python, Java, JavaScript (ES6+), HTML5, CSS3, SQL
- Core IT: Object-Oriented Programming (OOP), Data Structures, Database Design (DBMS), Computer Networks
- Tools: Git, GitHub, VS Code, Postman, Linux CLI, MS Office Suite

PRACTICAL PROJECTS:
- Student Record & Attendance Management System (Python/Java, MySQL, Web UI)
- Interactive Algorithm & Sorting Visualizer (JavaScript, HTML5 Canvas)
- CampusHub IT Notes & Resource Portal (HTML5, Modern CSS, LocalStorage)
- ByteHop 2D Arcade Obstacle Dodger (Pure JS & Canvas Game Engine)

COMMERCIAL EXPOSURE:
- Sales & Digital Marketing Executive (Part-Time / Internship), Jashom Technologies Pvt Ltd (11/2025 - 04/2026)

PROFESSIONAL STRENGTHS:
- Problem Solving, Rapid Code Execution (75+ WPM), Team Collaboration
- Languages: English (Fluent), Hindi (Fluent), Gujarati (Fluent)
  `.trim();

  copyContact(text);
};

// ==========================================
// 4. TOAST NOTIFICATIONS
// ==========================================
window.showToast = function(message) {
  const shelf = document.getElementById('toastShelf');
  if (!shelf) return;

  const toast = document.createElement('div');
  toast.className = 'toast-item';
  toast.innerHTML = `<i class="fa-solid fa-circle-check" style="color: var(--color-emerald);"></i> <span>${message}</span>`;
  shelf.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    setTimeout(() => toast.remove(), 350);
  }, 3200);
};
