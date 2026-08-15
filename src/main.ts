import './styles/styles.scss';
import { THEMES } from './data/themes';
import { createGame, flipCard, hideMismatch, isWon } from './game/state';
import { renderBoard, syncCard } from './ui/board';
import { loadSettings } from './data/settings-store';
import { CONFETTI } from './data/confetti';
import type { PlayerColor } from './types/card';

const MISMATCH_DELAY = 900;
const GAMEOVER_DELAY = 2500;

const settings = loadSettings();
const THEME = THEMES[settings ? settings.theme : 'code-vibes'];
const SIZE = settings ? settings.size : 16;
const START_PLAYER = settings ? settings.player : 'blue';

let state = createGame(THEME, SIZE, START_PLAYER);

init();

function init() {
  applyTheme();
  initExitDialog();

  const fieldRef = document.getElementById('field');
  if (fieldRef) {
    renderBoard(fieldRef, state);
    updateTopbar();

    fieldRef.addEventListener('click', e => {
      const card = (e.target as HTMLElement).closest('.card') as HTMLButtonElement | null;
      if (card && card.dataset.id) {
        onCardClick(fieldRef, Number(card.dataset.id));
      }
    });
  }
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
  const [cardWidth, cardHeight] = THEME.cardSize;
  const style = document.body.style;

  style.setProperty('--bg-from', THEME.background[0]);
  style.setProperty('--bg-to', THEME.background[1]);
  style.setProperty('--card-ratio', `${cardWidth} / ${cardHeight}`);
  style.setProperty('--card-ratio-num', String(cardWidth / cardHeight));
  style.setProperty('--card-max-height', `${cardHeight}px`);
  style.setProperty('--accent', THEME.accent);
  style.setProperty('--accent-dark', THEME.accentDark);

  const backRef = document.querySelector('.endscreen__back');
  if (backRef) {
    backRef.textContent = THEME.endButton.label;
    backRef.classList.add(`endscreen__back--${THEME.endButton.style}`);
  }
}

function onCardClick(fieldRef: HTMLElement, id: number) {
  const result = flipCard(state, id);
  if (result === 'ignored') {
    return;
  }

  state.cards.forEach(card => syncCard(fieldRef, card));
  updateTopbar();

  if (result === 'mismatch') {
    window.setTimeout(() => {
      hideMismatch(state).forEach(card => syncCard(fieldRef, card));
      updateTopbar();
    }, MISMATCH_DELAY);
  }

  if (isWon(state)) {
    window.setTimeout(showGameOver, 400);
  }
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
  const isDraw = blue === orange;

  if (isDraw) {
    setText('result-label', "it's a");
    setText('result-title', 'DRAW');
    document.getElementById('result-title')?.classList.add('endscreen__title--big');
  } else {
    const winner: PlayerColor = blue > orange ? 'blue' : 'orange';
    const name = winner === 'blue' ? 'Blue Player' : 'Orange Player';

    setText('result-label', 'The winner is');
    setText('result-title', THEME.winnerUppercase ? name.toUpperCase() : name);
    document.getElementById('result-title')?.classList.add(`endscreen__title--${winner}`);
    showWinnerArt(winner);
  }

  toggle('gameover', false);
  toggle('result', true);
}

function showWinnerArt(winner: PlayerColor) {
  const artRef = document.getElementById('result-art');
  if (!artRef) {
    return;
  }

  if (THEME.winnerImage) {
    const image = document.createElement('img');
    image.src = THEME.winnerImage;
    image.alt = '';
    image.className = 'endscreen__image';
    artRef.append(image);
  } else {
    artRef.classList.add('endscreen__art--pawn', `endscreen__art--${winner}`);
  }

  if (THEME.hasConfetti) {
    renderConfetti();
  }
}

function renderConfetti() {
  const confettiRef = document.getElementById('confetti');
  if (confettiRef) {
    confettiRef.append(
      ...CONFETTI.map(source => {
        const image = document.createElement('img');
        image.src = source;
        image.alt = '';
        return image;
      }),
    );
  }
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
