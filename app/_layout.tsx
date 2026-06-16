import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View } from 'react-native';
import 'react-native-reanimated';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { ExercisesProvider, useExercises } from '@/store/exercises';
import { WorkoutsProvider, useWorkouts } from '@/store/workouts';

export const unstable_settings = {
  anchor: '(tabs)',
};

function AppNavigator() {
  const { isLoading: workoutsLoading } = useWorkouts();
  const { isLoading: exercisesLoading } = useExercises();
  const isLoading = workoutsLoading || exercisesLoading;
  const colorScheme = useColorScheme();

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator />
      </View>
    );
  }

  const bg = Colors[colorScheme ?? 'light'].background;

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <View style={{ flex: 1, backgroundColor: bg }}>
        <Stack screenOptions={{ contentStyle: { backgroundColor: bg } }}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="workout/[id]" />
        </Stack>
      </View>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <WorkoutsProvider>
      <ExercisesProvider>
        <AppNavigator />
      </ExercisesProvider>
    </WorkoutsProvider>
  );
}
