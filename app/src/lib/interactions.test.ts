import { describe, it, expect } from 'vitest';
import {
  INTERACTION_TYPES,
  PLATFORMS,
  TYPE_KEYWORDS,
  PLATFORM_KEYWORDS,
  TYPE_LABELS,
  PLATFORM_LABELS,
  generateTypeInferencePrompt,
  type InteractionType,
  type MessagePlatform,
} from './interactions';

describe('interactions config', () => {
  describe('INTERACTION_TYPES', () => {
    it('contains expected interaction types', () => {
      expect(INTERACTION_TYPES).toContain('CALL');
      expect(INTERACTION_TYPES).toContain('MESSAGE');
      expect(INTERACTION_TYPES).toContain('MEET');
      expect(INTERACTION_TYPES).toContain('VOICE');
    });

    it('has VOICE as the last type (default fallback)', () => {
      expect(INTERACTION_TYPES[INTERACTION_TYPES.length - 1]).toBe('VOICE');
    });
  });

  describe('PLATFORMS', () => {
    it('contains expected platforms', () => {
      expect(PLATFORMS).toContain('text');
      expect(PLATFORMS).toContain('instagram');
      expect(PLATFORMS).toContain('telegram');
      expect(PLATFORMS).toContain('linkedin');
    });

    it('has text as the first platform (default)', () => {
      expect(PLATFORMS[0]).toBe('text');
    });
  });

  describe('TYPE_KEYWORDS', () => {
    it('has keywords for every interaction type', () => {
      for (const type of INTERACTION_TYPES) {
        expect(TYPE_KEYWORDS).toHaveProperty(type);
        expect(Array.isArray(TYPE_KEYWORDS[type])).toBe(true);
      }
    });

    it('VOICE has empty keywords (it is the default)', () => {
      expect(TYPE_KEYWORDS.VOICE).toEqual([]);
    });

    it('CALL has phone-related keywords', () => {
      expect(TYPE_KEYWORDS.CALL).toContain('called');
      expect(TYPE_KEYWORDS.CALL.some(k => k.includes('phone'))).toBe(true);
    });

    it('MEET has in-person keywords', () => {
      expect(TYPE_KEYWORDS.MEET.some(k => k.includes('met') || k.includes('coffee'))).toBe(true);
    });

    it('MESSAGE has messaging keywords', () => {
      expect(TYPE_KEYWORDS.MESSAGE.some(k => k.includes('text') || k.includes('message'))).toBe(true);
    });
  });

  describe('PLATFORM_KEYWORDS', () => {
    it('has keywords for every platform', () => {
      for (const platform of PLATFORMS) {
        expect(PLATFORM_KEYWORDS).toHaveProperty(platform);
        expect(Array.isArray(PLATFORM_KEYWORDS[platform])).toBe(true);
        expect(PLATFORM_KEYWORDS[platform].length).toBeGreaterThan(0);
      }
    });

    it('each platform has at least one identifying keyword', () => {
      expect(PLATFORM_KEYWORDS.instagram.some(k => k.toLowerCase().includes('instagram') || k === 'IG')).toBe(true);
      expect(PLATFORM_KEYWORDS.telegram.some(k => k.toLowerCase().includes('telegram'))).toBe(true);
      expect(PLATFORM_KEYWORDS.linkedin.some(k => k.toLowerCase().includes('linkedin'))).toBe(true);
    });
  });

  describe('TYPE_LABELS', () => {
    it('has a label for every interaction type', () => {
      for (const type of INTERACTION_TYPES) {
        expect(TYPE_LABELS).toHaveProperty(type);
        expect(typeof TYPE_LABELS[type]).toBe('string');
        expect(TYPE_LABELS[type].length).toBeGreaterThan(0);
      }
    });
  });

  describe('PLATFORM_LABELS', () => {
    it('has a label for every platform', () => {
      for (const platform of PLATFORMS) {
        expect(PLATFORM_LABELS).toHaveProperty(platform);
        expect(typeof PLATFORM_LABELS[platform]).toBe('string');
        expect(PLATFORM_LABELS[platform].length).toBeGreaterThan(0);
      }
    });
  });

  describe('generateTypeInferencePrompt', () => {
    it('returns a non-empty string', () => {
      const prompt = generateTypeInferencePrompt();
      expect(typeof prompt).toBe('string');
      expect(prompt.length).toBeGreaterThan(0);
    });

    it('includes all interaction types with keywords', () => {
      const prompt = generateTypeInferencePrompt();
      // Types with keywords should be mentioned
      expect(prompt).toContain('CALL');
      expect(prompt).toContain('MESSAGE');
      expect(prompt).toContain('MEET');
      expect(prompt).toContain('VOICE');
    });

    it('includes platform detection section', () => {
      const prompt = generateTypeInferencePrompt();
      expect(prompt).toContain('Platform Detection');
      expect(prompt).toContain('instagram');
      expect(prompt).toContain('telegram');
      expect(prompt).toContain('linkedin');
    });

    it('mentions VOICE as default', () => {
      const prompt = generateTypeInferencePrompt();
      expect(prompt.toLowerCase()).toContain('default');
      expect(prompt).toContain('VOICE');
    });

    it('mentions text as default platform for MESSAGE', () => {
      const prompt = generateTypeInferencePrompt();
      expect(prompt).toContain('text');
    });
  });

  describe('type safety', () => {
    it('InteractionType is a valid type', () => {
      const type: InteractionType = 'CALL';
      expect(INTERACTION_TYPES).toContain(type);
    });

    it('MessagePlatform is a valid type', () => {
      const platform: MessagePlatform = 'instagram';
      expect(PLATFORMS).toContain(platform);
    });
  });
});
