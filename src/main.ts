import './styles/styles.scss';
import { THEMES } from './data/themes';
import { createGame, flipCard, hideMismatch, isWon } from './game/state';
import { renderBoard, syncCard } from './ui/board';
import { loadSettings } from './data/settings-store';
import { CONFETTI } from './data/confetti';
import type { FlipResult, PlayerColor } from './types/card';

const MISMATCH_DELAY = 900;
const GAMEOVER_DELAY = 2500;
const WIN_DELAY = 400;

const RESULT_TITLE_CLASSES = [
  'endscreen__title--big',
  'endscreen__title--blue',
  'endscreen__title--orange',
];

const RESULT_ART_CLASSES = [
  'endscreen__art--pawn',
  'endscreen__art--blue',
  'endscreen__art--orange',
];

const settings = loadSettings();
const THEME = THEMES[settings ? settings.theme : 'code-vibes'];
const SIZE = settings ? settings.size : 16;
const START_PLAYER = settings ? settings.player : 'blue';

let state = createGame(THEME, SIZE, START_PLAYER);

init();

function init() {
  applyTheme();
  initExitDialog();
  initReplay();
  initField();
}

function initField() {
  const fieldRef = document.getElementById('field');
  if (!fieldRef) {
    return;
  }

  renderBoard(fieldRef, state);
  updateTopbar();
  fieldRef.addEventListener('click', event => onFieldClick(fieldRef, event));
}

function onFieldClick(fieldRef: HTMLElement, event: Event) {
  const card = (event.target as HTMLElement).closest('.card') as HTMLButtonElement | null;
  if (card && card.dataset.id) {
    onCardClick(fieldRef, Number(card.dataset.id));
  }
}

function initReplay() {
  document.getElementById('replay')?.addEventListener('click', restartGame);
}

function initExitDialog() {
  const exitRef = document.getElementById('exit');
  const dialogRef = document.getElementById('exit-dialog');
  const cancelRef = document.getElementById('exit-cancel');

  if (exitRef && cancelRef && dialogRef instanceof HTMLDialogElement) {
    exitRef.addEventListener('click', () => dialogRef.showModal());
    cancelRef.addEventListener('click', () => dialogRef.close());
  }
}

function applyTheme() {
  applyThemeColors();
  applyCardMetrics();
  applyPlayerIcon();
  applyEndButtons();
}

function applyThemeColors() {
  const style = document.body.style;

  style.setProperty('--bg-from', THEME.background[0]);
  style.setProperty('--bg-to', THEME.background[1]);
  style.setProperty('--accent', THEME.accent);
  style.setProperty('--accent-dark', THEME.accentDark);
}

function applyCardMetrics() {
  const [width, height] = THEME.cardSize;
  const style = document.body.style;

  style.setProperty('--card-ratio', `${width} / ${height}`);
  style.setProperty('--card-ratio-num', String(width / height));
  style.setProperty('--card-max-height', `${height}px`);
}

function applyPlayerIcon() {
  const [width, height] = THEME.playerIcon.size;
  const style = document.body.style;

  style.setProperty('--player-icon', `url("${THEME.playerIcon.src}")`);
  style.setProperty('--player-icon-width', `${width}px`);
  style.setProperty('--player-icon-height', `${height}px`);
}

function applyEndButtons() {
  const variant = `endscreen__button--${THEME.endButton.style}`;
  document.getElementById('replay')?.classList.add(variant);

  const homeRef = document.getElementById('go-home');
  if (homeRef) {
    homeRef.textContent = THEME.endButton.label;
    homeRef.classList.add(variant);
  }
}

function onCardClick(fieldRef: HTMLElement, id: number) {
  const result = flipCard(state, id);
  if (result === 'ignored') {
    return;
  }

  syncAll(fieldRef);
  scheduleFollowUp(fieldRef, result);
}

function scheduleFollowUp(fieldRef: HTMLElement, result: FlipResult) {
  if (result === 'mismatch') {
    window.setTimeout(() => resolveMismatch(fieldRef), MISMATCH_DELAY);
  }

  if (isWon(state)) {
    window.setTimeout(showGameOver, WIN_DELAY);
  }
}

function resolveMismatch(fieldRef: HTMLElement) {
  hideMismatch(state).forEach(card => syncCard(fieldRef, card));
  updateTopbar();
}

function syncAll(fieldRef: HTMLElement) {
  state.cards.forEach(card => syncCard(fieldRef, card));
  updateTopbar();
}

function restartGame() {
  state = createGame(THEME, SIZE, START_PLAYER);

  const fieldRef = document.getElementById('field');
  if (fieldRef) {
    renderBoard(fieldRef, state);
  }

  resetEndscreen();
  updateTopbar();
  showPlayView();
}

function showPlayView() {
  toggle('result', false);
  toggle('gameover', false);
  toggle('topbar', true);
  toggle('field', true);
}

function resetEndscreen() {
  document.getElementById('result-title')?.classList.remove(...RESULT_TITLE_CLASSES);

  const artRef = document.getElementById('result-art');
  if (artRef) {
    artRef.classList.remove(...RESULT_ART_CLASSES);
    artRef.replaceChildren();
  }

  document.getElementById('confetti')?.replaceChildren();
}

function showGameOver() {
  setText('final-blue', String(state.scores.blue));
  setText('final-orange', String(state.scores.orange));

  toggle('topbar', false);
  toggle('field', false);
  toggle('gameover', true);

  window.setTimeout(showResult, GAMEOVER_DELAY);
}

function showResult() {
  const { blue, orange } = state.scores;

  if (blue === orange) {
    showDraw();
  } else {
    showWinner(blue > orange ? 'blue' : 'orange');
  }

  toggle('gameover', false);
  toggle('result', true);
}

function showDraw() {
  setText('result-label', "it's a");
  setText('result-title', 'DRAW');
  document.getElementById('result-title')?.classList.add('endscreen__title--big');
}

function showWinner(winner: PlayerColor) {
  const name = winner === 'blue' ? 'Blue Player' : 'Orange Player';

  setText('result-label', 'The winner is');
  setText('result-title', THEME.winnerUppercase ? name.toUpperCase() : name);
  document.getElementById('result-title')?.classList.add(`endscreen__title--${winner}`);
  showWinnerArt(winner);

  if (THEME.hasConfetti) {
    renderConfetti();
  }
}

function showWinnerArt(winner: PlayerColor) {
  const artRef = document.getElementById('result-art');
  if (!artRef) {
    return;
  }

  if (THEME.winnerImage) {
    artRef.append(createImage(THEME.winnerImage, 'endscreen__image'));
  } else {
    artRef.classList.add('endscreen__art--pawn', `endscreen__art--${winner}`);
  }
}

function renderConfetti() {
  const confettiRef = document.getElementById('confetti');
  if (confettiRef) {
    confettiRef.append(...CONFETTI.map(source => createImage(source)));
  }
}

function createImage(source: string, className = '') {
  const image = document.createElement('img');
  image.src = source;
  image.alt = '';
  image.className = className;
  return image;
}

function toggle(id: string, visible: boolean) {
  const ref = document.getElementById(id);
  if (ref) {
    ref.hidden = !visible;
  }
}

function updateTopbar() {
  setText('score-blue', String(state.scores.blue));
  setText('score-orange', String(state.scores.orange));

  const currentRef = document.getElementById('current-player');
  if (currentRef) {
    currentRef.classList.toggle('score__pawn--blue', state.currentPlayer === 'blue');
    currentRef.classList.toggle('score__pawn--orange', state.currentPlayer === 'orange');
  }
}

function setText(id: string, text: string) {
  const ref = document.getElementById(id);
  if (ref) {
    ref.textContent = text;
  }
}
