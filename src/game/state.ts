/**
 * Game logic of the memory game.
 *
 * These functions know nothing about the DOM or about theme rendering: they
 * only create and mutate a `GameState`. How the outcome is displayed is
 * left to the caller.
 *
 * All state changes happen in place on the object passed in.
 *
 * @packageDocumentation
 */

import type { BoardSize, Card, FlipResult, GameState, PlayerColor } from '../types/card';
import type { Theme } from '../data/themes';
import { shuffle } from './shuffle';

/**
 * Creates a new game with a freshly shuffled deck and an empty score.
 *
 * @param theme - Supplies the motifs and the card back
 * @param size - Desired number of cards
 * @param startingPlayer - Player who takes the first turn
 * @returns Initial state, ready for {@link flipCard}
 */
export function createGame(theme: Theme, size: BoardSize, startingPlayer: PlayerColor): GameState {
  return {
    cards: createCards(theme, size),
    backImage: theme.back,
    firstPick: null,
    secondPick: null,
    isLocked: false,
    pairsFound: 0,
    scores: { blue: 0, orange: 0 },
    currentPlayer: startingPlayer,
  };
}

/**
 * Builds the shuffled deck for a game.
 *
 * Shuffled twice, for two different reasons: first the motifs, so that a small
 * board draws a random subset of the theme, then the duplicated cards, so that
 * pairs do not end up next to each other.
 *
 * @param theme - Source of the motifs; must provide at least `size / 2` of them
 * @param size - Number of cards on the board
 * @returns Deck with consecutive ids in display order
 */
function createCards(theme: Theme, size: BoardSize): Card[] {
  const motifs = shuffle(theme.motifs).slice(0, size / 2);
  const deck = shuffle(motifs.flatMap(toPair));

  return deck.map((entry, id) => ({
    id,
    pairId: entry.pairId,
    motif: entry.motif,
    isFlipped: false,
    isMatched: false,
  }));
}

/**
 * Duplicates a motif into a matching pair of cards.
 *
 * Written as a `flatMap` callback, hence the index parameter.
 *
 * @param motif - Image path of the motif
 * @param pairId - Running index of the motif, used as the pair key
 * @returns Two entries sharing the same `pairId`
 */
function toPair(motif: string, pairId: number) {
  return [
    { motif, pairId },
    { motif, pairId },
  ];
}

/**
 * Reveals a card and evaluates the turn.
 *
 * The single entry point for every click on the board. On `'mismatch'` the
 * board stays locked until the caller invokes {@link hideMismatch}, usually
 * after a short display delay.
 *
 * @param state - Mutated in place
 * @param id - Id of the clicked card
 * @returns How the click was scored
 */
export function flipCard(state: GameState, id: number): FlipResult {
  const card = state.cards[id];
  if (!card || isBlocked(state, card)) {
    return 'ignored';
  }

  card.isFlipped = true;
  if (state.firstPick === null) {
    state.firstPick = id;
    return 'flipped';
  }

  return resolveSecondPick(state, card, id, state.firstPick);
}

/**
 * Checks whether a card is out of play for the current click.
 *
 * @param state - Current state
 * @param card - Clicked card
 * @returns `true` when the board is locked or the card is already face up
 */
function isBlocked(state: GameState, card: Card): boolean {
  return state.isLocked || card.isFlipped || card.isMatched;
}

/**
 * Evaluates the second card of a turn against the first.
 *
 * @param state - Mutated in place
 * @param card - Second revealed card
 * @param id - Id of the second card
 * @param firstId - Id of the previously revealed card
 * @returns `'match'` on equal `pairId`, otherwise `'mismatch'` and a locked board
 */
function resolveSecondPick(state: GameState, card: Card, id: number, firstId: number): FlipResult {
  state.secondPick = id;
  const first = state.cards[firstId];

  if (first && first.pairId === card.pairId) {
    scoreMatch(state, first, card);
    return 'match';
  }

  state.isLocked = true;
  return 'mismatch';
}

/**
 * Awards a solved pair and frees the board again.
 *
 * Deliberately does not switch players: whoever finds a pair goes again. The
 * handover happens only in {@link hideMismatch}.
 *
 * @param state - Mutated in place
 * @param first - Card revealed first
 * @param second - Card revealed second
 */
function scoreMatch(state: GameState, first: Card, second: Card) {
  first.isMatched = true;
  second.isMatched = true;
  state.pairsFound += 1;
  state.scores[state.currentPlayer] += 1;
  clearPicks(state);
}

/**
 * Turns a non-matching pair back over and hands play to the other player.
 *
 * Only to be called after a `'mismatch'`. Releases the lock.
 *
 * @param state - Mutated in place
 * @returns The cards turned back over, so the caller can repaint just those
 */
export function hideMismatch(state: GameState): Card[] {
  const hidden = pickedCards(state);
  hidden.forEach(card => {
    card.isFlipped = false;
  });

  clearPicks(state);
  state.isLocked = false;
  state.currentPlayer = state.currentPlayer === 'blue' ? 'orange' : 'blue';
  return hidden;
}

/**
 * Resolves the currently picked ids to cards.
 *
 * @param state - Current state
 * @returns The revealed cards of this turn, with gaps removed
 */
function pickedCards(state: GameState): Card[] {
  return [state.firstPick, state.secondPick]
    .map(id => (id === null ? undefined : state.cards[id]))
    .filter((card): card is Card => card !== undefined);
}

/**
 * Checks whether every pair has been found.
 *
 * @param state - Current state
 * @returns `true` when the game is over
 */
export function isWon(state: GameState): boolean {
  return state.pairsFound === state.cards.length / 2;
}

/**
 * Clears the picks of the current turn.
 *
 * @param state - Mutated in place
 */
function clearPicks(state: GameState) {
  state.firstPick = null;
  state.secondPick = null;
}
