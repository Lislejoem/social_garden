/**
 * @file Avatar Utilities
 * @description Functions for generating and resolving contact avatars from various sources.
 * Supports Gravatar (email-based) with extensible design for future OAuth integrations.
 */
import { createHash } from 'crypto';
import type { Socials, AvatarSource } from '@/types';

/**
 * Generate a Gravatar URL from an email address.
 * Uses SHA256 hash as per Gravatar's API specification.
 *
 * @param email - The email address to generate Gravatar URL for
 * @returns Gravatar URL with 404 fallback (to detect if no avatar exists)
 */
export function getGravatarUrl(email: string): string {
  const normalizedEmail = email.trim().toLowerCase();
  const hash = createHash('sha256').update(normalizedEmail).digest('hex');
  // Use d=404 to get a 404 response if no Gravatar exists (for detection)
  // Use s=200 for a reasonable default size
  return `https://www.gravatar.com/avatar/${hash}?d=404&s=200`;
}

/**
 * Get the list of avatar sources that have data available for a contact.
 *
 * @param socials - The contact's social media data
 * @returns Array of available avatar sources
 */
export function getAvailableAvatarSources(socials: Socials | null): AvatarSource[] {
  if (!socials) {
    return [];
  }

  const sources: AvatarSource[] = [];

  if (socials.email) {
    sources.push('gravatar');
  }

  if (socials.linkedin) {
    sources.push('linkedin');
  }

  if (socials.instagram) {
    sources.push('instagram');
  }

  return sources;
}

/**
 * Contact data needed to resolve an avatar URL
 */
interface AvatarContactData {
  avatarUrl: string | null;
  avatarSource: AvatarSource | null;
  preferredAvatarSource: AvatarSource | null;
  socials: Socials | null;
}

/**
 * Resolve the avatar URL for a contact based on their avatar source setting.
 *
 * @param contact - Contact data with avatar settings
 * @returns The resolved avatar URL, or null if no avatar available
 */
export function resolveAvatarUrl(contact: AvatarContactData): string | null {
  const { avatarUrl, avatarSource, socials } = contact;

  if (!avatarSource) {
    return null;
  }

  switch (avatarSource) {
    case 'manual':
      return avatarUrl;

    case 'gravatar':
      if (socials?.email) {
        return getGravatarUrl(socials.email);
      }
      return null;

    case 'linkedin':
      // LinkedIn avatar fetching requires OAuth integration (V2 feature)
      // For now, return null - will be implemented when OAuth is added
      return null;

    case 'instagram':
      // Instagram avatar fetching requires OAuth integration (V2 feature)
      // For now, return null - will be implemented when OAuth is added
      return null;

    default:
      return null;
  }
}
