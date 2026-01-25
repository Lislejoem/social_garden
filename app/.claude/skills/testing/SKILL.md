# Testing Skill

Use when writing or debugging tests, mocking dependencies, or understanding test patterns.

## Framework

- **Test Runner:** Vitest
- **UI Testing:** React Testing Library
- **File Pattern:** `*.test.ts(x)`

## Commands

```bash
npm test             # Watch mode
npm run test:run     # Single run
```

## Mocking Anthropic SDK

The Anthropic client is a singleton that validates the API key on first use. Tests must:

1. Use `vi.hoisted()` for the mock create function
2. Stub the environment variable in `beforeEach`
3. Reset the singleton between tests

```typescript
import { vi, describe, it, expect, beforeEach } from 'vitest';

// 1. Hoist the mock function
const mockCreate = vi.hoisted(() => vi.fn());

// 2. Mock the module
vi.mock('@anthropic-ai/sdk', () => ({
  default: vi.fn().mockImplementation(() => ({
    messages: { create: mockCreate },
  })),
}));

// 3. Import after mocking
import { someFunction, _resetClient } from './your-module';

describe('your test', () => {
  beforeEach(() => {
    // Stub API key
    vi.stubEnv('ANTHROPIC_API_KEY', 'test-api-key');
    // Reset singleton
    _resetClient();
    // Clear mock calls
    mockCreate.mockClear();
  });

  it('calls Claude API', async () => {
    mockCreate.mockResolvedValueOnce({
      content: [{ type: 'text', text: '{"result": "test"}' }],
    });

    const result = await someFunction();

    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        model: expect.any(String),
        messages: expect.any(Array),
      })
    );
  });
});
```

## Testing React Components

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { YourComponent } from './YourComponent';

it('renders and handles interaction', () => {
  render(<YourComponent />);

  expect(screen.getByText('Expected Text')).toBeInTheDocument();

  fireEvent.click(screen.getByRole('button', { name: /submit/i }));

  expect(screen.getByText('Success')).toBeInTheDocument();
});
```

## Testing API Routes

```typescript
import { POST } from './route';
import { NextRequest } from 'next/server';

it('handles POST request', async () => {
  const request = new NextRequest('http://localhost/api/endpoint', {
    method: 'POST',
    body: JSON.stringify({ data: 'test' }),
  });

  const response = await POST(request);
  const json = await response.json();

  expect(response.status).toBe(200);
  expect(json).toEqual({ success: true });
});
```
