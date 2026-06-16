import { render } from '@testing-library/react-native';
import * as ReactNative from 'react-native';

import { useColorScheme } from '@/hooks/use-color-scheme.web';

const mockUseRNColorScheme = jest.spyOn(ReactNative, 'useColorScheme');

function Probe({ onRender }: { onRender: (value: ReturnType<typeof useColorScheme>) => void }) {
  onRender(useColorScheme());
  return null;
}

describe('useColorScheme (web)', () => {
  it('returns light on the first render, then the real scheme once hydrated', async () => {
    mockUseRNColorScheme.mockReturnValue('dark');
    const renders: ReturnType<typeof useColorScheme>[] = [];

    await render(<Probe onRender={(value) => renders.push(value)} />);

    expect(renders[0]).toBe('light');
    expect(renders[renders.length - 1]).toBe('dark');
  });

  it('passes through a null system scheme once hydrated, without defaulting', async () => {
    mockUseRNColorScheme.mockReturnValue(null);
    const renders: ReturnType<typeof useColorScheme>[] = [];

    await render(<Probe onRender={(value) => renders.push(value)} />);

    expect(renders[renders.length - 1]).toBeNull();
  });
});
