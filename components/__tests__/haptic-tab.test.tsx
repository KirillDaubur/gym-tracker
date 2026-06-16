import { NavigationContainer } from '@react-navigation/native';
import { fireEvent, render } from '@testing-library/react-native';
import * as Haptics from 'expo-haptics';
import { Text } from 'react-native';

import { HapticTab } from '@/components/haptic-tab';

jest.mock('expo-haptics', () => ({
  ...jest.requireActual('expo-haptics'),
  impactAsync: jest.fn(),
}));

const mockImpactAsync = Haptics.impactAsync as jest.Mock;

describe('HapticTab', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  // babel-preset-expo inlines `process.env.EXPO_OS` to the platform Jest is configured
  // for (always "ios" here), so the `!== 'ios'` branch can't be exercised by toggling
  // the env var at test runtime — only the iOS path is reachable in this Jest setup.
  it('triggers a light haptic on iOS press-in and still calls the original handler', async () => {
    const onPressIn = jest.fn();
    const { getByTestId } = await render(
      <NavigationContainer>
        <HapticTab testID="tab" onPressIn={onPressIn}>
          <Text>Tab</Text>
        </HapticTab>
      </NavigationContainer>,
    );

    await fireEvent(getByTestId('tab'), 'pressIn', {});

    expect(mockImpactAsync).toHaveBeenCalledWith(Haptics.ImpactFeedbackStyle.Light);
    expect(onPressIn).toHaveBeenCalled();
  });
});
