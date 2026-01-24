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
import { extractFromNote, generateBriefing, extractFromImage, _resetClient } from './anthropic';

describe('extractFromNote', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv('ANTHROPIC_API_KEY', 'test-api-key');
    _resetClient();
  });

  it('extracts contact name and basic fields', async () => {
    const mockResponse = {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            contactName: 'Sarah',
            interactionSummary: 'Had coffee together',
            interactionType: 'MEET',
          }),
        },
      ],
    };

    mockCreate.mockResolvedValueOnce(mockResponse);

    const result = await extractFromNote('Had coffee with Sarah today');

    expect(result.contactName).toBe('Sarah');
    expect(result.interactionSummary).toBe('Had coffee together');
    expect(result.interactionType).toBe('MEET');
  });

  it('infers MEET type from in-person keywords', async () => {
    const mockResponse = {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            contactName: 'Mike',
            interactionSummary: 'Grabbed lunch and discussed his new job',
            interactionType: 'MEET',
          }),
        },
      ],
    };

    mockCreate.mockResolvedValueOnce(mockResponse);

    const result = await extractFromNote('Grabbed lunch with Mike and he told me about his new job');

    expect(result.interactionType).toBe('MEET');
  });

  it('infers CALL type from phone keywords', async () => {
    const mockResponse = {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            contactName: 'John',
            interactionSummary: 'Phone call about weekend plans',
            interactionType: 'CALL',
          }),
        },
      ],
    };

    mockCreate.mockResolvedValueOnce(mockResponse);

    const result = await extractFromNote('Called John to discuss weekend plans');

    expect(result.interactionType).toBe('CALL');
  });

  it('infers MESSAGE type from text keywords', async () => {
    const mockResponse = {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            contactName: 'Lisa',
            interactionSummary: 'Quick text about meeting time',
            interactionType: 'MESSAGE',
            interactionPlatform: 'text',
          }),
        },
      ],
    };

    mockCreate.mockResolvedValueOnce(mockResponse);

    const result = await extractFromNote('Texted Lisa about when to meet');

    expect(result.interactionType).toBe('MESSAGE');
    expect(result.interactionPlatform).toBe('text');
  });

  it('infers MESSAGE with instagram platform', async () => {
    const mockResponse = {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            contactName: 'Emma',
            interactionSummary: 'DM about the party',
            interactionType: 'MESSAGE',
            interactionPlatform: 'instagram',
          }),
        },
      ],
    };

    mockCreate.mockResolvedValueOnce(mockResponse);

    const result = await extractFromNote('DMed Emma on Instagram about the party this weekend');

    expect(result.interactionType).toBe('MESSAGE');
    expect(result.interactionPlatform).toBe('instagram');
  });

  it('infers MESSAGE with linkedin platform', async () => {
    const mockResponse = {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            contactName: 'David',
            interactionSummary: 'LinkedIn message about job opportunity',
            interactionType: 'MESSAGE',
            interactionPlatform: 'linkedin',
          }),
        },
      ],
    };

    mockCreate.mockResolvedValueOnce(mockResponse);

    const result = await extractFromNote('Sent David a message on LinkedIn about the job opening');

    expect(result.interactionType).toBe('MESSAGE');
    expect(result.interactionPlatform).toBe('linkedin');
  });

  it('defaults to VOICE when no clear interaction type', async () => {
    const mockResponse = {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            contactName: 'Sarah',
            interactionSummary: 'Note about her birthday preferences',
            interactionType: 'VOICE',
          }),
        },
      ],
    };

    mockCreate.mockResolvedValueOnce(mockResponse);

    const result = await extractFromNote('Just want to remember that Sarah loves chocolate cake');

    expect(result.interactionType).toBe('VOICE');
  });

  it('throws error when no text response from Claude', async () => {
    const mockResponse = {
      content: [],
    };

    mockCreate.mockResolvedValueOnce(mockResponse);

    await expect(extractFromNote('test input')).rejects.toThrow('No text response from Claude');
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

    await expect(extractFromNote('test input')).rejects.toThrow('Failed to parse AI response as JSON');
  });

  it('extracts preferences and family members', async () => {
    const mockResponse = {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            contactName: 'Amy',
            preferences: [
              { category: 'ALWAYS', content: 'Loves hiking' },
              { category: 'NEVER', content: 'Allergic to shellfish' },
            ],
            familyMembers: [
              { name: 'Tom', relation: 'Husband' },
            ],
            interactionType: 'MEET',
          }),
        },
      ],
    };

    mockCreate.mockResolvedValueOnce(mockResponse);

    const result = await extractFromNote('Met with Amy who loves hiking. She mentioned she is allergic to shellfish. Her husband Tom was there too.');

    expect(result.preferences).toHaveLength(2);
    expect(result.preferences?.[0].category).toBe('ALWAYS');
    expect(result.familyMembers).toHaveLength(1);
    expect(result.familyMembers?.[0].name).toBe('Tom');
  });

  it('extracts seedlings (follow-up items)', async () => {
    const mockResponse = {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            contactName: 'Chris',
            seedlings: ['Ask about interview results', 'Remember to send book recommendation'],
            interactionType: 'CALL',
          }),
        },
      ],
    };

    mockCreate.mockResolvedValueOnce(mockResponse);

    const result = await extractFromNote('Called Chris, he has a job interview next week');

    expect(result.seedlings).toHaveLength(2);
    expect(result.seedlings).toContain('Ask about interview results');
  });

  it('classifies broad interests as TOPIC preferenceType', async () => {
    const mockResponse = {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            contactName: 'Sarah',
            preferences: [
              { category: 'ALWAYS', content: 'hiking and outdoor adventures', preferenceType: 'TOPIC' },
              { category: 'ALWAYS', content: 'sustainability and environmental issues', preferenceType: 'TOPIC' },
              { category: 'ALWAYS', content: 'AI and machine learning', preferenceType: 'TOPIC' },
            ],
            interactionType: 'MEET',
          }),
        },
      ],
    };

    mockCreate.mockResolvedValueOnce(mockResponse);

    const result = await extractFromNote('Sarah is really passionate about hiking, sustainability, and AI');

    expect(result.preferences).toHaveLength(3);
    result.preferences?.forEach((p) => {
      expect(p.preferenceType).toBe('TOPIC');
    });
  });

  it('classifies specific likes/dislikes as PREFERENCE preferenceType', async () => {
    const mockResponse = {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            contactName: 'Mike',
            preferences: [
              { category: 'ALWAYS', content: 'Loves Italian food', preferenceType: 'PREFERENCE' },
              { category: 'ALWAYS', content: 'Prefers window seats', preferenceType: 'PREFERENCE' },
              { category: 'NEVER', content: 'Allergic to shellfish', preferenceType: 'PREFERENCE' },
            ],
            interactionType: 'MEET',
          }),
        },
      ],
    };

    mockCreate.mockResolvedValueOnce(mockResponse);

    const result = await extractFromNote('Mike loves Italian food and prefers window seats. He is allergic to shellfish.');

    expect(result.preferences).toHaveLength(3);
    result.preferences?.forEach((p) => {
      expect(p.preferenceType).toBe('PREFERENCE');
    });
  });

  it('classifies NEVER category items as PREFERENCE (never as TOPIC)', async () => {
    const mockResponse = {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            contactName: 'Lisa',
            preferences: [
              { category: 'NEVER', content: 'Hates small talk', preferenceType: 'PREFERENCE' },
              { category: 'NEVER', content: 'Dislikes seafood', preferenceType: 'PREFERENCE' },
            ],
            interactionType: 'CALL',
          }),
        },
      ],
    };

    mockCreate.mockResolvedValueOnce(mockResponse);

    const result = await extractFromNote('Lisa hates small talk and dislikes seafood');

    expect(result.preferences).toHaveLength(2);
    result.preferences?.forEach((p) => {
      expect(p.category).toBe('NEVER');
      expect(p.preferenceType).toBe('PREFERENCE');
    });
  });

  it('extracts mixed TOPIC and PREFERENCE items correctly', async () => {
    const mockResponse = {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            contactName: 'Emma',
            preferences: [
              { category: 'ALWAYS', content: 'photography', preferenceType: 'TOPIC' },
              { category: 'ALWAYS', content: 'Loves Thai food', preferenceType: 'PREFERENCE' },
              { category: 'NEVER', content: 'Allergic to peanuts', preferenceType: 'PREFERENCE' },
            ],
            interactionType: 'MEET',
          }),
        },
      ],
    };

    mockCreate.mockResolvedValueOnce(mockResponse);

    const result = await extractFromNote('Emma is into photography. She loves Thai food but is allergic to peanuts.');

    expect(result.preferences).toHaveLength(3);
    expect(result.preferences?.[0].preferenceType).toBe('TOPIC');
    expect(result.preferences?.[1].preferenceType).toBe('PREFERENCE');
    expect(result.preferences?.[2].preferenceType).toBe('PREFERENCE');
  });
});

describe('generateBriefing', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv('ANTHROPIC_API_KEY', 'test-api-key');
    _resetClient();
  });

  const mockContactData = {
    name: 'Sarah Johnson',
    preferences: [
      { id: '1', category: 'ALWAYS' as const, preferenceType: 'TOPIC' as const, content: 'Loves hiking' },
      { id: '2', category: 'ALWAYS' as const, preferenceType: 'PREFERENCE' as const, content: 'Coffee enthusiast' },
      { id: '3', category: 'NEVER' as const, preferenceType: 'PREFERENCE' as const, content: 'Allergic to shellfish' },
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

describe('extractFromImage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv('ANTHROPIC_API_KEY', 'test-api-key');
    _resetClient();
  });

  const mockImageData = {
    base64: 'base64encodedimagedata',
    mimeType: 'image/jpeg',
  };

  it('extracts contact information from an image', async () => {
    const mockResponse = {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            contactName: 'Sarah',
            interactionSummary: 'Dinner at Italian restaurant',
            interactionType: 'MEET',
            preferences: [
              { category: 'ALWAYS', content: 'Loves Italian food', preferenceType: 'PREFERENCE' },
            ],
          }),
        },
      ],
    };

    mockCreate.mockResolvedValueOnce(mockResponse);

    const result = await extractFromImage(mockImageData);

    expect(result.contactName).toBe('Sarah');
    expect(result.interactionSummary).toBe('Dinner at Italian restaurant');
    expect(result.interactionType).toBe('MEET');
    expect(result.preferences).toHaveLength(1);
  });

  it('includes additional context in the prompt when provided', async () => {
    const mockResponse = {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            contactName: 'Mike',
            interactionSummary: 'Birthday party for his son',
            interactionType: 'MEET',
          }),
        },
      ],
    };

    mockCreate.mockResolvedValueOnce(mockResponse);

    await extractFromImage(mockImageData, 'This is from Mike\'s son\'s birthday party');

    expect(mockCreate).toHaveBeenCalledTimes(1);
    const callArgs = mockCreate.mock.calls[0][0];
    expect(callArgs.messages[0].content).toContainEqual(
      expect.objectContaining({
        type: 'text',
        text: expect.stringContaining('birthday party'),
      })
    );
  });

  it('sends image as base64 content block', async () => {
    const mockResponse = {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            contactName: 'Emma',
            interactionSummary: 'Coffee meetup',
            interactionType: 'MEET',
          }),
        },
      ],
    };

    mockCreate.mockResolvedValueOnce(mockResponse);

    await extractFromImage(mockImageData);

    expect(mockCreate).toHaveBeenCalledTimes(1);
    const callArgs = mockCreate.mock.calls[0][0];
    expect(callArgs.messages[0].content).toContainEqual(
      expect.objectContaining({
        type: 'image',
        source: {
          type: 'base64',
          media_type: 'image/jpeg',
          data: 'base64encodedimagedata',
        },
      })
    );
  });

  it('extracts conversation from screenshot', async () => {
    const mockResponse = {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            contactName: 'John',
            interactionSummary: 'Text conversation about weekend plans',
            interactionType: 'MESSAGE',
            interactionPlatform: 'text',
            seedlings: ['Follow up about hiking plans'],
          }),
        },
      ],
    };

    mockCreate.mockResolvedValueOnce(mockResponse);

    const result = await extractFromImage(
      { base64: 'screenshotdata', mimeType: 'image/png' },
      'Screenshot of our text conversation'
    );

    expect(result.contactName).toBe('John');
    expect(result.interactionType).toBe('MESSAGE');
    expect(result.seedlings).toContain('Follow up about hiking plans');
  });

  it('throws error when no text response from Claude', async () => {
    const mockResponse = {
      content: [],
    };

    mockCreate.mockResolvedValueOnce(mockResponse);

    await expect(extractFromImage(mockImageData)).rejects.toThrow('No text response from Claude');
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

    await expect(extractFromImage(mockImageData)).rejects.toThrow('Failed to parse AI response as JSON');
  });
});
