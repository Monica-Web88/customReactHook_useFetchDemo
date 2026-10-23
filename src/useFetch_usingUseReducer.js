// useFetch.js
// Data fetching with loading, error and retry, using useReducer instead of useState.
// Includes the hook, the reducer, and a small UserList component that uses it.
import { useReducer, useEffect, useCallback } from 'react';

// ---------------------------------------------------------------------------
// 1. State shape and reducer
// status is one of: 'loading' | 'success' | 'error'
// A single status field means impossible combinations (loading AND error) cannot exist.
// ---------------------------------------------------------------------------
export const initialState = {
  status: 'loading',
  data: null,
  error: null,
  attempt: 0, // bumped by RETRY so the effect runs again
};

export function fetchReducer(state, action) {
  switch (action.type) {
    case 'FETCH_START':
      // keep old data while loading; clear the previous error
      return { ...state, status: 'loading', error: null };
    case 'FETCH_SUCCESS':
      return { ...state, status: 'success', data: action.payload, error: null };
    case 'FETCH_ERROR':
      return { ...state, status: 'error', data: null, error: action.error };
    case 'RETRY':
      return { ...state, attempt: state.attempt + 1 };
    default:
      throw new Error(`Unknown action type: ${action.type}`);
  }
}

// ---------------------------------------------------------------------------
// 2. The hook
// ---------------------------------------------------------------------------
export function useFetch(url) {
  const [state, dispatch] = useReducer(fetchReducer, initialState);

  useEffect(() => {
    const controller = new AbortController(); // lets us cancel the request

    dispatch({ type: 'FETCH_START' });

    fetch(url, { signal: controller.signal })
      .then((res) => {
        // fetch does not reject on 404 or 500, so check res.ok ourselves
        if (!res.ok) throw new Error(`Request failed: ${res.status}`);
        return res.json();
      })
      .then((data) => dispatch({ type: 'FETCH_SUCCESS', payload: data }))
      .catch((error) => {
        // AbortError means we cancelled on purpose (unmount or url change), not a real failure
        if (error.name === 'AbortError') return;
        dispatch({ type: 'FETCH_ERROR', error });
      });

    // cleanup: cancel the in-flight request so an old response can never overwrite newer data
    return () => controller.abort();
  }, [url, state.attempt]);

  // stable function identity, safe to pass to child components
  const retry = useCallback(() => dispatch({ type: 'RETRY' }), []);

  return {
    data: state.data,
    error: state.error,
    loading: state.status === 'loading',
    status: state.status,
    retry,
  };
}

// ---------------------------------------------------------------------------
// 3. Example component
// ---------------------------------------------------------------------------
export default function UserList() {
  const { data, loading, error, retry } = useFetch(
    'https://jsonplaceholder.typicode.com/users'
  );

  if (loading) return <p role="status">Loading users…</p>;

  if (error) {
    return (
      <div role="alert">
        <p>Something went wrong: {error.message}</p>
        <button onClick={retry}>Retry</button>
      </div>
    );
  }

  return (
    <ul>
      {data.map((user) => (
        <li key={user.id}>
          {user.name} <small>({user.email})</small>
        </li>
      ))}
    </ul>
  );
}