import { describe, it, expect } from 'vitest';
import { getGravatarUrl, getAvailableAvatarSources, resolveAvatarUrl } from './avatar';
import type { Socials, AvatarSource } from '@/types';

describe('getGravatarUrl', () => {
  it('generates correct Gravatar URL for an email', () => {
    // Known SHA256 hash for "test@example.com"
    const url = getGravatarUrl('test@example.com');
    expect(url).toContain('https://www.gravatar.com/avatar/');
    expect(url).toContain('?d=404'); // Use 404 fallback to detect no avatar
    expect(url).toContain('&s=200'); // Size 200px
  });

  it('normalizes email to lowercase', () => {
    const url1 = getGravatarUrl('TEST@EXAMPLE.COM');
    const url2 = getGravatarUrl('test@example.com');
    expect(url1).toBe(url2);
  });

  it('trims whitespace from email', () => {
    const url1 = getGravatarUrl('  test@example.com  ');
    const url2 = getGravatarUrl('test@example.com');
    expect(url1).toBe(url2);
  });
});

describe('getAvailableAvatarSources', () => {
  it('returns empty array when no socials', () => {
    const sources = getAvailableAvatarSources(null);
    expect(sources).toEqual([]);
  });

  it('returns gravatar when email is available', () => {
    const socials: Socials = { email: 'test@example.com' };
    const sources = getAvailableAvatarSources(socials);
    expect(sources).toContain('gravatar');
  });

  it('returns linkedin when linkedin URL is available', () => {
    const socials: Socials = { linkedin: 'https://linkedin.com/in/johndoe' };
    const sources = getAvailableAvatarSources(socials);
    expect(sources).toContain('linkedin');
  });

  it('returns instagram when instagram username is available', () => {
    const socials: Socials = { instagram: '@johndoe' };
    const sources = getAvailableAvatarSources(socials);
    expect(sources).toContain('instagram');
  });

  it('returns multiple sources when multiple socials available', () => {
    const socials: Socials = {
      email: 'test@example.com',
      linkedin: 'https://linkedin.com/in/johndoe',
      instagram: '@johndoe',
    };
    const sources = getAvailableAvatarSources(socials);
    expect(sources).toContain('gravatar');
    expect(sources).toContain('linkedin');
    expect(sources).toContain('instagram');
    expect(sources.length).toBe(3);
  });

  it('does not include sources without data', () => {
    const socials: Socials = { phone: '123-456-7890' };
    const sources = getAvailableAvatarSources(socials);
    expect(sources).toEqual([]);
  });
});

describe('resolveAvatarUrl', () => {
  const baseContact = {
    avatarUrl: null as string | null,
    avatarSource: null as AvatarSource | null,
    preferredAvatarSource: null as AvatarSource | null,
    socials: null as Socials | null,
  };

  it('returns manual avatarUrl when source is manual', () => {
    const contact = {
      ...baseContact,
      avatarUrl: 'https://example.com/photo.jpg',
      avatarSource: 'manual' as AvatarSource,
    };
    const url = resolveAvatarUrl(contact);
    expect(url).toBe('https://example.com/photo.jpg');
  });

  it('returns Gravatar URL when source is gravatar and email exists', () => {
    const contact = {
      ...baseContact,
      avatarSource: 'gravatar' as AvatarSource,
      socials: { email: 'test@example.com' },
    };
    const url = resolveAvatarUrl(contact);
    expect(url).toContain('https://www.gravatar.com/avatar/');
  });

  it('returns null when source is gravatar but no email', () => {
    const contact = {
      ...baseContact,
      avatarSource: 'gravatar' as AvatarSource,
      socials: { phone: '123-456-7890' },
    };
    const url = resolveAvatarUrl(contact);
    expect(url).toBeNull();
  });

  it('returns null when no avatar source set', () => {
    const contact = { ...baseContact };
    const url = resolveAvatarUrl(contact);
    expect(url).toBeNull();
  });

  it('returns null for linkedin source (not yet implemented)', () => {
    const contact = {
      ...baseContact,
      avatarSource: 'linkedin' as AvatarSource,
      socials: { linkedin: 'https://linkedin.com/in/johndoe' },
    };
    const url = resolveAvatarUrl(contact);
    // LinkedIn avatar fetching not implemented yet
    expect(url).toBeNull();
  });

  it('returns null for instagram source (not yet implemented)', () => {
    const contact = {
      ...baseContact,
      avatarSource: 'instagram' as AvatarSource,
      socials: { instagram: '@johndoe' },
    };
    const url = resolveAvatarUrl(contact);
    // Instagram avatar fetching not implemented yet
    expect(url).toBeNull();
  });
});
