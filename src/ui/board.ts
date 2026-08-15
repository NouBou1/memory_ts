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
  const clone = templateRef.content.cloneNode(true) as DocumentFragment;
  const cardRef = clone.querySelector('.card') as HTMLButtonElement;
  const frontRef = clone.querySelector('.card__face--front') as HTMLElement;
  const backRef = clone.querySelector('.card__face--back') as HTMLElement;

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
