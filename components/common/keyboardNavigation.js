/**
 * Handles keyboard navigation for tablist elements (role="tablist")
 * Navigates between tabs using arrow keys and activates on Enter/Space
 * 
 * @param {React.KeyboardEvent} event - The keyboard event
 * @param {string} [selector] - Optional selector for tab elements (default: '[role="tab"]')
 */
export function handleTabListKeyDown(event, selector = '[role="tab"]') {
  const { key, target } = event;
  const parent = target.closest('[role="tablist"]');
  if (!parent) return;

  const tabs = Array.from(parent.querySelectorAll(selector));
  const currentIndex = tabs.indexOf(target);

  if (currentIndex === -1) return;

  let newIndex = currentIndex;

  switch (key) {
    case 'ArrowRight':
    case 'ArrowDown':
      event.preventDefault();
      newIndex = (currentIndex + 1) % tabs.length;
      break;
    case 'ArrowLeft':
    case 'ArrowUp':
      event.preventDefault();
      newIndex = (currentIndex - 1 + tabs.length) % tabs.length;
      break;
    case 'Home':
      event.preventDefault();
      newIndex = 0;
      break;
    case 'End':
      event.preventDefault();
      newIndex = tabs.length - 1;
      break;
    case 'Enter':
    case ' ':
      event.preventDefault();
      target.click();
      return;
    default:
      return;
  }

  tabs[newIndex]?.focus();
}

/**
 * Handles keyboard navigation for listbox elements (role="listbox")
 * Navigates between options using arrow keys and selects on Enter/Space
 * 
 * @param {React.KeyboardEvent} event - The keyboard event
 * @param {string} selector - Selector for selectable elements (e.g., '[role="option"]', 'button:not([disabled])')
 */
export function handleArrowListKeyDown(event, selector) {
  const { key, target } = event;
  const parent = target.closest('[role="listbox"]');
  if (!parent) return;

  const options = Array.from(parent.querySelectorAll(selector));
  const currentIndex = options.indexOf(target);

  if (currentIndex === -1) return;

  let newIndex = currentIndex;

  switch (key) {
    case 'ArrowDown':
      event.preventDefault();
      newIndex = (currentIndex + 1) % options.length;
      break;
    case 'ArrowUp':
      event.preventDefault();
      newIndex = (currentIndex - 1 + options.length) % options.length;
      break;
    case 'Home':
      event.preventDefault();
      newIndex = 0;
      break;
    case 'End':
      event.preventDefault();
      newIndex = options.length - 1;
      break;
    case 'Enter':
    case ' ':
      event.preventDefault();
      target.click();
      return;
    case 'Escape':
    case 'Tab':
      // Let default behavior handle these
      return;
    default:
      return;
  }

  options[newIndex]?.focus();
}
