import { EXERCISES, targetFrameFor, totalSessionDurationMs } from './exercises';
import type { AppState } from './types';
import { APP_VERSION } from './version';

export function render(root: HTMLElement, state: AppState): void {
  const selected = EXERCISES[state.selectedModeIndex] ?? EXERCISES[0];
  const target = targetFrameFor(selected, state.elapsedMs);
  const progress = Math.min(1, state.elapsedMs / selected.durationMs);
  const sessionLabel = state.sessionModeIndex === null ? 'Single exercise' : `Guided ${state.sessionModeIndex + 1}/${EXERCISES.length}`;
  const secondsLeft = Math.max(0, Math.ceil((selected.durationMs - state.elapsedMs) / 1000));

  root.innerHTML = `
    <main class="shell">
      <section class="panel">
        <div class="eyebrow">${APP_VERSION}</div>
        <h1>${state.screen === 'done' ? 'Done' : selected.label}</h1>
        <p>${state.screen === 'done' ? 'Rest your eyes.' : selected.description}</p>
        <p class="safety">Stop if you feel pain, nausea, headache, or worsening double vision.</p>
        <div class="viewport" aria-label="visual target preview">
          ${state.screen === 'done' ? '<div class="done-text">Done</div>' : `<div class="dot ${target.pulse ? 'pulse' : ''}" style="--x: ${target.x}; --y: ${target.y}"></div>`}
        </div>
        <div class="progress"><div style="width: ${Math.round(progress * 100)}%"></div></div>
        <div class="meta">
          <span>${state.running ? 'Running' : state.screen === 'done' ? 'Complete' : 'Idle'}</span>
          <span>${secondsLeft}s</span>
          <span>${sessionLabel}</span>
        </div>
        <div class="controls">
          <button data-action="start">${state.running ? 'Pause' : state.elapsedMs > 0 ? 'Resume' : 'Start guided session'}</button>
          <button data-action="single">Start selected only</button>
          <button data-action="reset">Reset</button>
        </div>
        <div class="modes">
          ${EXERCISES.map(
            (exercise, index) => `<button class="mode ${index === state.selectedModeIndex ? 'selected' : ''}" data-mode-index="${index}">${exercise.label}</button>`
          ).join('')}
        </div>
        <p class="debug">Last input: ${state.lastInputSummary ?? 'none'} · Full guided session: ${Math.round(totalSessionDurationMs() / 1000)}s</p>
      </section>
    </main>
  `;
}
