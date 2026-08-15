import type { BoardSize, PlayerColor } from '../types/card';
import type { ThemeId } from './themes';

export type { PlayerColor };

export interface GameSettings {
  theme: ThemeId;
  player: PlayerColor;
  size: BoardSize;
}

const STORAGE_KEY = 'memory-settings';

export function saveSettings(settings: GameSettings): void {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

export function loadSettings(): GameSettings | null {
  const raw = sessionStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return null;
  }

  const parsed = JSON.parse(raw) as Partial<GameSettings>;
  if (isThemeId(parsed.theme) && isPlayerColor(parsed.player) && isBoardSize(parsed.size)) {
    return { theme: parsed.theme, player: parsed.player, size: parsed.size };
  }

  return null;
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
