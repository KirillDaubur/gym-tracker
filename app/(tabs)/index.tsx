import { useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { Colors, Fonts } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useWorkouts } from '@/store/workouts';
import type { Workout } from '@/types/workout';

const MENU_WIDTH = 140;
const SCREEN_WIDTH = Dimensions.get('window').width;

type MenuState = { id: string; top: number; right: number } | null;

function formatDate(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });
}

function WorkoutRow({
  workout,
  onOpenMenu,
  onPress,
  scheme,
}: {
  workout: Workout;
  onOpenMenu: (id: string, top: number, right: number) => void;
  onPress: () => void;
  scheme: 'light' | 'dark';
}) {
  // collapsable={false} prevents Android from flattening this view,
  // which is required for measure() to return real screen coordinates
  // on the New Architecture.
  const moreRef = useRef<View>(null);

  function handleMorePress() {
    moreRef.current?.measure((_x, _y, width, height, pageX, pageY) => {
      onOpenMenu(workout.id, pageY + height + 4, SCREEN_WIDTH - pageX - width);
    });
  }

  return (
    <View style={[styles.row, { borderBottomColor: Colors[scheme].icon + '33' }]}>
      <View style={styles.rowContent}>
        <Pressable style={styles.rowPressable} onPress={onPress} android_ripple={{ color: Colors[scheme].icon + '22' }}>
          <ThemedText type="defaultSemiBold">{workout.name ?? 'Workout'}</ThemedText>
          <ThemedText style={styles.date}>{formatDate(workout.date)}</ThemedText>
        </Pressable>
        <View ref={moreRef} collapsable={false}>
          <Pressable onPress={handleMorePress} hitSlop={8} style={styles.moreButton}>
            <Ionicons name="ellipsis-vertical" size={18} color={Colors[scheme].icon} />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

function NewWorkoutSheet({
  visible,
  scheme,
  onClose,
  onCreate,
}: {
  visible: boolean;
  scheme: 'light' | 'dark';
  onClose: () => void;
  onCreate: (name: string) => void;
}) {
  const [name, setName] = useState('');
  const inputRef = useRef<TextInput>(null);
  const canCreate = name.trim().length > 0;

  function handleCreate() {
    if (!canCreate) return;
    onCreate(name.trim());
    setName('');
  }

  function handleClose() {
    setName('');
    onClose();
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleClose}
      // onShow fires after the Modal is visible but Android's window manager needs
      // one more event-loop cycle to hand window focus to the Dialog — setTimeout
      // defers past that handoff so showSoftInput() is honoured.
      onShow={() => setTimeout(() => inputRef.current?.focus(), 100)}
    >
      <KeyboardAvoidingView
        style={styles.sheetOverlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={handleClose} />
        <View style={[styles.sheet, { backgroundColor: Colors[scheme].card }]}>
          <View style={styles.sheetHandle} />

          <ThemedText type="defaultSemiBold" style={styles.sheetTitle}>
            New Workout
          </ThemedText>

          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: Colors[scheme].background,
                color: Colors[scheme].text,
                borderColor: Colors[scheme].icon + '55',
              },
            ]}
            placeholder="Workout name"
            placeholderTextColor={Colors[scheme].icon}
            ref={inputRef}
            value={name}
            onChangeText={setName}
            returnKeyType="done"
            onSubmitEditing={handleCreate}
            maxLength={80}
          />

          <View style={styles.sheetActions}>
            <Pressable
              style={[styles.actionButton, styles.cancelButton, { borderColor: Colors[scheme].icon + '55' }]}
              onPress={handleClose}
            >
              <ThemedText style={styles.cancelText}>Cancel</ThemedText>
            </Pressable>
            <Pressable
              style={[
                styles.actionButton,
                styles.createButton,
                { backgroundColor: Colors[scheme].tint, opacity: canCreate ? 1 : 0.4 },
              ]}
              onPress={handleCreate}
              disabled={!canCreate}
              android_ripple={{ color: '#ffffff33' }}
            >
              <ThemedText style={[styles.createText, { color: Colors[scheme].buttonText }]}>
                Create
              </ThemedText>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

export default function WorkoutsScreen() {
  const { workouts, addWorkout, removeWorkout } = useWorkouts();
  const scheme = useColorScheme() ?? 'light';
  const router = useRouter();
  const [menu, setMenu] = useState<MenuState>(null);
  const [sheetVisible, setSheetVisible] = useState(false);

  function closeMenu() {
    setMenu(null);
  }

  function handleDelete() {
    if (menu) {
      removeWorkout(menu.id);
      closeMenu();
    }
  }

  async function handleCreate(name: string) {
    setSheetVisible(false);
    await addWorkout(name);
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: Colors[scheme].background }]}>
      <ThemedText type="title" style={styles.heading}>Workouts</ThemedText>

      {workouts.length === 0 ? (
        <View style={styles.empty}>
          <ThemedText style={{ color: Colors[scheme].icon }}>No workouts yet.</ThemedText>
        </View>
      ) : (
        <FlatList
          data={workouts}
          keyExtractor={(w) => w.id}
          renderItem={({ item }) => (
            <WorkoutRow
              workout={item}
              onOpenMenu={(id, top, right) => setMenu({ id, top, right })}
              onPress={() => router.push(`/workout/${item.id}`)}
              scheme={scheme}
            />
          )}
          contentContainerStyle={styles.list}
        />
      )}

      <Pressable
        style={[styles.button, { backgroundColor: Colors[scheme].tint }]}
        onPress={() => setSheetVisible(true)}
        android_ripple={{ color: '#ffffff33' }}
      >
        <ThemedText style={[styles.buttonText, { color: Colors[scheme].buttonText }]}>
          + New Workout
        </ThemedText>
      </Pressable>

      {menu && (
        <Modal transparent animationType="none" onRequestClose={closeMenu}>
          <Pressable style={StyleSheet.absoluteFill} onPress={closeMenu} />
          <View
            style={[
              styles.menuCard,
              {
                backgroundColor: Colors[scheme].card,
                top: menu.top,
                right: menu.right,
                shadowColor: scheme === 'dark' ? '#000' : '#333',
              },
            ]}
          >
            <Pressable
              style={({ pressed }) => [styles.menuItem, pressed && styles.menuItemPressed]}
              onPress={handleDelete}
            >
              <Ionicons name="trash-outline" size={16} color="#e53935" style={styles.menuItemIcon} />
              <ThemedText style={styles.menuItemDelete}>Delete</ThemedText>
            </Pressable>
          </View>
        </Modal>
      )}

      <NewWorkoutSheet
        visible={sheetVisible}
        scheme={scheme}
        onClose={() => setSheetVisible(false)}
        onCreate={handleCreate}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  heading: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
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
  },
  rowContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  date: {
    fontSize: 13,
    marginTop: 2,
    opacity: 0.6,
  },
  rowPressable: {
    flex: 1,
    paddingVertical: 14,
  },
  moreButton: {
    padding: 4,
  },
  button: {
    margin: 20,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    fontWeight: '700',
    fontSize: 16,
  },
  menuCard: {
    position: 'absolute',
    width: MENU_WIDTH,
    borderRadius: 8,
    overflow: 'hidden',
    elevation: 6,
    shadowOpacity: 0.18,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    paddingHorizontal: 14,
  },
  menuItemPressed: {
    opacity: 0.6,
  },
  menuItemIcon: {
    marginRight: 8,
  },
  menuItemDelete: {
    color: '#e53935',
    fontSize: 15,
  },
  // Sheet styles
  sheetOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 24,
    paddingBottom: 40,
    paddingTop: 12,
    elevation: 16,
    shadowOpacity: 0.2,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: -4 },
  },
  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#ccc',
    alignSelf: 'center',
    marginBottom: 20,
  },
  sheetTitle: {
    fontSize: 18,
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: Fonts?.sans,
    marginBottom: 20,
  },
  sheetActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButton: {
    borderWidth: 1,
  },
  createButton: {},
  cancelText: {
    fontWeight: '600',
    fontSize: 15,
  },
  createText: {
    fontWeight: '700',
    fontSize: 15,
  },
});
