import { useRef, useCallback } from 'react';
import axios from 'axios';

const pendingRequests = new Map();

export const useApiRequest = () => {
  const abortControllerRef = useRef(null);

  const makeRequest = useCallback(async (url, config, requestKey = null) => {
    if (requestKey && pendingRequests.has(requestKey)) {
      console.log(`[GUARD] Waiting for existing request: ${requestKey}`);
      try {
        return await pendingRequests.get(requestKey);
      } catch (error) {
        throw error;
      }
    }

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    const requestPromise = (async () => {
      try {
        const response = await axios.get(url, {
          ...config,
          signal: abortController.signal
        });
        return response;
      } catch (error) {
        if (error.name === 'CanceledError' || error.name === 'AbortError' || axios.isCancel(error)) {
          console.log('[REQUEST CANCELLED]', requestKey);
          throw new Error('Request cancelled');
        }
        throw error;
      }
    })();

    if (requestKey) {
      pendingRequests.set(requestKey, requestPromise);
    }

    try {
      const result = await requestPromise;
      return result;
    } finally {
      if (requestKey) {
        pendingRequests.delete(requestKey);
      }
    }
  }, []);

  const cancelRequest = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  return { makeRequest, cancelRequest };
};
