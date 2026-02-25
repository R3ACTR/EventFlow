/**
 * Offline-friendly caching utility for EventFlow
 * Provides a simple wrapper around localStorage for API response caching.
 */

const CACHE_PREFIX = 'eventflow_cache_';
const DEFAULT_TTL = 1000 * 60 * 5; // 5 minutes

export const Cache = {
  set: (key, data, ttl = DEFAULT_TTL) => {
    if (typeof window === 'undefined') return;
    const entry = {
      data,
      expiry: Date.now() + ttl,
    };
    try {
      localStorage.setItem(CACHE_PREFIX + key, JSON.stringify(entry));
    } catch (e) {
      console.warn('[Cache] Storage limit reached or failed', e);
    }
  },

  get: (key) => {
    if (typeof window === 'undefined') return null;
    try {
      const entry = JSON.parse(localStorage.getItem(CACHE_PREFIX + key));
      if (!entry) return null;
      if (Date.now() > entry.expiry) {
        localStorage.removeItem(CACHE_PREFIX + key);
        return null;
      }
      return entry.data;
    } catch (e) {
      return null;
    }
  },

  clear: (key) => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(CACHE_PREFIX + key);
  }
};
