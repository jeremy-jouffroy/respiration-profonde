const techniques = {
  coherence: {
    name: 'Cohérence cardiaque',
    description: '6 respirations par minute — 5s inspiration, 5s expiration',
    phases: [
      { name: 'Inspirez', duration: 5 },
      { name: 'Expirez', duration: 5 }
    ]
  },
  relaxation: {
    name: 'Relaxation 4-7-8',
    description: 'Technique apaisante — 4s inspiration, 7s rétention, 8s expiration',
    phases: [
      { name: 'Inspirez', duration: 4 },
      { name: 'Retenez', duration: 7 },
      { name: 'Expirez', duration: 8 }
    ]
  },
  box: {
    name: 'Respiration carrée',
    description: 'Équilibre total — 4s inspiration, 4s rétention, 4s expiration, 4s pause',
    phases: [
      { name: 'Inspirez', duration: 4 },
      { name: 'Retenez', duration: 4 },
      { name: 'Expirez', duration: 4 },
      { name: 'Pause', duration: 4 }
    ]
  }
};

const circle = document.getElementById('circle');
const phaseLabel = document.getElementById('phaseLabel');
const timerDisplay = document.getElementById('timer');
const startBtn = document.getElementById('startBtn');
const cycleCounter = document.getElementById('cycleCounter');
const techniqueDescription = document.getElementById('techniqueDescription');
const techniqueBtns = document.querySelectorAll('.technique-btn');
const voiceBtn = document.getElementById('voiceBtn');
const voiceIcon = document.getElementById('voiceIcon');
const voiceMutedIcon = document.getElementById('voiceMutedIcon');

const sounds = {
  Inspirez: new Audio('sounds/Inspirez.m4a'),
  Expirez: new Audio('sounds/Expirez.m4a')
};

let currentTechnique = 'coherence';
let running = false;
let intervalId = null;
let cycleCount = 0;
let voiceEnabled = false;

const MIN_SCALE = 0.6;
const MAX_SCALE = 1.8;

function getScaleForPhase(phaseName, progress) {
  switch (phaseName) {
    case 'Inspirez':
      return MIN_SCALE + (MAX_SCALE - MIN_SCALE) * progress;
    case 'Expirez':
      return MAX_SCALE - (MAX_SCALE - MIN_SCALE) * progress;
    case 'Retenez':
      return MAX_SCALE;
    case 'Pause':
      return MIN_SCALE;
    default:
      return 1;
  }
}

function playSound(phaseName) {
  if (!voiceEnabled) return;
  const sound = sounds[phaseName];
  if (sound) {
    sound.currentTime = 0;
    sound.play();
  }
}

function runBreathing() {
  const technique = techniques[currentTechnique];
  const phases = technique.phases;
  let phaseIndex = 0;
  let phaseStart = Date.now();
  let lastPhaseIndex = -1;
  cycleCount = 0;

  circle.classList.add('active');
  updateCycleDisplay();

  function tick() {
    if (!running) return;

    const now = Date.now();
    const phase = phases[phaseIndex];
    const elapsed = (now - phaseStart) / 1000;
    const remaining = Math.max(0, phase.duration - elapsed);
    const progress = Math.min(1, elapsed / phase.duration);

    if (phaseIndex !== lastPhaseIndex) {
      phaseLabel.textContent = phase.name;
      playSound(phase.name);
      lastPhaseIndex = phaseIndex;
    }

    timerDisplay.textContent = Math.ceil(remaining);

    const scale = getScaleForPhase(phase.name, progress);
    circle.style.transform = `scale(${scale})`;

    if (elapsed >= phase.duration) {
      phaseIndex++;
      if (phaseIndex >= phases.length) {
        phaseIndex = 0;
        cycleCount++;
        updateCycleDisplay();
      }
      phaseStart = now;
    }
  }

  tick();
  intervalId = setInterval(tick, 50);
}

function updateCycleDisplay() {
  if (cycleCount === 0) {
    cycleCounter.textContent = '';
  } else {
    cycleCounter.textContent = `${cycleCount} cycle${cycleCount > 1 ? 's' : ''} terminé${cycleCount > 1 ? 's' : ''}`;
  }
}

function start() {
  running = true;
  startBtn.textContent = 'Arrêter';
  runBreathing();
}

function stop() {
  running = false;
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
  circle.classList.remove('active');
  circle.style.transform = 'scale(1)';
  phaseLabel.textContent = 'Prêt';
  timerDisplay.textContent = '';
  startBtn.textContent = 'Commencer';
  cycleCount = 0;
  cycleCounter.textContent = '';
}

startBtn.addEventListener('click', () => {
  if (running) {
    stop();
  } else {
    start();
  }
});

techniqueBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const technique = btn.dataset.technique;
    if (technique === currentTechnique && !running) return;

    currentTechnique = technique;
    techniqueBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    techniqueDescription.textContent = techniques[technique].description;

    if (running) {
      stop();
    }
  });
});

voiceBtn.addEventListener('click', () => {
  voiceEnabled = !voiceEnabled;
  voiceBtn.classList.toggle('active', voiceEnabled);
  voiceIcon.style.display = voiceEnabled ? 'block' : 'none';
  voiceMutedIcon.style.display = voiceEnabled ? 'none' : 'block';
  voiceBtn.setAttribute('aria-label', voiceEnabled ? 'Désactiver la voix' : 'Activer la voix');
});
