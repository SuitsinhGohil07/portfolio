/**
 * Interactive Terminal Modal & Bash Command Interpreter
 */

class PortfolioTerminal {
  constructor() {
    this.modal = document.getElementById('terminalModal');
    this.screen = document.getElementById('terminalScreen');
    this.output = document.getElementById('terminalOutput');
    this.input = document.getElementById('terminalInput');
    this.toggleBtn = document.getElementById('terminalToggleBtn');
    this.ctaTerminal = document.getElementById('ctaTerminal');
    this.closeBtn = document.getElementById('termCloseBtn');
    this.maxBtn = document.getElementById('termMaxBtn');
    this.windowEl = document.querySelector('.terminal-window');

    this.history = [];
    this.historyIndex = -1;

    this.commands = {
      help: () => this.cmdHelp(),
      about: () => this.cmdAbout(),
      skills: () => this.cmdSkills(),
      education: () => this.cmdEducation(),
      experience: () => this.cmdExperience(),
      projects: () => this.cmdProjects(),
      contact: () => this.cmdContact(),
      matrix: () => this.cmdMatrix(),
      typing: () => this.cmdTyping(),
      clear: () => this.cmdClear(),
      cls: () => this.cmdClear(),
      exit: () => this.close(),
      'sudo hire': () => this.cmdHire(),
      hire: () => this.cmdHire(),
      ls: () => this.cmdLs(),
      date: () => `<div class="terminal-line">${new Date().toString()}</div>`,
      whoami: () => `<div class="terminal-line"><span class="cmd-highlight">guest_recruiter@antigravity</span> (welcome!)</div>`
    };

    this.bindEvents();
  }

  bindEvents() {
    if (this.toggleBtn) {
      this.toggleBtn.addEventListener('click', () => this.toggle());
    }
    if (this.ctaTerminal) {
      this.ctaTerminal.addEventListener('click', () => this.open());
    }
    if (this.closeBtn) {
      this.closeBtn.addEventListener('click', () => this.close());
    }
    if (this.maxBtn) {
      this.maxBtn.addEventListener('click', () => {
        this.windowEl.classList.toggle('fullscreen');
        if (window.audioController) window.audioController.playClick();
      });
    }

    // Global keyboard listener for ~ and Esc
    window.addEventListener('keydown', (e) => {
      if (e.key === '`' || e.key === '~') {
        const activeTag = document.activeElement ? document.activeElement.tagName.toLowerCase() : '';
        if (activeTag !== 'input' && activeTag !== 'textarea') {
          e.preventDefault();
          this.toggle();
        }
      } else if (e.key === 'Escape' && this.isOpen()) {
        this.close();
      }
    });

    // Terminal Input events
    if (this.input) {
      this.input.addEventListener('keydown', (e) => this.handleInputKeydown(e));
      this.input.addEventListener('input', () => {
        if (window.audioController) window.audioController.playTerminalKey();
      });
    }

    // Modal background click to close
    if (this.modal) {
      this.modal.addEventListener('click', (e) => {
        if (e.target === this.modal) this.close();
      });
    }

    // Quick Command Buttons in Terminal
    document.querySelectorAll('.cmd-tag').forEach(btn => {
      btn.addEventListener('click', () => {
        const cmd = btn.getAttribute('data-cmd');
        if (cmd) {
          this.runCommand(cmd);
          if (window.audioController) window.audioController.playClick();
        }
      });
    });
  }

  isOpen() {
    return this.modal && this.modal.classList.contains('open');
  }

  open() {
    if (!this.modal) return;
    this.modal.classList.add('open');
    if (this.input) {
      setTimeout(() => this.input.focus(), 150);
    }
    if (window.audioController) window.audioController.playClick();
  }

  close() {
    if (!this.modal) return;
    this.modal.classList.remove('open');
    if (window.audioController) window.audioController.playClick();
  }

  toggle() {
    if (this.isOpen()) {
      this.close();
    } else {
      this.open();
    }
  }

  handleInputKeydown(e) {
    if (e.key === 'Enter') {
      const rawCmd = this.input.value.trim();
      this.input.value = '';
      if (rawCmd) {
        this.history.push(rawCmd);
        this.historyIndex = this.history.length;
        this.runCommand(rawCmd);
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (this.history.length > 0 && this.historyIndex > 0) {
        this.historyIndex--;
        this.input.value = this.history[this.historyIndex];
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (this.historyIndex < this.history.length - 1) {
        this.historyIndex++;
        this.input.value = this.history[this.historyIndex];
      } else {
        this.historyIndex = this.history.length;
        this.input.value = '';
      }
    }
  }

  runCommand(cmdStr) {
    const cleanCmd = cmdStr.trim().toLowerCase();

    // Append prompt echo
    const echoLine = document.createElement('div');
    echoLine.className = 'terminal-line';
    echoLine.innerHTML = `<span class="prompt-user">sumitsinh@portfolio</span>:<span class="prompt-path">~</span>$ <strong>${this.escapeHtml(cmdStr)}</strong>`;
    this.output.appendChild(echoLine);

    // Execute matching handler
    let responseHtml = '';
    if (this.commands[cleanCmd]) {
      responseHtml = this.commands[cleanCmd]();
    } else if (cleanCmd.startsWith('theme ')) {
      const themeName = cleanCmd.split(' ')[1];
      responseHtml = this.cmdSetTheme(themeName);
    } else {
      responseHtml = `<div class="terminal-line" style="color: var(--accent-danger);">bash: command not found: ${this.escapeHtml(cmdStr)}. Type <span class="cmd-highlight">help</span> for a list of valid commands.</div>`;
    }

    if (responseHtml) {
      const respEl = document.createElement('div');
      respEl.innerHTML = responseHtml;
      this.output.appendChild(respEl);
    }

    // Scroll to bottom
    this.screen.scrollTop = this.screen.scrollHeight;
  }

  cmdHelp() {
    return `
      <div class="terminal-line" style="margin-top: 0.4rem;">
        <span class="cmd-highlight">AVAILABLE COMMANDS:</span><br>
        &bull; <span class="cmd-highlight">about</span>       : Overview of academic pathway &amp; career direction<br>
        &bull; <span class="cmd-highlight">skills</span>      : Technical arsenal, programming languages &amp; soft skills<br>
        &bull; <span class="cmd-highlight">education</span>   : B.E. IT (Pursuing), Diploma IT (8.62 CGPA), SSC<br>
        &bull; <span class="cmd-highlight">experience</span>  : Corporate tenure at Jashom Technologies Pvt Ltd<br>
        &bull; <span class="cmd-highlight">projects</span>    : Showcase of full-stack, automation &amp; algorithm applications<br>
        &bull; <span class="cmd-highlight">typing</span>      : Jump directly to the interactive typing speed test<br>
        &bull; <span class="cmd-highlight">matrix</span>      : Toggle the fullscreen Matrix digital rain visualizer<br>
        &bull; <span class="cmd-highlight">contact</span>     : Display email, phone, location &amp; LinkedIn<br>
        &bull; <span class="cmd-highlight">sudo hire</span>   : Recruiter priority fast-track<br>
        &bull; <span class="cmd-highlight">clear</span>       : Wipe terminal screen output<br>
        &bull; <span class="cmd-highlight">exit</span>        : Close this terminal session
      </div>
    `;
  }

  cmdAbout() {
    return `
      <div class="terminal-line">
        <strong>Sumitsinh Sanjubhai Gohil</strong><br>
        Information Technology Engineer based in Dholka, Ahmedabad, Gujarat.<br>
        &bull; Currently pursuing: <strong>Bachelor of Engineering (B.E.) in Information Technology</strong><br>
        &bull; Previous qualification: <strong>Diploma in IT (8.62 CGPA)</strong> from Govt. Polytechnic, Kheda<br>
        &bull; Blend of algorithmic thinking, software development (Python, Java, JS), and digital marketing experience.
      </div>
    `;
  }

  cmdSkills() {
    return `
      <div class="terminal-line">
        <span class="cmd-highlight">=== TECHNICAL &amp; CORE SKILLS ===</span><br>
        [Languages]     : Python, Java, JavaScript (ES6+), HTML5, CSS3<br>
        [Web Dev]       : Responsive Layouts, Flexbox, Grid, DOM APIs, Asynchronous JS<br>
        [Software]      : MS Office Suite, VS Code, Git/GitHub<br>
        [Enterprise]    : CRM Management, Lead Generation, Digital Marketing<br>
        [Soft Skills]   : Fast Typing (70+ WPM), Leadership, Team Collaboration<br>
        [Languages]     : English (Fluent), Hindi (Fluent), Gujarati (Fluent)
      </div>
    `;
  }

  cmdEducation() {
    return `
      <div class="terminal-line">
        <span class="cmd-highlight">=== ACADEMIC TIMELINE ===</span><br>
        1. <strong>B.E. in Information Technology</strong> (Currently Pursuing)<br>
           &bull; Advancing software architecture, database management, and network protocols.<br>
        2. <strong>Diploma in Information Technology</strong> (2022 - 2025)<br>
           &bull; Government Polytechnic, Kheda | Score: <strong>8.62 CGPA (Distinction)</strong><br>
        3. <strong>Secondary School Certificate (SSC)</strong> (2022)<br>
           &bull; Shree B.P Davda Sarasvati vidhyalaya | Score: <strong>72.83%</strong>
      </div>
    `;
  }

  cmdExperience() {
    return `
      <div class="terminal-line">
        <span class="cmd-highlight">=== INDUSTRY EXPERIENCE ===</span><br>
        <strong>Sales and Digital Marketing Executive</strong><br>
        Company: Jashom Technologies Pvt Ltd (01/11/2025 - 30/04/2026)<br>
        &bull; Executed targeted digital marketing &amp; lead generation campaigns.<br>
        &bull; Managed customer lifecycle and pipeline hygiene inside CRM tools.<br>
        &bull; Collaborated with multi-disciplinary teams to elevate brand awareness and achieve sales goals.
      </div>
    `;
  }

  cmdProjects() {
    return `
      <div class="terminal-line">
        <span class="cmd-highlight">=== FEATURED PROJECTS ===</span><br>
        1. <strong>LeadFlow CRM &amp; Campaign Analytics</strong> [JS / Python / CRM Analytics]<br>
        2. <strong>PyScout: Market Intelligence &amp; Lead Parser</strong> [Python / Automation / CSV]<br>
        3. <strong>AlgoCraft: Interactive Algorithm Visualizer</strong> [Java Concepts / JS / Canvas]<br>
        4. <strong>SkillSphere: IT Student Resource Hub</strong> [HTML5 / CSS / LocalStorage]
      </div>
    `;
  }

  cmdContact() {
    return `
      <div class="terminal-line">
        <span class="cmd-highlight">=== CONTACT INFORMATION ===</span><br>
        &bull; Email    : <a href="mailto:gohilsumitsinhsanjubhai26@gmail.com" style="color:var(--accent-primary)">gohilsumitsinhsanjubhai26@gmail.com</a><br>
        &bull; Phone    : <a href="tel:+916355967642" style="color:var(--accent-primary)">+91 6355967642</a><br>
        &bull; LinkedIn : <a href="https://www.linkedin.com/in/sumitsinh-gohil-2a344a306" target="_blank" style="color:var(--accent-primary)">linkedin.com/in/sumitsinh-gohil-2a344a306</a><br>
        &bull; Location : Dholka, Ahmedabad, Gujarat, India
      </div>
    `;
  }

  cmdMatrix() {
    if (window.bgVisualizer) {
      const active = window.bgVisualizer.toggleMatrixRain();
      return `<div class="terminal-line" style="color: var(--accent-success);">&gt; Matrix Digital Rain: ${active ? 'ENGAGED [Type "matrix" again to exit]' : 'DISENGAGED'}</div>`;
    }
    return `<div class="terminal-line">Matrix visualizer unavailable.</div>`;
  }

  cmdTyping() {
    this.close();
    const elem = document.getElementById('typing-challenge');
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth' });
    }
    return '';
  }

  cmdClear() {
    this.output.innerHTML = '';
    return '';
  }

  cmdLs() {
    return `<div class="terminal-line">about.txt  education.md  skills.json  experience.log  projects/  resume.pdf</div>`;
  }

  cmdHire() {
    if (window.confetti) {
      window.confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    }
    if (window.audioController) {
      window.audioController.playSuccess();
    }
    return `
      <div class="terminal-line" style="color: var(--accent-success); border-left: 3px solid var(--accent-success); padding-left: 0.8rem; margin: 0.5rem 0;">
        🎉 <strong>[SUDO ACCESS GRANTED]</strong><br>
        Thank you for your interest! Sumitsinh is ready to bring high energy, fast technical execution, and engineering curiosity to your team.<br>
        &rarr; Feel free to reach out directly at <a href="mailto:gohilsumitsinhsanjubhai26@gmail.com" style="color: var(--accent-primary); text-decoration: underline;">gohilsumitsinhsanjubhai26@gmail.com</a> or call <strong>+91 6355967642</strong>.
      </div>
    `;
  }

  cmdSetTheme(name) {
    if (['cyber', 'emerald', 'violet', 'minimal'].includes(name)) {
      document.documentElement.setAttribute('data-theme', name);
      localStorage.setItem('sumit_portfolio_theme', name);
      return `<div class="terminal-line" style="color: var(--accent-success);">&gt; Active theme shifted to: <strong>${name}</strong></div>`;
    }
    return `<div class="terminal-line" style="color: var(--accent-danger);">Unknown theme. Choose from: cyber, emerald, violet, minimal</div>`;
  }

  escapeHtml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
}

// Global instance
window.portfolioTerminal = new PortfolioTerminal();
