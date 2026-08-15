import type { BoardSize, Card, FlipResult, GameState, PlayerColor } from '../types/card';
import type { Theme } from '../data/themes';
import { shuffle } from './shuffle';

export function createGame(theme: Theme, size: BoardSize, startingPlayer: PlayerColor): GameState {
  const pairs = size / 2;
  const motifs = shuffle(theme.motifs).slice(0, pairs);

  const deck = shuffle(
    motifs.flatMap((motif, pairId) => [
      { motif, pairId },
      { motif, pairId },
    ]),
  );

  const cards: Card[] = deck.map((entry, id) => ({
    id,
    pairId: entry.pairId,
    motif: entry.motif,
    isFlipped: false,
    isMatched: false,
  }));

  return {
    cards,
    backImage: theme.back,
    firstPick: null,
    secondPick: null,
    isLocked: false,
    pairsFound: 0,
    scores: { blue: 0, orange: 0 },
    currentPlayer: startingPlayer,
  };
}

export function flipCard(state: GameState, id: number): FlipResult {
  const card = state.cards[id];

  if (!card || state.isLocked || card.isFlipped || card.isMatched) {
    return 'ignored';
  }

  card.isFlipped = true;

  if (state.firstPick === null) {
    state.firstPick = id;
    return 'flipped';
  }

  state.secondPick = id;
  const first = state.cards[state.firstPick];

  if (first && first.pairId === card.pairId) {
    first.isMatched = true;
    card.isMatched = true;
    state.pairsFound += 1;
    state.scores[state.currentPlayer] += 1;
    clearPicks(state);
    return 'match';
  }

  state.isLocked = true;
  return 'mismatch';
}

export function hideMismatch(state: GameState): Card[] {
  const hidden: Card[] = [];

  for (const id of [state.firstPick, state.secondPick]) {
    if (id === null) continue;
    const card = state.cards[id];
    if (card) {
      card.isFlipped = false;
      hidden.push(card);
    }
  }

  clearPicks(state);
  state.isLocked = false;
  state.currentPlayer = state.currentPlayer === 'blue' ? 'orange' : 'blue';
  return hidden;
}

export function isWon(state: GameState): boolean {
  return state.pairsFound === state.cards.length / 2;
}

function clearPicks(state: GameState): void {
  state.firstPick = null;
  state.secondPick = null;
}
