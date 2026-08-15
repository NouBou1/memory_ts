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

  updatePreview();

  if (formRef instanceof HTMLFormElement && startRef instanceof HTMLButtonElement) {
    formRef.addEventListener('change', () => {
      readChoice(formRef);
      updateSummary();
      updatePreview();
      startRef.disabled = !isComplete(choice);
    });

    startRef.addEventListener('click', () => {
      if (isComplete(choice)) {
        saveSettings(choice);
        window.location.href = '/game.html';
      }
    });
  }
}

function readChoice(formRef: HTMLFormElement) {
  const data = new FormData(formRef);
  const theme = data.get('theme');
  const player = data.get('player');
  const size = Number(data.get('size'));

  if (isThemeId(theme)) {
    choice.theme = theme;
  }
  if (isPlayerColor(player)) {
    choice.player = player;
  }
  if (isBoardSize(size)) {
    choice.size = size;
  }
}

function updateSummary() {
  setText('summary-theme', choice.theme ? THEMES[choice.theme].label : 'Game theme');
  setText('summary-player', choice.player ? capitalize(choice.player) : 'Player');
  setText('summary-size', choice.size ? `Board-${choice.size} Cards` : 'Board size');
}

function updatePreview() {
  const theme = THEMES[choice.theme ?? DEFAULT_THEME];
  setImage('preview', theme.preview);
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

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
