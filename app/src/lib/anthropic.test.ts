import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Preference, Interaction, Seedling, FamilyMember, Cadence } from '@/types';

// Mock create function - hoisted with the mock
const mockCreate = vi.hoisted(() => vi.fn());

// Mock the Anthropic SDK
vi.mock('@anthropic-ai/sdk', () => {
  return {
    default: class MockAnthropic {
      messages = {
        create: mockCreate,
      };
    },
  };
});

// Import after mock is set up
import { generateBriefing } from './anthropic';

describe('generateBriefing', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockContactData = {
    name: 'Sarah Johnson',
    preferences: [
      { id: '1', category: 'ALWAYS' as const, content: 'Loves hiking' },
      { id: '2', category: 'ALWAYS' as const, content: 'Coffee enthusiast' },
      { id: '3', category: 'NEVER' as const, content: 'Allergic to shellfish' },
    ] as Preference[],
    interactions: [
      {
        id: '1',
        date: new Date('2024-01-15'),
        type: 'CALL' as const,
        summary: 'Talked about her new job at the startup. She mentioned her mom was having surgery next week.',
      },
      {
        id: '2',
        date: new Date('2024-01-01'),
        type: 'MEET' as const,
        summary: 'Had coffee together. She was excited about her upcoming hiking trip to Colorado.',
      },
    ] as Interaction[],
    seedlings: [
      { id: '1', content: "Ask about her mom's surgery recovery", status: 'ACTIVE' as const, createdAt: new Date() },
      { id: '2', content: 'Recommend that coffee shop in downtown', status: 'ACTIVE' as const, createdAt: new Date() },
    ] as Seedling[],
    familyMembers: [
      { id: '1', name: 'Max', relation: 'Son (10 yrs)' },
      { id: '2', name: 'Tom', relation: 'Husband' },
    ] as FamilyMember[],
    birthday: new Date('1985-06-15'),
    cadence: 'REGULARLY' as Cadence,
    location: 'Austin, TX',
  };

  it('returns a ContactBriefing with required fields', async () => {
    const mockResponse = {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            relationshipSummary: 'Sarah is a close friend who loves outdoor activities and coffee.',
            recentHighlights: [
              'Started a new job at a startup',
              'Her mom had surgery recently',
              'Planning a hiking trip to Colorado',
            ],
            conversationStarters: [
              'How is your mom recovering from surgery?',
              'How is the new job going?',
              'Did you go on that Colorado hiking trip?',
            ],
            upcomingMilestones: [
              'Her birthday is coming up in June',
              'Max might be starting middle school soon',
            ],
          }),
        },
      ],
    };

    mockCreate.mockResolvedValueOnce(mockResponse);

    const result = await generateBriefing(mockContactData);

    expect(result).toHaveProperty('relationshipSummary');
    expect(result).toHaveProperty('recentHighlights');
    expect(result).toHaveProperty('conversationStarters');
    expect(result).toHaveProperty('upcomingMilestones');
    expect(typeof result.relationshipSummary).toBe('string');
    expect(Array.isArray(result.recentHighlights)).toBe(true);
    expect(Array.isArray(result.conversationStarters)).toBe(true);
    expect(Array.isArray(result.upcomingMilestones)).toBe(true);
  });

  it('calls Anthropic API with correct parameters', async () => {
    const mockResponse = {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            relationshipSummary: 'Test summary',
            recentHighlights: [],
            conversationStarters: [],
            upcomingMilestones: [],
          }),
        },
      ],
    };

    mockCreate.mockResolvedValueOnce(mockResponse);

    await generateBriefing(mockContactData);

    expect(mockCreate).toHaveBeenCalledTimes(1);
    const callArgs = mockCreate.mock.calls[0][0];
    expect(callArgs).toHaveProperty('model');
    expect(callArgs).toHaveProperty('messages');
    expect(callArgs).toHaveProperty('system');
    expect(callArgs.messages[0].content).toContain('Sarah Johnson');
  });

  it('throws error when no text response from Claude', async () => {
    const mockResponse = {
      content: [],
    };

    mockCreate.mockResolvedValueOnce(mockResponse);

    await expect(generateBriefing(mockContactData)).rejects.toThrow('No text response from Claude');
  });

  it('throws error when response is not valid JSON', async () => {
    const mockResponse = {
      content: [
        {
          type: 'text',
          text: 'This is not JSON',
        },
      ],
    };

    mockCreate.mockResolvedValueOnce(mockResponse);

    await expect(generateBriefing(mockContactData)).rejects.toThrow('Failed to parse AI response as JSON');
  });

  it('handles contact with minimal data', async () => {
    const minimalContact = {
      name: 'John Doe',
      preferences: [] as Preference[],
      interactions: [] as Interaction[],
      seedlings: [] as Seedling[],
      familyMembers: [] as FamilyMember[],
      birthday: null,
      cadence: 'RARELY' as Cadence,
      location: null,
    };

    const mockResponse = {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            relationshipSummary: 'Not much is known about John yet.',
            recentHighlights: [],
            conversationStarters: ['Get to know them better!'],
            upcomingMilestones: [],
          }),
        },
      ],
    };

    mockCreate.mockResolvedValueOnce(mockResponse);

    const result = await generateBriefing(minimalContact);

    expect(result.relationshipSummary).toBeDefined();
    expect(result.conversationStarters).toHaveLength(1);
  });
});
