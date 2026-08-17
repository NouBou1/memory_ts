import type { Card, GameState } from '../types/card';

export function renderBoard(fieldRef: HTMLElement, state: GameState) {
  const templateRef = document.getElementById('card-template');
  if (templateRef instanceof HTMLTemplateElement) {
    const columns = columnsFor(state.cards.length);
    fieldRef.style.setProperty('--columns', String(columns));
    fieldRef.style.setProperty('--rows', String(Math.ceil(state.cards.length / columns)));
    fieldRef.replaceChildren(
      ...state.cards.map(card => createCard(templateRef, card, state.backImage)),
    );
  }
}

export function syncCard(fieldRef: HTMLElement, card: Card) {
  const cardRef = fieldRef.querySelector<HTMLButtonElement>(`[data-id="${card.id}"]`);
  if (cardRef) {
    cardRef.classList.toggle('is-flipped', card.isFlipped || card.isMatched);
    cardRef.classList.toggle('is-matched', card.isMatched);
    cardRef.disabled = card.isMatched;
  }
}

function createCard(templateRef: HTMLTemplateElement, card: Card, backImage: string): HTMLElement {
  const clone = document.importNode(templateRef.content, true);
  const cardRef = clone.querySelector<HTMLButtonElement>('.card');
  const frontRef = clone.querySelector<HTMLElement>('.card__face--front');
  const backRef = clone.querySelector<HTMLElement>('.card__face--back');

  if (!cardRef || !frontRef || !backRef) {
    throw new Error('Card template is missing .card, .card__face--front or .card__face--back');
  }

  cardRef.dataset.id = String(card.id);
  frontRef.style.backgroundImage = `url("${backImage}")`;
  backRef.style.backgroundImage = `url("${card.motif}")`;

  return cardRef;
}

function columnsFor(cardCount: number): number {
  if (cardCount <= 16) {
    return 4;
  }
  return 6;
}
