import { waitForEvenAppBridge } from '@evenrealities/even_hub_sdk';
import { EXERCISES } from './exercises';
import type { AppState } from './types';
import { APP_VERSION } from './version';

const TITLE_ID = 1;
const BODY_ID = 2;
const HELP_ID = 3;

type TextContainerPayload = {
  containerID: number;
  containerName: string;
  xPosition: number;
  yPosition: number;
  width: number;
  height: number;
  content: string;
  isEventCapture: 0 | 1;
};

type PageContainerPayload = {
  containerTotalNum: number;
  textObject: TextContainerPayload[];
};

type TextUpgradePayload = {
  containerID: number;
  containerName: string;
  content: string;
};

type EvenBridgeLike = {
  createStartUpPageContainer(container: PageContainerPayload): Promise<number>;
  textContainerUpgrade(container: TextUpgradePayload): Promise<boolean>;
};

export type EvenDisplay = {
  render(state: AppState): Promise<void>;
};

export async function createEvenDisplay(timeoutMs = 1500): Promise<EvenDisplay | null> {
  try {
    const bridge = await withTimeout(waitForEvenAppBridge(), timeoutMs);
    const display = new EvenGlassesDisplay(bridge as unknown as EvenBridgeLike);
    await display.initialize();
    return display;
  } catch {
    return null;
  }
}

class EvenGlassesDisplay implements EvenDisplay {
  private initialized = false;

  constructor(private readonly bridge: EvenBridgeLike) {}

  async initialize(): Promise<void> {
    if (this.initialized) return;

    const page: PageContainerPayload = {
      containerTotalNum: 3,
      textObject: [
        textContainer(TITLE_ID, 'title', 24, 24, 560, 48, APP_VERSION, 0),
        textContainer(BODY_ID, 'body', 24, 88, 560, 180, 'Tap to start guided session.', 1),
        textContainer(HELP_ID, 'help', 24, 286, 560, 32, 'tap start | swipe mode', 0)
      ]
    };

    const result = await this.bridge.createStartUpPageContainer(page);
    this.initialized = result === 0;
  }

  async render(state: AppState): Promise<void> {
    if (!this.initialized) return;

    const frame = frameForState(state);
    await Promise.all([
      this.bridge.textContainerUpgrade(textUpgrade(TITLE_ID, 'title', frame.title)),
      this.bridge.textContainerUpgrade(textUpgrade(BODY_ID, 'body', frame.body)),
      this.bridge.textContainerUpgrade(textUpgrade(HELP_ID, 'help', frame.help))
    ]);
  }
}

function frameForState(state: AppState): { title: string; body: string; help: string } {
  const selected = EXERCISES[state.selectedModeIndex] ?? EXERCISES[0];

  if (state.screen === 'done') {
    return {
      title: 'Done',
      body: 'Rest your eyes.\nStop if symptoms worsen.',
      help: 'tap restart | double reset'
    };
  }

  if (state.screen === 'exercise') {
    const secondsLeft = Math.max(0, Math.ceil((selected.durationMs - state.elapsedMs) / 1000));
    return {
      title: selected.label,
      body: `${state.running ? 'Running' : 'Paused'}\n${secondsLeft}s left\n\n${selected.description}`,
      help: 'tap pause | double reset'
    };
  }

  return {
    title: APP_VERSION,
    body: `${selected.label}\n${selected.description}\n\nTap: start guided session\nSwipe: change mode`,
    help: 'stop if pain/nausea/headache'
  };
}

function textContainer(
  containerID: number,
  containerName: string,
  xPosition: number,
  yPosition: number,
  width: number,
  height: number,
  content: string,
  isEventCapture: 0 | 1
): TextContainerPayload {
  return { containerID, containerName, xPosition, yPosition, width, height, content, isEventCapture };
}

function textUpgrade(containerID: number, containerName: string, content: string): TextUpgradePayload {
  return {
    containerID,
    containerName,
    content: normalizeForEvenDisplay(content)
  };
}

function normalizeForEvenDisplay(value: string): string {
  return value
    .replace(/\r\n/g, '\n')
    .replace(/[\u2018\u2019\u201A\u201B]/g, "'")
    .replace(/[\u201C\u201D\u201E\u201F]/g, '"')
    .replace(/[\u2013\u2014]/g, '-')
    .replace(/\u2026/g, '...')
    .replace(/[\u2022\u2023\u25E6\u2043\u2219]/g, '-')
    .replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}]/gu, '')
    .replace(/[^\x09\x0A\x20-\x7E]/g, '');
}

async function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  const timeout = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error('Even bridge unavailable')), timeoutMs);
  });

  try {
    return await Promise.race([promise, timeout]);
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }
}
