/**
 * Simple analytics utility for EventFlow
 * In a real-world app, this would integrate with GA, Mixpanel, or PostHog.
 */

const trackEvent = (eventName, properties = {}) => {
  const payload = {
    event: eventName,
    timestamp: new Date().toISOString(),
    properties: {
      ...properties,
      url: typeof window !== 'undefined' ? window.location.href : '',
    },
  };

  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Analytics] ${eventName}:`, payload);
  }

  // Placeholder for real analytics API call
  /*
  fetch('/api/analytics', {
    method: 'POST',
    body: JSON.stringify(payload),
    headers: { 'Content-Type': 'application/json' }
  }).catch(err => console.error('Analytics tracking failed', err));
  */
};

export const Analytics = {
  trackPageVisit: (pageName) => trackEvent('page_visit', { pageName }),
  trackEventCreated: (eventTitle) => trackEvent('event_created', { eventTitle }),
  trackJudgeAssigned: (judgeId, eventId) => trackEvent('judge_assigned', { judgeId, eventId }),
  trackJudgeRemoved: (judgeId, eventId) => trackEvent('judge_removed', { judgeId, eventId }),
  trackFilterUsed: (filterType, value) => trackEvent('filter_used', { filterType, value }),
  trackModalOpen: (modalName) => trackEvent('modal_open', { modalName }),
};
