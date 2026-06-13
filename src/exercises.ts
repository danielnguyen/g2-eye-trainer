import type { ExerciseDefinition, TargetFrame } from './types';

export const EXERCISES: ExerciseDefinition[] = [
  {
    mode: 'steady',
    label: 'Steady Dot',
    durationMs: 20_000,
    description: 'Hold the center dot single and comfortable.'
  },
  {
    mode: 'horizontal',
    label: 'Horizontal Tracking',
    durationMs: 30_000,
    description: 'Follow the dot slowly left and right.'
  },
  {
    mode: 'vertical',
    label: 'Vertical Tracking',
    durationMs: 30_000,
    description: 'Follow the dot slowly up and down.'
  },
  {
    mode: 'jump',
    label: 'Jump Focus',
    durationMs: 30_000,
    description: 'Reacquire the dot after each jump.'
  }
];

const TWO_PI = Math.PI * 2;

export function targetFrameFor(exercise: ExerciseDefinition, elapsedMs: number): TargetFrame {
  const clampedElapsed = Math.max(0, elapsedMs);

  if (exercise.mode === 'horizontal') {
    const phase = (clampedElapsed % 8000) / 8000;
    return {
      x: Math.sin(phase * TWO_PI) * 0.34,
      y: 0,
      pulse: false
    };
  }

  if (exercise.mode === 'vertical') {
    const phase = (clampedElapsed % 8000) / 8000;
    return {
      x: 0,
      y: Math.sin(phase * TWO_PI) * 0.26,
      pulse: false
    };
  }

  if (exercise.mode === 'jump') {
    const positions = [
      { x: 0, y: 0 },
      { x: -0.32, y: 0 },
      { x: 0.32, y: 0 },
      { x: 0, y: -0.24 },
      { x: 0, y: 0.24 }
    ];
    const index = Math.floor(clampedElapsed / 2000) % positions.length;
    return {
      ...positions[index],
      pulse: clampedElapsed % 2000 < 180
    };
  }

  return {
    x: 0,
    y: 0,
    pulse: clampedElapsed % 5000 < 350
  };
}

export function totalSessionDurationMs(): number {
  return EXERCISES.reduce((total, exercise) => total + exercise.durationMs, 0);
}
