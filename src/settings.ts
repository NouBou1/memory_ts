/**
 * Entry point of the settings page (`settings.html`).
 *
 * Collects theme, starting player and board size, keeps the start button
 * disabled until all three are chosen, and stores the selection for the game
 * page.
 *
 * The selection is cached in `choice` rather than re-read from the form on
 * every access, so preview and summary always work off the same snapshot.
 *
 * The module exports nothing: it is included by the page and starts itself on
 * load.
 *
 * @packageDocumentation
 */

import './styles/styles.scss';
import { THEMES, type ThemeId } from './data/themes';
import {
  isBoardSize,
  isPlayerColor,
  isThemeId,
  saveSettings,
  type GameSettings,
} from './data/settings-store';

/** Theme whose preview is visible before anything has been picked. */
const DEFAULT_THEME: ThemeId = 'code-vibes';

/**
 * The selection made so far.
 *
 * `Partial`, because nothing is settled at the start. Only once
 * {@link isComplete} agrees is it a full {@link GameSettings}.
 */
const choice: Partial<GameSettings> = {};

init();

/**
 * Sets up the page.
 *
 * Preview images are preloaded before anything is displayed, so switching them
 * on hover needs no further download.
 */
function init() {
  const formRef = document.getElementById('settings-form');
  const startRef = document.getElementById('start');

  preloadPreviews();
  updatePreview();

  if (formRef instanceof HTMLFormElement && startRef instanceof HTMLButtonElement) {
    bindForm(formRef, startRef);
  }
}

/**
 * Wires the form and the start button to the selection logic.
 *
 * A single `change` listener on the form is enough, because the event bubbles
 * up from the input fields.
 *
 * @param formRef - Form holding the `theme`, `player` and `size` fields
 * @param startRef - Button that starts the game
 */
function bindForm(formRef: HTMLFormElement, startRef: HTMLButtonElement) {
  bindThemePreview(formRef);

  formRef.addEventListener('change', () => {
    readChoice(formRef);
    updateSummary();
    updatePreview();
    startRef.disabled = !isComplete(choice);
  });

  startRef.addEventListener('click', startGame);
}

/**
 * Stores the selection and moves on to the game page.
 *
 * Re-checks completeness despite the disabled button, so a click triggered from
 * outside cannot hand over a half-finished selection.
 */
function startGame() {
  if (isComplete(choice)) {
    saveSettings(choice);
    window.location.href = '/game.html';
  }
}

/**
 * Reads the current form state into `choice`.
 *
 * Invalid values leave the previous state standing instead of clearing it, so
 * one unexpected input does not discard the rest of the selection.
 *
 * @param formRef - Form holding the current selection
 */
function readChoice(formRef: HTMLFormElement) {
  const data = new FormData(formRef);
  const theme = data.get('theme');
  const player = data.get('player');
  const size = Number(data.get('size'));

  choice.theme = isThemeId(theme) ? theme : choice.theme;
  choice.player = isPlayerColor(player) ? player : choice.player;
  choice.size = isBoardSize(size) ? size : choice.size;
}

/**
 * Writes the summary of the selection.
 *
 * Decisions still open show their field label as a placeholder.
 */
function updateSummary() {
  setText('summary-theme', choice.theme ? THEMES[choice.theme].label : 'Game theme');
  setText('summary-player', choice.player ? capitalize(choice.player) : 'Player');
  setText('summary-size', choice.size ? `Board-${choice.size} Cards` : 'Board size');
}

/**
 * Makes the preview follow the theme being pointed at.
 *
 * Mouse and keyboard are treated alike: `focus` and `blur` mirror `mouseenter`
 * and `mouseleave`, so the preview keeps up while tabbing through.
 *
 * @param formRef - Form holding the theme options
 */
function bindThemePreview(formRef: HTMLFormElement) {
  const inputs = formRef.querySelectorAll<HTMLInputElement>('input[name="theme"]');

  inputs.forEach(input => {
    const row = input.closest<HTMLElement>('.option__row');
    const themeId = input.value;
    if (!row || !isThemeId(themeId)) {
      return;
    }

    row.addEventListener('mouseenter', () => updatePreview(themeId));
    row.addEventListener('mouseleave', () => updatePreview());
    input.addEventListener('focus', () => updatePreview(themeId));
    input.addEventListener('blur', () => updatePreview());
  });
}

/**
 * Shows the preview image of a theme.
 *
 * @param hovered - Theme currently pointed at; without it the preview falls
 * back to the picked theme and finally to {@link DEFAULT_THEME}
 */
function updatePreview(hovered?: ThemeId) {
  const theme = THEMES[hovered ?? choice.theme ?? DEFAULT_THEME];
  setImage('preview', theme.preview);
}

/**
 * Loads every preview image into the browser cache.
 *
 * The `Image` objects never reach the DOM; setting `src` alone is what kicks
 * off the download.
 */
function preloadPreviews() {
  Object.values(THEMES).forEach(theme => {
    new Image().src = theme.preview;
  });
}

/**
 * Checks whether all three decisions have been made.
 *
 * @param value - Selection so far
 * @returns Type guard for a complete {@link GameSettings}
 */
function isComplete(value: Partial<GameSettings>): value is GameSettings {
  return value.theme !== undefined && value.player !== undefined && value.size !== undefined;
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

/**
 * Swaps an element's image source, if that element is an `<img>`.
 *
 * @param id - Id of the element
 * @param source - New image path
 */
function setImage(id: string, source: string) {
  const ref = document.getElementById(id);
  if (ref instanceof HTMLImageElement) {
    ref.src = source;
  }
}

/**
 * Uppercases the first letter.
 *
 * Turns the lowercase color values into the display form used in the summary.
 *
 * @param value - Source text
 * @returns The text with a capital first letter
 */
function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
