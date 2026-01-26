import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import { UserSettingsProvider, useUserSettings } from './UserSettingsContext';

// Test component that uses the context
function TestComponent() {
  const { settings, isLoading, updateUserName } = useUserSettings();
  return (
    <div>
      <div data-testid="loading">{isLoading ? 'loading' : 'loaded'}</div>
      <div data-testid="userName">{settings.userName ?? 'null'}</div>
      <button onClick={() => updateUserName('NewName')}>Update</button>
    </div>
  );
}

describe('UserSettingsContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('provides default settings while loading', async () => {
    // Never resolve the fetch to keep loading state
    (global.fetch as ReturnType<typeof vi.fn>).mockImplementation(() => new Promise(() => {}));

    render(
      <UserSettingsProvider>
        <TestComponent />
      </UserSettingsProvider>
    );

    expect(screen.getByTestId('loading')).toHaveTextContent('loading');
    expect(screen.getByTestId('userName')).toHaveTextContent('null');
  });

  it('fetches settings on mount', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ userName: 'Joe' }),
    });

    render(
      <UserSettingsProvider>
        <TestComponent />
      </UserSettingsProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('loaded');
    });

    expect(screen.getByTestId('userName')).toHaveTextContent('Joe');
    expect(global.fetch).toHaveBeenCalledWith('/api/settings');
  });

  it('updates settings via API', async () => {
    // Initial fetch
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ userName: 'Joe' }),
    });

    render(
      <UserSettingsProvider>
        <TestComponent />
      </UserSettingsProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('loaded');
    });

    // Mock the PUT request
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ userName: 'NewName' }),
    });

    await act(async () => {
      screen.getByRole('button', { name: /update/i }).click();
    });

    await waitFor(() => {
      expect(screen.getByTestId('userName')).toHaveTextContent('NewName');
    });

    expect(global.fetch).toHaveBeenLastCalledWith('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userName: 'NewName' }),
    });
  });

  it('handles API errors gracefully on fetch', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error('Network error'));

    render(
      <UserSettingsProvider>
        <TestComponent />
      </UserSettingsProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('loaded');
    });

    // Should still show default settings
    expect(screen.getByTestId('userName')).toHaveTextContent('null');
  });

  it('handles non-ok response gracefully on fetch', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ error: 'Server error' }),
    });

    render(
      <UserSettingsProvider>
        <TestComponent />
      </UserSettingsProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('loaded');
    });

    // Should still show default settings
    expect(screen.getByTestId('userName')).toHaveTextContent('null');
  });

  it('throws error when useUserSettings is used outside provider', () => {
    // Suppress console.error for this test
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      render(<TestComponent />);
    }).toThrow('useUserSettings must be used within a UserSettingsProvider');

    consoleSpy.mockRestore();
  });
});
