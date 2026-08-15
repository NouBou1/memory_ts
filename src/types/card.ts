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
