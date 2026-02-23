"use client";

import { useCallback, useRef } from "react";

/**
 * Custom hook for comprehensive form keyboard navigation
 * 
 * Features:
 * - Enter key to submit form
 * - Arrow keys (Up/Down) to navigate between form fields
 * - Escape key to clear input or trigger cancel callback
 * - Cmd/Ctrl+Enter for alternative submit
 * 
 * @param {Object} options - Configuration options
 * @param {Function} options.onSubmit - Callback for form submission
 * @param {Function} options.onCancel - Callback for cancel action
 * @param {string[]} options.fieldSelectors - Array of CSS selectors for form fields
 * @returns {Object} - Handlers and refs
 */
export default function useFormKeyboardNavigation({
  onSubmit,
  onCancel,
  fieldSelectors = [],
}) {
  const fieldRefs = useRef([]);

  /**
   * Register a field ref for keyboard navigation
   */
  const registerFieldRef = useCallback((index) => (element) => {
    fieldRefs.current[index] = element;
  }, []);

  /**
   * Navigate to a specific field by index
   */
  const focusField = useCallback((index) => {
    const field = fieldRefs.current[index];
    if (field) {
      field.focus();
      // Select all text if it's an input
      if (field.tagName.toLowerCase() === 'input' || field.tagName.toLowerCase() === 'textarea') {
        field.select();
      }
    }
  }, []);

  /**
   * Get the next/previous field index based on current position
   */
  const getAdjacentFieldIndex = useCallback((currentIndex, direction) => {
    if (fieldRefs.current.length === 0) return -1;
    
    let newIndex;
    if (direction === 'next') {
      newIndex = (currentIndex + 1) % fieldRefs.current.length;
    } else {
      newIndex = (currentIndex - 1 + fieldRefs.current.length) % fieldRefs.current.length;
    }
    
    // Skip disabled or readonly fields
    const field = fieldRefs.current[newIndex];
    if (field && (field.disabled || field.readOnly)) {
      return getAdjacentFieldIndex(newIndex, direction);
    }
    
    return newIndex;
  }, []);

  /**
   * Handle keyboard events within a form field
   */
  const handleFieldKeyDown = useCallback((event, currentIndex) => {
    const { key, target, ctrlKey, metaKey, shiftKey } = event;
    const tagName = target.tagName.toLowerCase();
    const isInput = tagName === 'input' || tagName === 'textarea';
    const isSelect = tagName === 'select';
    const isButton = tagName === 'button';

    // Handle Enter key for form submission
    if (key === 'Enter' && !shiftKey) {
      // For non-button, non-anchor elements, trigger submit
      if (!isButton && tagName !== 'a') {
        // If there's a next field, move to it instead of submitting
        const nextIndex = getAdjacentFieldIndex(currentIndex, 'next');
        if (nextIndex !== -1 && nextIndex > currentIndex && isInput) {
          event.preventDefault();
          focusField(nextIndex);
          return;
        }
        
        // Otherwise submit the form
        if (onSubmit) {
          event.preventDefault();
          onSubmit(event);
        }
        return;
      }
    }

    // Handle Cmd/Ctrl+Enter for alternative submit
    if (key === 'Enter' && (ctrlKey || metaKey)) {
      if (onSubmit) {
        event.preventDefault();
        onSubmit(event);
      }
      return;
    }

    // Handle Escape key
    if (key === 'Escape') {
      if (onCancel) {
        event.preventDefault();
        onCancel(event);
      } else if (isInput) {
        // Default: clear the input value
        event.preventDefault();
        target.value = '';
        // Dispatch change event
        target.dispatchEvent(new Event('change', { bubbles: true }));
      }
      return;
    }

    // Handle Arrow keys for field navigation
    if ((key === 'ArrowDown' || key === 'ArrowUp') && !isSelect) {
      event.preventDefault();
      const direction = key === 'ArrowDown' ? 'next' : 'prev';
      const newIndex = getAdjacentFieldIndex(currentIndex, direction);
      if (newIndex !== -1) {
        focusField(newIndex);
      }
      return;
    }

    // Handle Home/End for first/last field navigation (with Ctrl/Cmd)
    if (key === 'Home' && (ctrlKey || metaKey)) {
      event.preventDefault();
      focusField(0);
      return;
    }

    if (key === 'End' && (ctrlKey || metaKey)) {
      event.preventDefault();
      focusField(fieldRefs.current.length - 1);
      return;
    }
  }, [onSubmit, onCancel, focusField, getAdjacentFieldIndex]);

  /**
   * Create a keyboard handler for a specific field by index
   */
  const createFieldKeyHandler = useCallback((index) => {
    return (event) => handleFieldKeyDown(event, index);
  }, [handleFieldKeyDown]);

  /**
   * Global key handler for the form
   */
  const handleFormKeyDown = useCallback((event) => {
    const { key, ctrlKey, metaKey } = event;

    // Handle Enter key with Ctrl/Cmd for form submission
    if (key === 'Enter' && (ctrlKey || metaKey)) {
      if (onSubmit) {
        event.preventDefault();
        onSubmit(event);
      }
    }
  }, [onSubmit]);

  return {
    registerFieldRef,
    focusField,
    handleFormKeyDown,
    createFieldKeyHandler,
  };
}
