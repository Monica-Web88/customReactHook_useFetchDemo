
import { useState, useEffect, useCallback } from "react";

export default function useFetch(url) {
  const [state, setState] = useState({
    data: null,
    loading: true,
    error: null,
  });

  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    setState((s) => ({
      ...s,
      loading: true,
      error: null,
    }));

    fetch(url, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Request failed: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        setState({
          data,
          loading: false,
          error: null,
        });
      })
      .catch((error) => {
        if (error.name === "AbortError") return;

        setState({
          data: null,
          loading: false,
          error,
        });
      });

    return () => controller.abort();
  }, [url, attempt]);

  const retry = useCallback(() => {
    setAttempt((n) => n + 1);
  }, []);

  return { ...state, retry };
}