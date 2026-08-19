/**
 * Core data types of the memory game.
 *
 * This module defines the vocabulary shared by every layer: game logic,
 * rendering and persistence talk to each other exclusively through these types.
 *
 * @packageDocumentation
 */

/**
 * A single card on the board.
 *
 * Identity and motif are fixed once the deck is shuffled; only the visibility
 * flags change while the game is running.
 */
export interface Card {
  /** Position in the deck, equal to the index in {@link GameState.cards}. */
  readonly id: number;

  /** Pair key. Two cards belong together when this value matches. */
  readonly pairId: number;

  /** Resolved image path of the motif on the card front. */
  readonly motif: string;

  /** Whether the card is currently face up because it was clicked. */
  isFlipped: boolean;

  /** Whether the card belongs to a solved pair and stays face up. */
  isMatched: boolean;
}

/**
 * The two competing sides.
 *
 * The value doubles as the key in {@link GameState.scores} and as the CSS
 * modifier suffix in the user interface.
 */
export type PlayerColor = 'blue' | 'orange';

/**
 * Complete state of a running game.
 *
 * Created by {@link game/state!createGame} and mutated in place by the other
 * game logic functions.
 */
export interface GameState {
  /** The shuffled deck. Its order is the order shown in the grid. */
  readonly cards: Card[];

  /** Image path of the card back, taken from the selected theme. */
  readonly backImage: string;

  /** Id of the first card revealed this turn, or `null`. */
  firstPick: number | null;

  /** Id of the second card revealed this turn, or `null`. */
  secondPick: number | null;

  /** Blocks input while a non-matching pair is still on display. */
  isLocked: boolean;

  /** Pairs solved so far, counted across both players. */
  pairsFound: number;

  /** Score per player. Each solved pair is worth one point. */
  scores: Record<PlayerColor, number>;

  /** Player whose turn it is. */
  currentPlayer: PlayerColor;
}

/**
 * Outcome of a click on a card, returned by {@link game/state!flipCard}.
 *
 * - `ignored` – click had no effect (board locked, or card already face up)
 * - `flipped` – first card of the turn revealed
 * - `match` – second card matches, pair solved
 * - `mismatch` – second card does not match, board stays locked until hidden again
 */
export type FlipResult = 'ignored' | 'flipped' | 'match' | 'mismatch';

/**
 * Supported board sizes, given as a card count.
 *
 * All values are even so the deck can be split into pairs without a remainder.
 */
export type BoardSize = 16 | 24 | 36;
