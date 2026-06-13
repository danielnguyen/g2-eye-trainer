import { EXERCISES } from './exercises';
import type { AppState } from './types';

export function initialState(): AppState {
  return {
    screen: 'home',
    selectedModeIndex: 0,
    running: false,
    startedAtMs: null,
    elapsedMs: 0,
    sessionModeIndex: null,
    lastInputSummary: null
  };
}

export function moveSelection(state: AppState, delta: number): AppState {
  if (state.running) return state;

  const nextIndex = wrapIndex(state.selectedModeIndex + delta);
  return {
    ...state,
    screen: 'home',
    selectedModeIndex: nextIndex,
    elapsedMs: 0,
    sessionModeIndex: null
  };
}

export function toggleRun(state: AppState, nowMs: number): AppState {
  if (state.screen === 'done') {
    return startSingle(initialState(), nowMs);
  }

  if (!state.running) {
    return {
      ...state,
      screen: 'exercise',
      running: true,
      startedAtMs: nowMs - state.elapsedMs
    };
  }

  return {
    ...state,
    running: false,
    elapsedMs: elapsedFor(state, nowMs),
    startedAtMs: null
  };
}

export function startSingle(state: AppState, nowMs: number): AppState {
  return {
    ...state,
    screen: 'exercise',
    running: true,
    startedAtMs: nowMs,
    elapsedMs: 0,
    sessionModeIndex: null
  };
}

export function startGuidedSession(nowMs: number): AppState {
  return {
    ...initialState(),
    screen: 'exercise',
    selectedModeIndex: 0,
    running: true,
    startedAtMs: nowMs,
    elapsedMs: 0,
    sessionModeIndex: 0
  };
}

export function tick(state: AppState, nowMs: number): AppState {
  if (!state.running || state.startedAtMs === null) return state;

  const elapsedMs = elapsedFor(state, nowMs);
  const selectedExercise = EXERCISES[state.selectedModeIndex];

  if (!selectedExercise) return initialState();

  if (elapsedMs < selectedExercise.durationMs) {
    return {
      ...state,
      elapsedMs
    };
  }

  if (state.sessionModeIndex === null) {
    return {
      ...state,
      screen: 'done',
      running: false,
      startedAtMs: null,
      elapsedMs: selectedExercise.durationMs
    };
  }

  const nextSessionIndex = state.sessionModeIndex + 1;
  if (nextSessionIndex >= EXERCISES.length) {
    return {
      ...state,
      screen: 'done',
      running: false,
      startedAtMs: null,
      elapsedMs: selectedExercise.durationMs
    };
  }

  return {
    ...state,
    selectedModeIndex: nextSessionIndex,
    sessionModeIndex: nextSessionIndex,
    startedAtMs: nowMs,
    elapsedMs: 0
  };
}

export function resetHome(state: AppState): AppState {
  return {
    ...initialState(),
    selectedModeIndex: state.selectedModeIndex,
    lastInputSummary: state.lastInputSummary
  };
}

export function withInputSummary(state: AppState, summary: string | null): AppState {
  return {
    ...state,
    lastInputSummary: summary
  };
}

function elapsedFor(state: AppState, nowMs: number): number {
  if (state.startedAtMs === null) return state.elapsedMs;
  return Math.max(0, nowMs - state.startedAtMs);
}

function wrapIndex(index: number): number {
  const count = EXERCISES.length;
  return ((index % count) + count) % count;
}
