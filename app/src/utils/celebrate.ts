import confetti from 'canvas-confetti';

/**
 * Garden-themed color palette for celebrations.
 * Emerald, lime, and sage tones to match the app's nature theme.
 */
export const GARDEN_COLORS = [
  '#10b981', // emerald-500
  '#34d399', // emerald-400
  '#84cc16', // lime-500
  '#a3e635', // lime-400
  '#65a30d', // lime-600
];

/**
 * Triggers a garden-themed confetti celebration.
 * Used when users successfully log an interaction.
 *
 * @param originElement - Optional element to burst from. If not provided, bursts from center-bottom.
 */
export function celebrateInteraction(originElement?: HTMLElement): void {
  let origin = { x: 0.5, y: 0.6 };

  if (originElement) {
    const rect = originElement.getBoundingClientRect();
    origin = {
      x: (rect.left + rect.width / 2) / window.innerWidth,
      y: (rect.top + rect.height / 2) / window.innerHeight,
    };
  }

  confetti({
    particleCount: 80,
    spread: 70,
    origin,
    colors: GARDEN_COLORS,
    gravity: 1.2,
    ticks: 150,
  });
}
