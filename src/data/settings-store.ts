/**
 * Handover of the game settings between pages.
 *
 * The settings page and the game are separate HTML documents and therefore
 * share no memory in the browser. `sessionStorage` bridges the page change and
 * clears itself when the tab closes, which is exactly the intended lifetime.
 *
 * Because foreign code may have touched that storage, everything read back is
 * validated rather than trusted.
 *
 * @packageDocumentation
 */

import type { BoardSize, PlayerColor } from '../types/card';
import type { ThemeId } from './themes';

export type { PlayerColor };

export interface GameSettings {
  theme: ThemeId;
  player: PlayerColor;
  size: BoardSize;
}

const STORAGE_KEY = 'memory-settings';

/**
 * Stores the settings for the upcoming page change.
 *
 * @param settings - Complete selection; partial input is not supported
 */
export function saveSettings(settings: GameSettings) {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

/**
 * Reads the stored settings back.
 *
 * Returns `null` on any doubt: no entry, broken JSON, or unexpected values. The
 * caller therefore needs a default anyway and can skip its own error handling.
 *
 * @returns Validated settings, or `null`
 */
export function loadSettings(): GameSettings | null {
  const raw = sessionStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return null;
  }

  const parsed = parseSettings(raw);
  return isGameSettings(parsed) ? parsed : null;
}

/**
 * Turns the raw string into an object without throwing on broken JSON.
 *
 * @param raw - Contents read from `sessionStorage`
 * @returns The parsed result as `unknown`, or `null` on a syntax error
 */
function parseSettings(raw: string): unknown {
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/**
 * Checks whether an arbitrary value holds complete settings.
 *
 * @param value - Value to check
 * @returns Type guard for `GameSettings`
 */
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

/**
 * Checks whether a value is a known theme id.
 *
 * @param value - Value to check
 * @returns Type guard for `ThemeId`
 */
export function isThemeId(value: unknown): value is ThemeId {
  return value === 'code-vibes' || value === 'gaming';
}

/**
 * Checks whether a value is a valid player color.
 *
 * @param value - Value to check
 * @returns Type guard for `PlayerColor`
 */
export function isPlayerColor(value: unknown): value is PlayerColor {
  return value === 'blue' || value === 'orange';
}

/**
 * Checks whether a value is one of the offered board sizes.
 *
 * @param value - Value to check, typically taken from a form field
 * @returns Type guard for `BoardSize`
 */
export function isBoardSize(value: unknown): value is BoardSize {
  return value === 16 || value === 24 || value === 36;
}
