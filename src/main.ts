/**
 * Entry point of the game page (`game.html`).
 *
 * Wires the pure game logic to the DOM. The flow falls into four stages:
 *
 * 1. Setup – `init` reads the settings, colors the page and attaches listeners
 * 2. Turn – a click travels from `onFieldClick` to `onCardClick`
 * 3. Follow-up – `scheduleFollowUp` drives the delayed reactions
 * 4. End – `showGameOver` and `showResult` present the outcome
 *
 * The module exports nothing: it is included by the page and starts itself on
 * load.
 *
 * @packageDocumentation
 */

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
  'endscreen__art--scale',
];

const settings = loadSettings();

const THEME = THEMES[settings ? settings.theme : 'code-vibes'];

const SIZE = settings ? settings.size : 16;

const START_PLAYER = settings ? settings.player : 'blue';

let state = createGame(THEME, SIZE, START_PLAYER);

window.addEventListener('load', init);

/**
 * Sets up the page.
 *
 * Order matters: the theme is applied first so the board is drawn with the
 * correct card metrics right away.
 */
function init() {
  applyTheme();
  initExitDialog();
  initReplay();
  initField();
}

/**
 * Draws the board and enables card clicks.
 *
 * The listener sits on the container rather than on each card, so it survives a
 * repaint of the board.
 */
function initField() {
  const fieldRef = document.getElementById('field');
  if (!fieldRef) {
    return;
  }

  renderBoard(fieldRef, state);
  updateTopbar();
  fieldRef.addEventListener('click', event => onFieldClick(fieldRef, event));
}

/**
 * Resolves a click inside the board to the card it hit.
 *
 * `closest` also catches hits on the inner card faces.
 *
 * @param fieldRef - Container of the board
 * @param event - Click event from the container
 */
function onFieldClick(fieldRef: HTMLElement, event: Event) {
  if (!(event.target instanceof HTMLElement)) {
    return;
  }

  const card = event.target.closest<HTMLButtonElement>('.card');
  if (card && card.dataset.id) {
    onCardClick(fieldRef, Number(card.dataset.id));
  }
}

/** Wires the replay button to {@link restartGame}. */
function initReplay() {
  document.getElementById('replay')?.addEventListener('click', restartGame);
}

/**
 * Wires the exit button to the confirmation dialog.
 *
 * Only binds when all three elements exist and the dialog really is a
 * `<dialog>`.
 */
function initExitDialog() {
  const exitRef = document.getElementById('exit');
  const dialogRef = document.getElementById('exit-dialog');
  const cancelRef = document.getElementById('exit-cancel');

  if (exitRef && cancelRef && dialogRef instanceof HTMLDialogElement) {
    exitRef.addEventListener('click', () => dialogRef.showModal());
    cancelRef.addEventListener('click', () => dialogRef.close());
  }
}

/**
 * Applies the selected theme to the page.
 *
 * Sets `data-theme` on the `<body>` for purely cosmetic rules and delegates the
 * values the stylesheet cannot know to the helpers below.
 */
function applyTheme() {
  document.body.dataset.theme = THEME.id;

  applyThemeColors();
  applyCardMetrics();
  applyPlayerIcon();
  applyEndButtons();
}

/** Writes the background gradient and accent colors as CSS variables. */
function applyThemeColors() {
  const style = document.body.style;

  style.setProperty('--bg-from', THEME.background[0]);
  style.setProperty('--bg-to', THEME.background[1]);
  style.setProperty('--accent', THEME.accent);
  style.setProperty('--accent-dark', THEME.accentDark);
}

/**
 * Writes the card metrics as CSS variables.
 *
 * The ratio is stored twice: once in `aspect-ratio` notation and once as a
 * plain number for use in `calc()`.
 */
function applyCardMetrics() {
  const [width, height] = THEME.cardSize;
  const style = document.body.style;

  style.setProperty('--card-ratio', `${width} / ${height}`);
  style.setProperty('--card-ratio-num', String(width / height));
  style.setProperty('--card-max-height', `${height}px`);
}

/** Writes the player icon and its metrics as CSS variables. */
function applyPlayerIcon() {
  const [width, height] = THEME.playerIcon.size;
  const style = document.body.style;

  style.setProperty('--player-icon', `url("${THEME.playerIcon.src}")`);
  style.setProperty('--player-icon-width', `${width}px`);
  style.setProperty('--player-icon-height', `${height}px`);
}

/**
 * Gives the end screen buttons the theme's style and label.
 *
 * Only the home button takes its text from here; the replay button's label
 * lives in the HTML.
 */
function applyEndButtons() {
  const variant = `endscreen__button--${THEME.endButton.style}`;
  document.getElementById('replay')?.classList.add(variant);

  const homeRef = document.getElementById('go-home');
  if (homeRef) {
    homeRef.textContent = THEME.endButton.label;
    homeRef.classList.add(variant);
  }
}

/**
 * Plays one turn and reflects the outcome on screen.
 *
 * On `'ignored'` the display is left alone, so a click into nothing triggers no
 * animation.
 *
 * @param fieldRef - Container of the board
 * @param id - Id of the clicked card
 */
function onCardClick(fieldRef: HTMLElement, id: number) {
  const result = flipCard(state, id);
  if (result === 'ignored') {
    return;
  }

  syncAll(fieldRef);
  scheduleFollowUp(fieldRef, result);
}

/**
 * Schedules the delayed reactions to a turn.
 *
 * Two cases that are not mutually exclusive: a wrong pair has to go back, and a
 * final matching pair ends the game. Both run on a delay so the player gets to
 * see the cards at all.
 *
 * @param fieldRef - Container of the board
 * @param result - Outcome of the turn from {@link flipCard}
 */
function scheduleFollowUp(fieldRef: HTMLElement, result: FlipResult) {
  if (result === 'mismatch') {
    window.setTimeout(() => resolveMismatch(fieldRef), MISMATCH_DELAY);
  }

  if (isWon(state)) {
    window.setTimeout(showGameOver, WIN_DELAY);
  }
}

/**
 * Turns a wrong pair back over and hands play to the next player.
 *
 * Only the two affected cards are repainted, not the whole board.
 *
 * @param fieldRef - Container of the board
 */
function resolveMismatch(fieldRef: HTMLElement) {
  hideMismatch(state).forEach(card => syncCard(fieldRef, card));
  updateTopbar();
}

/**
 * Brings every card and the top bar in line with the state.
 *
 * @param fieldRef - Container of the board
 */
function syncAll(fieldRef: HTMLElement) {
  state.cards.forEach(card => syncCard(fieldRef, card));
  updateTopbar();
}

/**
 * Starts a fresh game with the same settings.
 *
 * Since {@link createGame} reshuffles, the card layout differs from the last
 * round.
 */
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

/** Hides the end screens and shows the board along with the top bar. */
function showPlayView() {
  toggle('result', false);
  toggle('gameover', false);
  toggle('topbar', true);
  toggle('field', true);
}

/**
 * Clears the end screen for the next game.
 *
 * Necessary because {@link showWinner} and {@link showDraw} add classes and
 * elements that would otherwise carry over into the new round.
 */
function resetEndscreen() {
  document.getElementById('result-title')?.classList.remove(...RESULT_TITLE_CLASSES);

  const artRef = document.getElementById('result-art');
  if (artRef) {
    artRef.classList.remove(...RESULT_ART_CLASSES);
    artRef.replaceChildren();
  }

  document.getElementById('confetti')?.replaceChildren();
}

/**
 * Shows the interstitial screen with the final score.
 *
 * Moves on to {@link showResult} automatically after {@link GAMEOVER_DELAY}.
 */
function showGameOver() {
  setText('final-blue', String(state.scores.blue));
  setText('final-orange', String(state.scores.orange));

  toggle('topbar', false);
  toggle('field', false);
  toggle('gameover', true);

  window.setTimeout(showResult, GAMEOVER_DELAY);
}

/** Decides between a draw and a win, then reveals the end screen. */
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

/** Switches the end screen to a draw, scales artwork included. */
function showDraw() {
  setText('result-label', "it's a");
  setText('result-title', 'DRAW');
  document.getElementById('result-title')?.classList.add('endscreen__title--big');
  document.getElementById('result-art')?.classList.add('endscreen__art--scale');
}

/**
 * Switches the end screen to the winner.
 *
 * Casing of the name and the confetti both depend on the theme.
 *
 * @param winner - Player holding the most pairs
 */
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

/**
 * Fills the artwork area of the winner screen.
 *
 * Two routes depending on the theme: a dedicated winner image, or the
 * CSS-drawn game piece tinted in the winner's color.
 *
 * @param winner - Player whose color the piece takes
 */
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

/** Appends every confetti piece to its designated container. */
function renderConfetti() {
  const confettiRef = document.getElementById('confetti');
  if (confettiRef) {
    confettiRef.append(...CONFETTI.map(source => createImage(source)));
  }
}

/**
 * Creates a decorative image element.
 *
 * `alt` is intentionally empty: these graphics carry no information and are
 * skipped by screen readers.
 *
 * @param source - Image path
 * @param className - Optional CSS class
 * @returns The finished `<img>` element
 */
function createImage(source: string, className = '') {
  const image = document.createElement('img');
  image.src = source;
  image.alt = '';
  image.className = className;
  return image;
}

/**
 * Shows or hides a region of the page.
 *
 * Uses `hidden` rather than a CSS class, so the region disappears for screen
 * readers as well.
 *
 * @param id - Id of the element
 * @param visible - `true` shows, `false` hides
 */
function toggle(id: string, visible: boolean) {
  const ref = document.getElementById(id);
  if (ref) {
    ref.hidden = !visible;
  }
}

/** Writes the score and the active player into the top bar. */
function updateTopbar() {
  setText('score-blue', String(state.scores.blue));
  setText('score-orange', String(state.scores.orange));

  const currentRef = document.getElementById('current-player');
  if (currentRef) {
    currentRef.classList.toggle('score__pawn--blue', state.currentPlayer === 'blue');
    currentRef.classList.toggle('score__pawn--orange', state.currentPlayer === 'orange');
  }
}

/**
 * Sets an element's text content, if that element exists.
 *
 * @param id - Id of the element
 * @param text - New text content
 */
function setText(id: string, text: string) {
  const ref = document.getElementById(id);
  if (ref) {
    ref.textContent = text;
  }
}
