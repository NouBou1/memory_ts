import type { BoardSize, PlayerColor } from '../types/card';
import type { ThemeId } from './themes';

export type { PlayerColor };

export interface GameSettings {
  theme: ThemeId;
  player: PlayerColor;
  size: BoardSize;
}

const STORAGE_KEY = 'memory-settings';

export function saveSettings(settings: GameSettings) {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

export function loadSettings(): GameSettings | null {
  const raw = sessionStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return null;
  }

  const parsed = parseSettings(raw);
  return isGameSettings(parsed) ? parsed : null;
}

function parseSettings(raw: string): unknown {
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function isGameSettings(value: unknown): value is GameSettings {
  return (
    typeof value === 'object' &&
    value !== null &&
    'theme' in value &&
    isThemeId(value.theme) &&
    'player' in value &&
    isPlayerColor(value.player) &&
    'size' in value &&
    isBoardSize(value.size)
  );
}

export function isThemeId(value: unknown): value is ThemeId {
  return value === 'code-vibes' || value === 'gaming';
}

export function isPlayerColor(value: unknown): value is PlayerColor {
  return value === 'blue' || value === 'orange';
}

export function isBoardSize(value: unknown): value is BoardSize {
  return value === 16 || value === 24 || value === 36;
}
