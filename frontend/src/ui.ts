import type { SemColor } from './types';

/* Literal class-string maps so the Tailwind JIT sees every class. Never build
   class names by interpolation. */

export const TEXT_COLOR: Record<SemColor, string> = {
  good: 'text-good',
  warn: 'text-warn',
  bad: 'text-bad',
  text: 'text-text',
  muted: 'text-muted',
  faint: 'text-faint',
};

export const BG_COLOR: Record<SemColor, string> = {
  good: 'bg-good',
  warn: 'bg-warn',
  bad: 'bg-bad',
  text: 'bg-text',
  muted: 'bg-muted',
  faint: 'bg-faint',
};

export const FONT_WEIGHT: Record<400 | 500 | 600, string> = {
  400: 'font-normal',
  500: 'font-medium',
  600: 'font-semibold',
};
