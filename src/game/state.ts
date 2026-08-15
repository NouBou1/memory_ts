import type { BoardSize, Card, FlipResult, GameState, PlayerColor } from '../types/card';
import type { Theme } from '../data/themes';
import { shuffle } from './shuffle';

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

function toPair(motif: string, pairId: number) {
  return [
    { motif, pairId },
    { motif, pairId },
  ];
}

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

function isBlocked(state: GameState, card: Card): boolean {
  return state.isLocked || card.isFlipped || card.isMatched;
}

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

function scoreMatch(state: GameState, first: Card, second: Card) {
  first.isMatched = true;
  second.isMatched = true;
  state.pairsFound += 1;
  state.scores[state.currentPlayer] += 1;
  clearPicks(state);
}

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

function pickedCards(state: GameState): Card[] {
  return [state.firstPick, state.secondPick]
    .map(id => (id === null ? undefined : state.cards[id]))
    .filter((card): card is Card => card !== undefined);
}

export function isWon(state: GameState): boolean {
  return state.pairsFound === state.cards.length / 2;
}

function clearPicks(state: GameState) {
  state.firstPick = null;
  state.secondPick = null;
}
