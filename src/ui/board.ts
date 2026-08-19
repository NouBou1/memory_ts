/**
 * Rendering of the board into the DOM.
 *
 * The only place that turns cards into HTML, which is what keeps the game logic
 * free of DOM access.
 *
 * Expects a `<template id="card-template">` in the document containing `.card`,
 * `.card__face--front` and `.card__face--back`.
 *
 * @packageDocumentation
 */

import type { Card, GameState } from '../types/card';

/**
 * Repaints the entire board.
 *
 * Also sets the CSS variables `--columns` and `--rows` from which the
 * stylesheet builds the grid. Does nothing when the card template is missing.
 *
 * @param fieldRef - Container whose contents are replaced wholesale
 * @param state - Supplies the deck and the card back
 */
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

/**
 * Brings a single card in the DOM in line with its state.
 *
 * Cheaper than {@link renderBoard} because it only toggles classes, which also
 * preserves the CSS flip animation. Solved cards are disabled so they cannot be
 * clicked again.
 *
 * @param fieldRef - Container of the board
 * @param card - Card whose state should be applied
 */
export function syncCard(fieldRef: HTMLElement, card: Card) {
  const cardRef = fieldRef.querySelector<HTMLButtonElement>(`[data-id="${card.id}"]`);
  if (cardRef) {
    cardRef.classList.toggle('is-flipped', card.isFlipped || card.isMatched);
    cardRef.classList.toggle('is-matched', card.isMatched);
    cardRef.disabled = card.isMatched;
  }
}

/**
 * Creates the DOM element for one card from the template.
 *
 * The id is stored as `data-id`, which later serves both to resolve clicks and
 * to find the element again in {@link syncCard}.
 *
 * @param templateRef - Template holding the card markup
 * @param card - Card to create
 * @param backImage - Image path of the back, identical for every card
 * @returns The populated card element
 * @throws Error - when the template is missing one of the expected classes
 */
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

/**
 * Picks the number of grid columns for a given card count.
 *
 * @param cardCount - Number of cards in the deck
 * @returns 4 columns for the small board, 6 otherwise
 */
function columnsFor(cardCount: number): number {
  if (cardCount <= 16) {
    return 4;
  }
  return 6;
}
