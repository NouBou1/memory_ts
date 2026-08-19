/**
 * Random shuffling of lists.
 *
 * @packageDocumentation
 */

/**
 * Shuffles a list uniformly at random (Fisher-Yates).
 *
 * The input is left untouched; the result is always a new list. Used both for
 * picking the motifs and for arranging the cards.
 *
 * @typeParam T - Element type of the list
 * @param items - Source list, not modified
 * @returns A new list holding the same elements in random order
 *
 * @example
 * ```ts
 * const deck = shuffle(['a', 'b', 'c']);
 * ```
 */
export function shuffle<T>(items: readonly T[]): T[] {
  const result = [...items];

  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    const a = result[i]!;
    result[i] = result[j]!;
    result[j] = a;
  }

  return result;
}
