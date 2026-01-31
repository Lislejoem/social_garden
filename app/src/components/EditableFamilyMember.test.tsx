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
});
