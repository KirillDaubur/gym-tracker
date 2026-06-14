import { View } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useWorkouts } from '@/store/workouts';

export default function WorkoutScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { workouts } = useWorkouts();
  const scheme = useColorScheme() ?? 'light';

  const workout = workouts.find((w) => w.id === id);
  const name = workout?.name ?? 'Workout';

  return (
    <>
      <Stack.Screen options={{ title: name }} />
      <View style={{ flex: 1, backgroundColor: Colors[scheme].background }} />
    </>
  );
}
