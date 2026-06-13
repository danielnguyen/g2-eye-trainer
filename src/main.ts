import { createEvenDisplay, type EvenDisplay } from './evenDisplay';
import { bindEvenInput, type NormalizedEvenInputEvent } from './evenInput';
import { bindKeyboardInput } from './input';
import { render } from './renderer';
import { initialState, moveSelection, resetHome, startGuidedSession, startSingle, tick, toggleRun, withInputSummary } from './state';
import type { AppState, InputEventName } from './types';
import './style.css';

const root = document.querySelector<HTMLDivElement>('#app');

if (!root) {
  throw new Error('Missing app root element');
}

let state: AppState = initialState();
let evenDisplay: EvenDisplay | null = null;
let animationFrame: number | null = null;

function commit(nextState: AppState): void {
  state = nextState;
  render(root, state);
  bindPhoneControls();

  if (evenDisplay) {
    evenDisplay.render(state).catch(() => undefined);
  }
}

function bindPhoneControls(): void {
  root.querySelectorAll<HTMLButtonElement>('[data-action]').forEach((button) => {
    button.addEventListener('click', () => {
      const action = button.dataset.action;
      const nowMs = performance.now();

      if (action === 'start') {
        if (state.screen === 'home' && state.elapsedMs === 0) {
          commit(startGuidedSession(nowMs));
          return;
        }

        commit(toggleRun(state, nowMs));
        return;
      }

      if (action === 'single') commit(startSingle(state, nowMs));
      if (action === 'reset') commit(resetHome(state));
    });
  });

  root.querySelectorAll<HTMLButtonElement>('[data-mode-index]').forEach((button) => {
    button.addEventListener('click', () => {
      const modeIndex = Number(button.dataset.modeIndex);
      if (!Number.isInteger(modeIndex)) return;
      commit({ ...state, selectedModeIndex: modeIndex, elapsedMs: 0, screen: 'home', running: false, startedAtMs: null });
    });
  });
}

function handleInput(eventName: InputEventName): void {
  const nowMs = performance.now();

  if (eventName === 'doublePress') {
    commit(resetHome(state));
    return;
  }

  if (eventName === 'up') {
    commit(moveSelection(state, -1));
    return;
  }

  if (eventName === 'down') {
    commit(moveSelection(state, 1));
    return;
  }

  if (eventName === 'press') {
    if (state.screen === 'home' && state.elapsedMs === 0) {
      commit(startGuidedSession(nowMs));
      return;
    }

    commit(toggleRun(state, nowMs));
  }
}

function handleEvenInput(event: NormalizedEvenInputEvent): void {
  commit(withInputSummary(state, event.summary));

  if (event.mappedAction) {
    handleInput(event.mappedAction);
  }
}

function startTicker(): void {
  const run = () => {
    if (state.running) {
      const nextState = tick(state, performance.now());
      if (nextState !== state) {
        commit(nextState);
      }
    }

    animationFrame = window.requestAnimationFrame(run);
  };

  animationFrame = window.requestAnimationFrame(run);
}

async function bootstrap(): Promise<void> {
  commit(initialState());
  bindKeyboardInput(handleInput);
  bindEvenInput(handleEvenInput).catch(() => undefined);
  evenDisplay = await createEvenDisplay();

  if (evenDisplay) {
    await evenDisplay.render(state);
  }

  startTicker();
}

window.addEventListener('beforeunload', () => {
  if (animationFrame !== null) {
    window.cancelAnimationFrame(animationFrame);
  }
});

void bootstrap();
