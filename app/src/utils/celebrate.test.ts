import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Use vi.hoisted() for proper mock initialization order
const mockConfetti = vi.hoisted(() => vi.fn());

vi.mock('canvas-confetti', () => ({
  default: mockConfetti,
}));

import { celebrateInteraction, GARDEN_COLORS } from './celebrate';

describe('celebrate', () => {
  beforeEach(() => {
    mockConfetti.mockClear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('GARDEN_COLORS', () => {
    it('contains garden-themed colors', () => {
      expect(GARDEN_COLORS).toBeDefined();
      expect(GARDEN_COLORS.length).toBeGreaterThan(0);
      // All colors should be hex codes
      GARDEN_COLORS.forEach((color) => {
        expect(color).toMatch(/^#[0-9a-fA-F]{6}$/);
      });
    });
  });

  describe('celebrateInteraction', () => {
    it('triggers confetti with garden colors', () => {
      celebrateInteraction();

      expect(mockConfetti).toHaveBeenCalledTimes(1);
      expect(mockConfetti).toHaveBeenCalledWith(
        expect.objectContaining({
          colors: GARDEN_COLORS,
        })
      );
    });

    it('uses center of screen when no element provided', () => {
      celebrateInteraction();

      expect(mockConfetti).toHaveBeenCalledWith(
        expect.objectContaining({
          origin: { x: 0.5, y: 0.6 },
        })
      );
    });

    it('calculates origin from element position when element is provided', () => {
      // Create a mock element with getBoundingClientRect
      const mockElement = {
        getBoundingClientRect: () => ({
          left: 100,
          top: 200,
          width: 50,
          height: 30,
        }),
      } as HTMLElement;

      // Mock window dimensions
      Object.defineProperty(window, 'innerWidth', { value: 1000, writable: true });
      Object.defineProperty(window, 'innerHeight', { value: 800, writable: true });

      celebrateInteraction(mockElement);

      expect(mockConfetti).toHaveBeenCalledWith(
        expect.objectContaining({
          // Origin should be (100 + 25) / 1000 = 0.125 for x
          // Origin should be (200 + 15) / 800 = 0.26875 for y
          origin: { x: 0.125, y: 0.26875 },
        })
      );
    });

    it('uses reasonable particle count and spread', () => {
      celebrateInteraction();

      const callArgs = mockConfetti.mock.calls[0][0];
      expect(callArgs.particleCount).toBeGreaterThanOrEqual(50);
      expect(callArgs.particleCount).toBeLessThanOrEqual(150);
      expect(callArgs.spread).toBeGreaterThanOrEqual(50);
      expect(callArgs.spread).toBeLessThanOrEqual(100);
    });
  });
});
