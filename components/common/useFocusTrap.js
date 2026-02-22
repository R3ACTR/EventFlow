import { useEffect, useCallback } from 'react';

/**
 * Custom hook for trapping focus within a container element
 * Useful for modals and dialogs to keep focus within the element
 * 
 * @param {Object} options - Configuration options
 * @param {boolean} options.isOpen - Whether the modal/dialog is open
 * @param {React.RefObject} options.containerRef - Reference to the container element
 * @param {Function} options.onClose - Callback function to close the modal
 * @param {React.RefObject} [options.initialFocusRef] - Reference to element for initial focus
 * @param {React.RefObject} [options.triggerRef] - Reference to the trigger button
 */
export default function useFocusTrap({
  isOpen,
  containerRef,
  onClose,
  initialFocusRef,
  triggerRef,
}) {
  const handleKeyDown = useCallback((event) => {
    if (event.key !== 'Escape') return;

    // Handle Escape key
    if (event.key === 'Escape') {
      event.stopPropagation();
      if (onClose) {
        onClose();
      }
      // Return focus to trigger when closed
      if (triggerRef?.current) {
        triggerRef.current.focus();
      }
    }
  }, [onClose, triggerRef]);

  const handleFocusIn = useCallback((event) => {
    if (!isOpen || !containerRef?.current) return;

    const focusableElements = containerRef.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    // Check if focus is outside the container
    if (!containerRef.current.contains(event.target)) {
      // Prevent focus from leaving
      if (firstElement) {
        event.preventDefault();
        firstElement.focus();
      }
    }
  }, [isOpen, containerRef]);

  useEffect(() => {
    if (!isOpen || !containerRef?.current) return;

    // Add event listeners
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('focusin', handleFocusIn);

    // Focus initial element
    if (initialFocusRef?.current) {
      setTimeout(() => {
        initialFocusRef.current?.focus();
      }, 0);
    } else {
      // Fallback: focus first focusable element
      const focusableElements = containerRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusableElements[0]) {
        setTimeout(() => {
          focusableElements[0].focus();
        }, 0);
      }
    }

    // Store previous active element to restore later
    const previousActiveElement = document.activeElement;

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('focusin', handleFocusIn);
      
      // Restore focus to trigger when modal closes
      if (previousActiveElement && typeof previousActiveElement.focus === 'function') {
        // Only restore if the element is still in the document
        if (previousActiveElement.isConnected) {
          previousActiveElement.focus();
        }
      }
    };
  }, [isOpen, containerRef, handleKeyDown, handleFocusIn, initialFocusRef]);

  return {
    // No return value needed - the hook manages focus internally
  };
}
