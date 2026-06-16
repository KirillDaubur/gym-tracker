import { act, render, renderHook, waitFor } from '@testing-library/react-native';
import { Component, type ReactNode } from 'react';

import { useWorkouts, WorkoutsProvider } from '@/store/workouts';
import type { Workout } from '@/types/workout';

jest.mock('@/db/workouts', () => ({
  getAllWorkouts: jest.fn(),
  insertWorkout: jest.fn(),
  deleteWorkout: jest.fn(),
}));

import { deleteWorkout, getAllWorkouts, insertWorkout } from '@/db/workouts';

const mockGetAllWorkouts = getAllWorkouts as jest.Mock;
const mockInsertWorkout = insertWorkout as jest.Mock;
const mockDeleteWorkout = deleteWorkout as jest.Mock;

const existingWorkout: Workout = { id: '1', date: '2024-01-01T00:00:00.000Z', name: 'Leg day' };

describe('store/workouts', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('starts loading, then populates workouts once getAllWorkouts resolves', async () => {
    let resolveGetAll!: (workouts: Workout[]) => void;
    mockGetAllWorkouts.mockReturnValue(
      new Promise<Workout[]>((resolve) => {
        resolveGetAll = resolve;
      }),
    );

    const { result } = await renderHook(() => useWorkouts(), { wrapper: WorkoutsProvider });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.workouts).toEqual([]);

    await act(async () => {
      resolveGetAll([existingWorkout]);
      await Promise.resolve();
    });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.workouts).toEqual([existingWorkout]);
    expect(result.current.error).toBeNull();
  });

  it('sets error when getAllWorkouts rejects, coercing a non-Error throw', async () => {
    mockGetAllWorkouts.mockRejectedValue('boom');

    const { result } = await renderHook(() => useWorkouts(), { wrapper: WorkoutsProvider });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toBe('boom');
  });

  it('adds a workout optimistically, before insertWorkout resolves', async () => {
    mockGetAllWorkouts.mockResolvedValue([]);
    let resolveInsert!: () => void;
    mockInsertWorkout.mockReturnValue(
      new Promise<void>((resolve) => {
        resolveInsert = resolve;
      }),
    );

    const { result } = await renderHook(() => useWorkouts(), { wrapper: WorkoutsProvider });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    let addPromise!: Promise<Workout>;
    await act(() => {
      addPromise = result.current.addWorkout('Push day');
    });

    expect(result.current.workouts).toHaveLength(1);
    expect(result.current.workouts[0]).toMatchObject({ name: 'Push day' });

    await act(async () => {
      resolveInsert();
      await addPromise;
    });
  });

  it('rolls back the optimistic add and rethrows when insertWorkout rejects', async () => {
    mockGetAllWorkouts.mockResolvedValue([]);
    mockInsertWorkout.mockRejectedValue(new Error('insert failed'));

    const { result } = await renderHook(() => useWorkouts(), { wrapper: WorkoutsProvider });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    let assertion!: Promise<void>;
    await act(() => {
      const addPromise = result.current.addWorkout('Push day');
      assertion = expect(addPromise).rejects.toThrow('insert failed');
    });

    await waitFor(() => expect(result.current.workouts).toHaveLength(0));
    await assertion;
  });

  it('removes a workout optimistically, before deleteWorkout resolves', async () => {
    mockGetAllWorkouts.mockResolvedValue([existingWorkout]);
    mockDeleteWorkout.mockResolvedValue(undefined);

    const { result } = await renderHook(() => useWorkouts(), { wrapper: WorkoutsProvider });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    let removePromise!: Promise<void>;
    await act(() => {
      removePromise = result.current.removeWorkout('1');
    });

    expect(result.current.workouts).toEqual([]);

    await act(async () => {
      await removePromise;
    });
  });

  it('rolls back to the reloaded list and rethrows when deleteWorkout rejects', async () => {
    mockGetAllWorkouts.mockResolvedValue([existingWorkout]);
    mockDeleteWorkout.mockRejectedValue(new Error('delete failed'));

    const { result } = await renderHook(() => useWorkouts(), { wrapper: WorkoutsProvider });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    let assertion!: Promise<void>;
    await act(() => {
      const removePromise = result.current.removeWorkout('1');
      assertion = expect(removePromise).rejects.toThrow('delete failed');
    });

    await waitFor(() => expect(result.current.workouts).toEqual([existingWorkout]));
    await assertion;
  });

  it('throws when useWorkouts is called outside of WorkoutsProvider', async () => {
    const caught: { error: Error | null } = { error: null };

    class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
      state = { hasError: false };
      static getDerivedStateFromError(error: Error) {
        caught.error = error;
        return { hasError: true };
      }
      render() {
        return this.state.hasError ? null : this.props.children;
      }
    }

    function Probe() {
      useWorkouts();
      return null;
    }

    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    await render(
      <ErrorBoundary>
        <Probe />
      </ErrorBoundary>,
    );
    consoleError.mockRestore();

    expect(caught.error?.message).toBe('useWorkouts must be used within WorkoutsProvider');
  });
});
