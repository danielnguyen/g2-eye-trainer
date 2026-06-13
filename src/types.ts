export type ExerciseMode = 'steady' | 'horizontal' | 'vertical' | 'jump';

export type Screen = 'home' | 'exercise' | 'done';

export type AppState = {
  screen: Screen;
  selectedModeIndex: number;
  running: boolean;
  startedAtMs: number | null;
  elapsedMs: number;
  sessionModeIndex: number | null;
  lastInputSummary: string | null;
};

export type ExerciseDefinition = {
  mode: ExerciseMode;
  label: string;
  durationMs: number;
  description: string;
};

export type TargetFrame = {
  x: number;
  y: number;
  pulse: boolean;
};

export type InputEventName = 'press' | 'doublePress' | 'up' | 'down';
