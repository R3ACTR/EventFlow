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

/**
 * Handles keyboard navigation within forms
 * - Enter: Submit form or move to next field (for buttons)
 * - Arrow Up/Down: Navigate between form fields
 * - Escape: Clear input or trigger cancel
 * 
 * @param {React.KeyboardEvent} event - The keyboard event
 * @param {Object} options - Configuration options
 * @param {Function} options.onSubmit - Callback for form submission
 * @param {Function} options.onCancel - Callback for cancel/escape
 * @param {string} options.submitKey - Key to trigger submit (default: 'Enter')
 */
export function handleFormKeyDown(event, options = {}) {
  const { onSubmit, onCancel, submitKey = 'Enter' } = options;
  const { key, target, ctrlKey, metaKey } = event;
  
  // Skip if modifier keys are pressed (except for submit shortcuts)
  const isModifierPressed = ctrlKey || metaKey;
  
  // Handle form submission
  if (key === submitKey && !isModifierPressed) {
    const tagName = target.tagName.toLowerCase();
    const isSubmitButton = tagName === 'button' && (target.type === 'submit' || !target.type);
    const isAnchor = tagName === 'a';
    
    if (!isSubmitButton && !isAnchor && onSubmit) {
      event.preventDefault();
      onSubmit(event);
      return;
    }
  }
  
  // Handle cancel/escape
  if (key === 'Escape' && onCancel) {
    event.preventDefault();
    onCancel(event);
    return;
  }
  
  // Handle Cmd/Ctrl+Enter for submit
  if ((key === 'Enter') && isModifierPressed && onSubmit) {
    event.preventDefault();
    onSubmit(event);
    return;
  }
}

/**
 * Creates a keyboard event handler for menu elements (role="menu")
 * Navigates between menu items using arrow keys
 * 
 * @param {React.KeyboardEvent} event - The keyboard event
 * @param {string} [itemSelector] - Selector for menu items (default: '[role="menuitem"]')
 */
export function handleMenuKeyDown(event, itemSelector = '[role="menuitem"]') {
  const { key, target, shiftKey } = event;
  const menu = target.closest('[role="menu"]');
  
  if (!menu) return;
  
  const items = Array.from(menu.querySelectorAll(itemSelector));
  const currentIndex = items.findIndex(item => item.contains(target) || item === target);
  
  if (currentIndex === -1) return;
  
  let newIndex = currentIndex;
  
  switch (key) {
    case 'ArrowDown':
      event.preventDefault();
      newIndex = Math.min(currentIndex + 1, items.length - 1);
      break;
    case 'ArrowUp':
      event.preventDefault();
      newIndex = Math.max(currentIndex - 1, 0);
      break;
    case 'Home':
      event.preventDefault();
      newIndex = 0;
      break;
    case 'End':
      event.preventDefault();
      newIndex = items.length - 1;
      break;
    case 'Tab':
      // Allow Tab to move to next focusable element
      // But prevent shift+tab from going back into menu
      if (shiftKey && currentIndex === 0) {
        event.preventDefault();
        return;
      }
      return;
    case 'Enter':
    case ' ':
      event.preventDefault();
      target.click();
      return;
    case 'Escape':
      // Let parent handle escape
      return;
    default:
      // Type-ahead search (optional enhancement)
      if (key.length === 1) {
        const matchingItem = items.find(item => 
          item.textContent.toLowerCase().startsWith(key.toLowerCase())
        );
        if (matchingItem) {
          event.preventDefault();
          matchingItem.focus();
        }
      }
      return;
  }
  
  if (items[newIndex]) {
    items[newIndex].focus();
  }
}
