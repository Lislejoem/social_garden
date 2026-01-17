import type { HealthStatus, Cadence } from '@/lib/health';

export type { HealthStatus, Cadence };

export type Category = 'ALWAYS' | 'NEVER';
export type InteractionType = 'CALL' | 'TEXT' | 'MEET' | 'VOICE';
export type SeedlingStatus = 'ACTIVE' | 'PLANTED';

export interface Socials {
  instagram?: string;
  linkedin?: string;
  email?: string;
  phone?: string;
  address?: string;
}

export interface Preference {
  id: string;
  category: Category;
  content: string;
}

export interface Interaction {
  id: string;
  date: Date;
  type: InteractionType;
  summary: string;
}

export interface Seedling {
  id: string;
  content: string;
  status: SeedlingStatus;
  createdAt: Date;
}

export interface FamilyMember {
  id: string;
  name: string;
  relation: string;
}

export interface Contact {
  id: string;
  name: string;
  avatarUrl: string | null;
  location: string | null;
  birthday: Date | null;
  cadence: Cadence;
  socials: Socials | null;
  createdAt: Date;
  updatedAt: Date;
  preferences: Preference[];
  interactions: Interaction[];
  seedlings: Seedling[];
  familyMembers: FamilyMember[];
}

// Computed contact with health status
export interface ContactWithHealth extends Contact {
  health: HealthStatus;
  lastContactDate: Date | null;
  lastContactFormatted: string;
}

// API response types
export interface IngestRequest {
  rawInput: string;
  contactId?: string; // Optional: if updating existing contact
}

export interface IngestResponse {
  success: boolean;
  contactId: string;
  isNewContact: boolean;
  summary: string;
  updates: {
    preferences?: number;
    familyMembers?: number;
    seedlings?: number;
    interaction?: boolean;
  };
}

// AI extraction result from Claude
export interface AIExtraction {
  contactName: string;
  isNewContact?: boolean;
  location?: string;
  preferences?: Array<{ category: Category; content: string }>;
  familyMembers?: Array<{ name: string; relation: string }>;
  seedlings?: string[];
  interactionSummary?: string;
  interactionType?: InteractionType;
}

// Voice Preview types
export interface IngestPreviewResponse {
  success: boolean;
  preview: true;
  extraction: AIExtraction;
  existingContact?: {
    id: string;
    name: string;
    location: string | null;
  } | null;
  isNewContact: boolean;
}

// Extended IngestRequest with dryRun and overrides
export interface IngestRequestWithOptions extends IngestRequest {
  dryRun?: boolean;
  overrides?: AIExtraction;
}
