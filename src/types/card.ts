/**
 * Core data types of the memory game.
 *
 * This module defines the vocabulary shared by every layer: game logic,
 * rendering and persistence talk to each other exclusively through these types.
 *
 * @packageDocumentation
 */

export interface Card {
  readonly id: number;
  readonly pairId: number;
  readonly motif: string;
  isFlipped: boolean;
  isMatched: boolean;
}

export type PlayerColor = 'blue' | 'orange';

export interface GameState {
  readonly cards: Card[];
  readonly backImage: string;
  firstPick: number | null;
  secondPick: number | null;
  isLocked: boolean;
  pairsFound: number;
  scores: Record<PlayerColor, number>;
  currentPlayer: PlayerColor;
}

export type FlipResult = 'ignored' | 'flipped' | 'match' | 'mismatch';

export type BoardSize = 16 | 24 | 36;
