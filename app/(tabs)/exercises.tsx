import { Tabs } from 'expo-router';
import { FlatList, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useExercises } from '@/store/exercises';
import type { Exercise } from '@/types/exercise';

function ExerciseRow({ exercise, scheme }: { exercise: Exercise; scheme: 'light' | 'dark' }) {
  return (
    <View style={[styles.row, { borderBottomColor: Colors[scheme].icon + '33' }]}>
      <ThemedText type="defaultSemiBold">{exercise.name}</ThemedText>
    </View>
  );
}

export default function ExercisesScreen() {
  const { exercises } = useExercises();
  const scheme = useColorScheme() ?? 'light';

  return (
    <SafeAreaView
      edges={['bottom', 'left', 'right']}
      style={[styles.container, { backgroundColor: Colors[scheme].background }]}
    >
      <Tabs.Screen options={{ headerShown: true, title: 'Exercises' }} />

      {exercises.length === 0 ? (
        <View style={styles.empty}>
          <ThemedText style={{ color: Colors[scheme].icon }}>No exercises yet.</ThemedText>
        </View>
      ) : (
        <FlatList
          data={exercises}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <ExerciseRow exercise={item} scheme={scheme} />}
          contentContainerStyle={styles.list}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: {
    paddingHorizontal: 20,
  },
  row: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingVertical: 14,
  },
});
