import { renderHook } from '@testing-library/react-native';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { useThemeColor } from '@/hooks/use-theme-color';

jest.mock('@/hooks/use-color-scheme');

const mockUseColorScheme = useColorScheme as jest.Mock;

describe('useThemeColor', () => {
  it('returns the prop color for the current theme when provided', async () => {
    mockUseColorScheme.mockReturnValue('dark');
    const { result } = await renderHook(() =>
      useThemeColor({ light: '#fff', dark: '#000' }, 'background'),
    );
    expect(result.current).toBe('#000');
  });

  it('falls back to the theme constant when no prop color is provided', async () => {
    mockUseColorScheme.mockReturnValue('light');
    const { result } = await renderHook(() => useThemeColor({}, 'text'));
    expect(result.current).toBe('#11181C');
  });

  it('defaults to light theme when the color scheme is null', async () => {
    mockUseColorScheme.mockReturnValue(null);
    const { result } = await renderHook(() => useThemeColor({}, 'tint'));
    expect(result.current).toBe('#0a7ea4');
  });
});
