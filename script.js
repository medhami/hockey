// Konfigurace
const DEFAULT_TIME_LIMIT_MS = 6000; // když hráč NIC neklikne → hodnotí se jako "bez faulu"
const FOUL_LABELS = {
  no_foul: "Bez faulu",
  tripping: "Podražení",
  slashing: "Sekání",
  cross_checking: "Krosček",
  interference: "Bránění ve hře",
  high_stick: "Vysoká hůl"
};

// Stav hry
let situations = [];
let currentIndex = 0;
let scoreCorrect = 0;
let scoreTotal = 0;
let timerId = null;
let timeLeft = 0;

// DOM prvky
const mediaContainer = document.getElementById('media-container');
const situationTitle = document.getElementById('situation-title');
const callFoulBtn = document.getElementById('call-foul-btn');
const nextBtn = document.getElementById('next-btn');
const timerEl = document.getElementById('timer');
const feedbackEl = document.getElementById('feedback');
const scoreCorrectEl = document.getElementById('score-correct');
const scoreTotalEl = document.getElementById('score-total');

const foulDialog = document.getElementById('foul-dialog');
const foulSelect = document.getElementById('foul-select');
const confirmFoulBtn = document.getElementById('confirm-foul');

// Načtení dat
fetch('data/situations.json')
  .then(res => res.json())
  .then(data => {
    situations = data;
    scoreTotal = situations.length;
    scoreTotalEl.textContent = scoreTotal;
    loadSituation(0);
  })
  .catch(err => {
    console.error('Chyba při načtení dat:', err);
    showFeedback(false, 'Nepodařilo se načíst data situací.');
  });

// Načtení situace
function loadSituation(index){
  clearTimer();
  feedbackEl.className = 'feedback';
  feedbackEl.textContent = '';
  feedbackEl.classList.remove('show');

  currentIndex = index;
  const s = situations[index];
  situationTitle.textContent = s.title ?? '';

  // Render media (image/video)
  mediaContainer.innerHTML = '';
  if (s.mediaType === 'video') {
    const vid = document.createElement('video');
    vid.src = s.src;
    vid.controls = false;
    vid.autoplay = true;
    vid.muted = true;
    vid.playsInline = true;
    mediaContainer.appendChild(vid);
  } else {
    const img = document.createElement('img');
    img.src = s.src;
    img.alt = s.title ?? 'Situace';
    mediaContainer.appendChild(img);
  }

  // Připrav ovládání
  callFoulBtn.disabled = false;
  nextBtn.disabled = true;

  // Naplň možnosti faulů pro dialog
  fillFoulOptions(s);

  // Spusť odpočet pro "nekliknutí" = bez faulu
  const limit = s.timeLimitMs ?? DEFAULT_TIME_LIMIT_MS;
  startTimer(limit);
}

function fillFoulOptions(situation){
  const options = situation.foulOptions || Object.keys(FOUL_LABELS).filter(k => k !== 'no_foul');
  foulSelect.innerHTML = options
    .map(code => `<option value="${code}">${FOUL_LABELS[code] ?? code}</option>`)
    .join('');
}

function startTimer(ms){
  timeLeft = Math.ceil(ms / 1000);
  renderTimer();
  timerId = setInterval(() => {
    timeLeft -= 1;
    renderTimer();
    if (timeLeft <= 0){
      clearTimer();
      // Hráč neklikl → vyhodnotí se "bez faulu"
      evaluateAnswer('no_foul', /*byUser*/ false);
    }
  }, 1000);
}

function clearTimer(){
  timerEl.textContent = '';
  if (timerId){
    clearInterval(timerId);
    timerId = null;
  }
}

function renderTimer(){
  timerEl.textContent = `Čas: ${timeLeft}s`;
}

// Vyvolání dialogu pro faul
callFoulBtn.addEventListener('click', () => {
  if (timerId) clearTimer();
  try {
    foulDialog.showModal();
  } catch (e) {
    // Fallback pro staré prohlížeče
    foulDialog.setAttribute('open', 'open');
  }
});

// Potvrzení výběru faulu
confirmFoulBtn.addEventListener('click', (e) => {
  e.preventDefault();
  const val = foulSelect.value;
  try { foulDialog.close(); } catch(e) { foulDialog.removeAttribute('open'); }
  evaluateAnswer(val, /*byUser*/ true);
});

// Další situace
nextBtn.addEventListener('click', () => {
  const next = currentIndex + 1;
  if (next < situations.length) {
    loadSituation(next);
  } else {
    showEndScreen();
  }
});

// Vyhodnocení
function evaluateAnswer(answerCode, byUser){
  const s = situations[currentIndex];
  const correct = s.correctCall;
  const isCorrect = answerCode === correct;

  if (isCorrect) scoreCorrect += 1;
  scoreCorrectEl.textContent = scoreCorrect;

  const userAction = byUser ? `Tvůj verdikt: ${label(answerCode)}` : 'Nepískáno (uplynul čas)';
  const correctText = `Správně: ${label(correct)}`;
  let msg = `${userAction}.\n${correctText}.`;
  if (s.comment) msg += `\n${s.comment}`;

  feedbackEl.textContent = msg;
  feedbackEl.className = 'feedback show ' + (isCorrect ? 'ok' : 'bad');

  callFoulBtn.disabled = true;
  nextBtn.disabled = false;
}

function showEndScreen(){
  mediaContainer.innerHTML = '';
  situationTitle.textContent = '';
  feedbackEl.className = 'feedback show ok';
  const pct = Math.round((scoreCorrect / scoreTotal) * 100);
  feedbackEl.textContent = `Hotovo! Správně ${scoreCorrect} z ${scoreTotal} (${pct}%).`;
  callFoulBtn.disabled = true;
  nextBtn.disabled = true;
  timerEl.textContent = '';
}

function label(code){
  return FOUL_LABELS[code] ?? code;
}

// ===== Rozšiřitelné háčky (budoucí funkce) =====
// 1) Zvuk "bučení" při chybné odpovědi (přidáš assets/audio/boo.mp3)
/*
let booAudio;
document.addEventListener('DOMContentLoaded', () => {
  booAudio = new Audio('assets/audio/boo.mp3');
});
function playBoo(){ if (booAudio) { booAudio.currentTime = 0; booAudio.play(); } }
*/

// 2) Vibrace na tabletu (když je podporovaná)
/*
function vibrate(ms=200){
  if (navigator.vibrate) navigator.vibrate(ms);
}
*/

// 3) Přechod na videa: stačí v JSON změnit "mediaType":"video" a dát soubor do assets.
//    Volitelně spouštět posuzování až po dohrání videa (přidat event 'ended').
