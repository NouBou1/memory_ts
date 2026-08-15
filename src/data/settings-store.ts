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
  return parsed && isGameSettings(parsed) ? parsed : null;
}

function parseSettings(raw: string): Partial<GameSettings> | null {
  try {
    return JSON.parse(raw) as Partial<GameSettings>;
  } catch {
    return null;
  }
}

function isGameSettings(value: Partial<GameSettings>): value is GameSettings {
  return isThemeId(value.theme) && isPlayerColor(value.player) && isBoardSize(value.size);
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
