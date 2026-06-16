import { act, render, renderHook, waitFor } from '@testing-library/react-native';
import { Component, type ReactNode } from 'react';

import { ExercisesProvider, useExercises } from '@/store/exercises';
import type { Exercise } from '@/types/exercise';

jest.mock('@/db/exercises', () => ({
  getAllExercises: jest.fn(),
}));

import { getAllExercises } from '@/db/exercises';

const mockGetAllExercises = getAllExercises as jest.Mock;

const existingExercise: Exercise = { id: '1', name: 'Bench press' };

describe('store/exercises', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('starts loading, then populates exercises once getAllExercises resolves', async () => {
    let resolveGetAll!: (exercises: Exercise[]) => void;
    mockGetAllExercises.mockReturnValue(
      new Promise<Exercise[]>((resolve) => {
        resolveGetAll = resolve;
      }),
    );

    const { result } = await renderHook(() => useExercises(), { wrapper: ExercisesProvider });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.exercises).toEqual([]);

    await act(async () => {
      resolveGetAll([existingExercise]);
      await Promise.resolve();
    });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.exercises).toEqual([existingExercise]);
    expect(result.current.error).toBeNull();
  });

  it('sets error when getAllExercises rejects, coercing a non-Error throw', async () => {
    mockGetAllExercises.mockRejectedValue('boom');

    const { result } = await renderHook(() => useExercises(), { wrapper: ExercisesProvider });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toBe('boom');
  });

  it('throws when useExercises is called outside of ExercisesProvider', async () => {
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
      useExercises();
      return null;
    }

    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    await render(
      <ErrorBoundary>
        <Probe />
      </ErrorBoundary>,
    );
    consoleError.mockRestore();

    expect(caught.error?.message).toBe('useExercises must be used within ExercisesProvider');
  });
});
