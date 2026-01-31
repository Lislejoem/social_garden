import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import EditableFamilyMember from './EditableFamilyMember';

// Mock useToast
vi.mock('../contexts/ToastContext', () => ({
  useToast: () => ({
    showToast: vi.fn(),
    showError: vi.fn(),
  }),
}));

// Mock useUserSettings
const mockUserSettings = {
  settings: { userName: null as string | null },
  isLoading: false,
  updateUserName: vi.fn(),
};

vi.mock('../contexts/UserSettingsContext', () => ({
  useUserSettings: () => mockUserSettings,
}));

describe('EditableFamilyMember with user settings', () => {
  const defaultProps = {
    member: {
      id: 'fm-1',
      name: 'Sarah',
      relation: 'sister',
    },
    onUpdate: vi.fn(),
    onDelete: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUserSettings.settings.userName = null;
    mockUserSettings.isLoading = false;
  });

  it('shows original format when userName is empty', () => {
    mockUserSettings.settings.userName = null;

    render(<EditableFamilyMember {...defaultProps} />);

    expect(screen.getByText('Sarah')).toBeInTheDocument();
    expect(screen.getByText('sister')).toBeInTheDocument();
  });

  it('shows name with "(You)" when name matches userName exactly', () => {
    mockUserSettings.settings.userName = 'Sarah';

    render(<EditableFamilyMember {...defaultProps} />);

    expect(screen.getByText('Sarah')).toBeInTheDocument();
    expect(screen.getByText('(You)')).toBeInTheDocument();
    expect(screen.getByText('sister')).toBeInTheDocument();
  });

  it('matches case-insensitively ("Joe" = "joe")', () => {
    mockUserSettings.settings.userName = 'SARAH';

    render(<EditableFamilyMember {...defaultProps} />);

    expect(screen.getByText('Sarah')).toBeInTheDocument();
    expect(screen.getByText('(You)')).toBeInTheDocument();
  });

  it('does not partial match ("Joe" ≠ "Joseph")', () => {
    mockUserSettings.settings.userName = 'Sara';

    render(<EditableFamilyMember {...defaultProps} />);

    expect(screen.getByText('Sarah')).toBeInTheDocument();
    expect(screen.getByText('sister')).toBeInTheDocument();
    expect(screen.queryByText('(You)')).not.toBeInTheDocument();
  });

  it('shows original format while settings are loading', () => {
    mockUserSettings.settings.userName = 'Sarah';
    mockUserSettings.isLoading = true;

    render(<EditableFamilyMember {...defaultProps} />);

    // Should show original format, not "Your sister"
    expect(screen.getByText('Sarah')).toBeInTheDocument();
    expect(screen.getByText('sister')).toBeInTheDocument();
  });

  it('handles special characters (O\'Brien)', () => {
    mockUserSettings.settings.userName = "O'Brien";
    const propsWithSpecialChar = {
      ...defaultProps,
      member: { id: 'fm-2', name: "O'Brien", relation: 'uncle' },
    };

    render(<EditableFamilyMember {...propsWithSpecialChar} />);

    expect(screen.getByText("O'Brien")).toBeInTheDocument();
    expect(screen.getByText('(You)')).toBeInTheDocument();
    expect(screen.getByText('uncle')).toBeInTheDocument();
  });

  it('handles whitespace differences', () => {
    mockUserSettings.settings.userName = '  Sarah  ';

    render(<EditableFamilyMember {...defaultProps} />);

    // Should still match after trimming
    expect(screen.getByText('Sarah')).toBeInTheDocument();
    expect(screen.getByText('(You)')).toBeInTheDocument();
  });

  it('shows relation in original case', () => {
    mockUserSettings.settings.userName = 'Sarah';
    const propsWithUpperRelation = {
      ...defaultProps,
      member: { id: 'fm-3', name: 'Sarah', relation: 'SISTER' },
    };

    render(<EditableFamilyMember {...propsWithUpperRelation} />);

    expect(screen.getByText('Sarah')).toBeInTheDocument();
    expect(screen.getByText('(You)')).toBeInTheDocument();
    expect(screen.getByText('SISTER')).toBeInTheDocument();
  });

  it('shows userName when stored name is "User" (AI placeholder)', () => {
    mockUserSettings.settings.userName = 'Joe';
    const propsWithUserPlaceholder = {
      ...defaultProps,
      member: { id: 'fm-4', name: 'User', relation: 'son' },
    };

    render(<EditableFamilyMember {...propsWithUserPlaceholder} />);

    // Should show "Joe (You)" not "User (You)"
    expect(screen.getByText('Joe')).toBeInTheDocument();
    expect(screen.getByText('(You)')).toBeInTheDocument();
    expect(screen.queryByText('User')).not.toBeInTheDocument();
  });

  it('shows "(You)" for "User" even when userName is not set', () => {
    mockUserSettings.settings.userName = null;
    const propsWithUserPlaceholder = {
      ...defaultProps,
      member: { id: 'fm-5', name: 'User', relation: 'brother' },
    };

    render(<EditableFamilyMember {...propsWithUserPlaceholder} />);

    // Should still show (You) but with "User" as the name
    expect(screen.getByText('User')).toBeInTheDocument();
    expect(screen.getByText('(You)')).toBeInTheDocument();
  });

  it('matches "User" case-insensitively', () => {
    mockUserSettings.settings.userName = 'Joe';
    const propsWithLowerUser = {
      ...defaultProps,
      member: { id: 'fm-6', name: 'user', relation: 'father' },
    };

    render(<EditableFamilyMember {...propsWithLowerUser} />);

    expect(screen.getByText('Joe')).toBeInTheDocument();
    expect(screen.getByText('(You)')).toBeInTheDocument();
  });
});
