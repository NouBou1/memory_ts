import './styles/styles.scss';
import { THEMES, type ThemeId } from './data/themes';
import {
  isBoardSize,
  isPlayerColor,
  isThemeId,
  saveSettings,
  type GameSettings,
} from './data/settings-store';

const DEFAULT_THEME: ThemeId = 'code-vibes';

const choice: Partial<GameSettings> = {};

init();

function init() {
  const formRef = document.getElementById('settings-form');
  const startRef = document.getElementById('start');

  preloadPreviews();
  updatePreview();

  if (formRef instanceof HTMLFormElement && startRef instanceof HTMLButtonElement) {
    bindForm(formRef, startRef);
  }
}

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

function startGame() {
  if (isComplete(choice)) {
    saveSettings(choice);
    window.location.href = '/game.html';
  }
}

function readChoice(formRef: HTMLFormElement) {
  const data = new FormData(formRef);
  const theme = data.get('theme');
  const player = data.get('player');
  const size = Number(data.get('size'));

  choice.theme = isThemeId(theme) ? theme : choice.theme;
  choice.player = isPlayerColor(player) ? player : choice.player;
  choice.size = isBoardSize(size) ? size : choice.size;
}

function updateSummary() {
  setText('summary-theme', choice.theme ? THEMES[choice.theme].label : 'Game theme');
  setText('summary-player', choice.player ? capitalize(choice.player) : 'Player');
  setText('summary-size', choice.size ? `Board-${choice.size} Cards` : 'Board size');
}

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

function updatePreview(hovered?: ThemeId) {
  const theme = THEMES[hovered ?? choice.theme ?? DEFAULT_THEME];
  setImage('preview', theme.preview);
}

function preloadPreviews() {
  Object.values(THEMES).forEach(theme => {
    new Image().src = theme.preview;
  });
}

function isComplete(value: Partial<GameSettings>): value is GameSettings {
  return value.theme !== undefined && value.player !== undefined && value.size !== undefined;
}

function setText(id: string, text: string) {
  const ref = document.getElementById(id);
  if (ref) {
    ref.textContent = text;
  }
}

function setImage(id: string, source: string) {
  const ref = document.getElementById(id);
  if (ref instanceof HTMLImageElement) {
    ref.src = source;
  }
}

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
