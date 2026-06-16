import { render } from '@testing-library/react-native';

import { IconSymbol } from '@/components/ui/icon-symbol';

jest.mock('@expo/vector-icons/MaterialIcons', () => ({
  __esModule: true,
  default: jest.fn(() => null),
}));

import MaterialIcons from '@expo/vector-icons/MaterialIcons';

const mockMaterialIcons = MaterialIcons as unknown as jest.Mock;

describe('IconSymbol (Android/web fallback)', () => {
  afterEach(() => {
    mockMaterialIcons.mockClear();
  });

  it.each([
    ['house.fill', 'home'],
    ['paperplane.fill', 'send'],
    ['chevron.left.forwardslash.chevron.right', 'code'],
    ['chevron.right', 'chevron-right'],
    ['list.bullet', 'format-list-bulleted'],
    ['plus', 'add'],
    ['dumbbell.fill', 'fitness-center'],
  ] as const)('maps SF Symbol "%s" to MaterialIcons name "%s"', async (sfSymbol, materialName) => {
    await render(<IconSymbol name={sfSymbol} color="#000" />);

    const lastCallProps = mockMaterialIcons.mock.calls.at(-1)?.[0];
    expect(lastCallProps).toMatchObject({ name: materialName });
  });

  it('passes size and color through to MaterialIcons', async () => {
    await render(<IconSymbol name="plus" color="#123456" size={32} />);

    const lastCallProps = mockMaterialIcons.mock.calls.at(-1)?.[0];
    expect(lastCallProps).toMatchObject({ size: 32, color: '#123456' });
  });

  it('defaults size to 24 when not provided', async () => {
    await render(<IconSymbol name="plus" color="#000" />);

    const lastCallProps = mockMaterialIcons.mock.calls.at(-1)?.[0];
    expect(lastCallProps).toMatchObject({ size: 24 });
  });
});
