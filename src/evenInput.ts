import { OsEventTypeList, waitForEvenAppBridge, type EvenHubEvent } from '@evenrealities/even_hub_sdk';
import type { InputEventName } from './types';

type EvenInputBridgeLike = {
  onEvenHubEvent(callback: (event: EvenHubEvent) => void): () => void;
};

export type NormalizedEvenInputEvent = {
  mappedAction: InputEventName | null;
  summary: string;
};

export async function bindEvenInput(
  handler: (event: NormalizedEvenInputEvent) => void,
  timeoutMs = 1500
): Promise<(() => void) | null> {
  try {
    const bridge = await withTimeout(waitForEvenAppBridge(), timeoutMs);
    const unsubscribe = (bridge as unknown as EvenInputBridgeLike).onEvenHubEvent((event) => {
      handler(normalizeEvenHubEvent(event));
    });

    return unsubscribe;
  } catch {
    return null;
  }
}

function normalizeEvenHubEvent(event: EvenHubEvent): NormalizedEvenInputEvent {
  const sysType = event.sysEvent?.eventType;
  const textType = event.textEvent?.eventType;
  const channel = event.textEvent ? 'textEvent' : event.sysEvent ? 'sysEvent' : 'unknown';
  const mappedAction = mapEvenHubEvent(textType, sysType, Boolean(event.textEvent), Boolean(event.sysEvent));
  const summary = `${channel} ${eventTypeLabel(textType ?? sysType)}${mappedAction ? ` -> ${mappedAction}` : ''}`;

  console.debug('[even-input]', { mappedAction, sysType: sysType ?? null, textType: textType ?? null, event });

  return {
    mappedAction,
    summary
  };
}

function mapEvenHubEvent(
  textType: OsEventTypeList | undefined,
  sysType: OsEventTypeList | undefined,
  hasTextEvent: boolean,
  hasSysEvent: boolean
): InputEventName | null {
  if (sysType === OsEventTypeList.DOUBLE_CLICK_EVENT || textType === OsEventTypeList.DOUBLE_CLICK_EVENT) {
    return 'doublePress';
  }

  if (textType === OsEventTypeList.SCROLL_TOP_EVENT) {
    return 'up';
  }

  if (textType === OsEventTypeList.SCROLL_BOTTOM_EVENT) {
    return 'down';
  }

  if (hasTextEvent && (textType ?? OsEventTypeList.CLICK_EVENT) === OsEventTypeList.CLICK_EVENT) {
    return 'press';
  }

  if (hasSysEvent && (sysType ?? OsEventTypeList.CLICK_EVENT) === OsEventTypeList.CLICK_EVENT) {
    return 'press';
  }

  return null;
}

function eventTypeLabel(eventType: OsEventTypeList | undefined): string {
  switch (eventType) {
    case OsEventTypeList.CLICK_EVENT:
      return 'CLICK_EVENT';
    case OsEventTypeList.SCROLL_TOP_EVENT:
      return 'SCROLL_TOP_EVENT';
    case OsEventTypeList.SCROLL_BOTTOM_EVENT:
      return 'SCROLL_BOTTOM_EVENT';
    case OsEventTypeList.DOUBLE_CLICK_EVENT:
      return 'DOUBLE_CLICK_EVENT';
    case OsEventTypeList.FOREGROUND_ENTER_EVENT:
      return 'FOREGROUND_ENTER_EVENT';
    case OsEventTypeList.FOREGROUND_EXIT_EVENT:
      return 'FOREGROUND_EXIT_EVENT';
    case OsEventTypeList.ABNORMAL_EXIT_EVENT:
      return 'ABNORMAL_EXIT_EVENT';
    case OsEventTypeList.SYSTEM_EXIT_EVENT:
      return 'SYSTEM_EXIT_EVENT';
    default:
      return `UNKNOWN_EVENT(${eventType ?? 'null'})`;
  }
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
