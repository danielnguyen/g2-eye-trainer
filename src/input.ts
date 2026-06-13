import type { InputEventName } from './types';

export function bindKeyboardInput(handler: (eventName: InputEventName) => void): void {
  window.addEventListener('keydown', (event) => {
    if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault();
      handler('press');
      return;
    }

    if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') {
      event.preventDefault();
      handler('up');
      return;
    }

    if (event.key === 'ArrowDown' || event.key === 'ArrowRight') {
      event.preventDefault();
      handler('down');
      return;
    }

    if (event.key === 'Escape') {
      event.preventDefault();
      handler('doublePress');
    }
  });
}
