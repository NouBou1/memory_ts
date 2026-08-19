/**
 * Definition of the two game worlds.
 *
 * A theme bundles everything that differs between the variants: motifs, colors,
 * card proportions and the wording of the end screen. A new theme is just
 * another entry in `THEMES`, with no change to the game logic.
 *
 * The image paths are resolved and hashed by Vite at build time, which is why
 * they are imported instead of hard-coded as strings.
 *
 * @packageDocumentation
 */

import cv01 from '../assets/images/cards/code-vibes/01.svg';
import cv02 from '../assets/images/cards/code-vibes/02.svg';
import cv03 from '../assets/images/cards/code-vibes/03.svg';
import cv04 from '../assets/images/cards/code-vibes/04.svg';
import cv05 from '../assets/images/cards/code-vibes/05.svg';
import cv06 from '../assets/images/cards/code-vibes/06.svg';
import cv07 from '../assets/images/cards/code-vibes/07.svg';
import cv08 from '../assets/images/cards/code-vibes/08.svg';
import cv09 from '../assets/images/cards/code-vibes/09.svg';
import cv10 from '../assets/images/cards/code-vibes/10.svg';
import cv11 from '../assets/images/cards/code-vibes/11.svg';
import cv12 from '../assets/images/cards/code-vibes/12.svg';
import cv13 from '../assets/images/cards/code-vibes/13.svg';
import cv14 from '../assets/images/cards/code-vibes/14.svg';
import cv15 from '../assets/images/cards/code-vibes/15.svg';
import cv16 from '../assets/images/cards/code-vibes/16.svg';
import cv17 from '../assets/images/cards/code-vibes/17.svg';
import cv18 from '../assets/images/cards/code-vibes/18.svg';
import cvBack from '../assets/images/cards/code-vibes/back.svg';

import gm01 from '../assets/images/cards/gaming/01.svg';
import gm02 from '../assets/images/cards/gaming/02.svg';
import gm03 from '../assets/images/cards/gaming/03.svg';
import gm04 from '../assets/images/cards/gaming/04.svg';
import gm05 from '../assets/images/cards/gaming/05.svg';
import gm06 from '../assets/images/cards/gaming/06.svg';
import gm07 from '../assets/images/cards/gaming/07.svg';
import gm08 from '../assets/images/cards/gaming/08.svg';
import gm09 from '../assets/images/cards/gaming/09.svg';
import gm10 from '../assets/images/cards/gaming/10.svg';
import gm11 from '../assets/images/cards/gaming/11.svg';
import gm12 from '../assets/images/cards/gaming/12.svg';
import gm13 from '../assets/images/cards/gaming/13.svg';
import gm14 from '../assets/images/cards/gaming/14.svg';
import gm15 from '../assets/images/cards/gaming/15.svg';
import gm16 from '../assets/images/cards/gaming/16.svg';
import gm17 from '../assets/images/cards/gaming/17.svg';
import gm18 from '../assets/images/cards/gaming/18.svg';
import gmBack from '../assets/images/cards/gaming/back.svg';

import cvPreview from '../assets/images/themes/code-vibes.svg';
import gmPreview from '../assets/images/themes/gaming.svg';
import trophy from '../assets/images/winner/trophy.svg';
import chessPawn from '../assets/icons/chess_pawn.svg';
import playerLabel from '../assets/images/label.svg';

export type ThemeId = 'code-vibes' | 'gaming';

export interface Theme {
  readonly id: ThemeId;
  readonly label: string;
  readonly back: string;
  readonly preview: string;
  readonly background: readonly [string, string];
  readonly accent: string;
  readonly accentDark: string;
  readonly winnerImage: string | null;
  readonly hasConfetti: boolean;
  readonly winnerUppercase: boolean;
  readonly endButton: {
    readonly label: string;
    readonly style: 'solid' | 'ghost';
  };
  readonly cardSize: readonly [number, number];
  readonly playerIcon: {
    readonly src: string;
    readonly size: readonly [number, number];
  };
  readonly motifs: readonly string[];
}

export const THEMES: Record<ThemeId, Theme> = {
  'code-vibes': {
    id: 'code-vibes',
    label: 'Code vibes theme',
    back: cvBack,
    preview: cvPreview,
    background: ['#303131', '#6d6d6d'],
    accent: '#4dd5bc',
    accentDark: '#286f62',
    winnerImage: null,
    hasConfetti: true,
    winnerUppercase: true,
    endButton: { label: 'Back to start', style: 'solid' },
    cardSize: [120, 120],
    playerIcon: { src: playerLabel, size: [24, 20] },
    motifs: [
      cv01, cv02, cv03, cv04, cv05, cv06, cv07, cv08, cv09,
      cv10, cv11, cv12, cv13, cv14, cv15, cv16, cv17, cv18,
    ],
  },
  gaming: {
    id: 'gaming',
    label: 'Gaming theme',
    back: gmBack,
    preview: gmPreview,
    background: ['#294f60', '#2086b4'],
    accent: '#ed1b76',
    accentDark: '#0a2835',
    winnerImage: trophy,
    hasConfetti: false,
    winnerUppercase: false,
    endButton: { label: 'Home', style: 'ghost' },
    cardSize: [105, 120],
    playerIcon: { src: chessPawn, size: [22, 27] },
    motifs: [
      gm01, gm02, gm03, gm04, gm05, gm06, gm07, gm08, gm09,
      gm10, gm11, gm12, gm13, gm14, gm15, gm16, gm17, gm18,
    ],
  },
};
