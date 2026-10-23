# useFetch

A lightweight React hook, useFetch, that fetches JSON from a URL with built-in loading and error states, automatic request cancellation on unmount or URL change, and a retry function.

## Features

- **Simple API**: pass a URL, get back `data`, `loading`, `error`, and `retry`
- **Automatic cancellation**: in-flight requests are aborted on unmount or when the URL changes (via `AbortController`)
- **No race conditions**: stale responses from a previous URL never overwrite newer state
- **HTTP error handling**: non-2xx responses are surfaced as errors
- **Retry support**: re-run the same request with a single function call
- **Zero dependencies**: only React

## Installation

Copy `useFetch.js` into your project (for example `src/hooks/useFetch.js`).

Requires React 16.8+ (hooks support).

## API

```js
const { data, loading, error, retry } = useFetch(url);
```

### Parameters

| Name  | Type     | Description                      |
| ----- | -------- | -------------------------------- |
| `url` | `string` | The endpoint to fetch JSON from. |

### Returns

| Name      | Type             | Description                                                     |
| --------- | ---------------- | --------------------------------------------------------------- |
| `data`    | `any \| null`    | Parsed JSON response. `null` while loading or after an error.   |
| `loading` | `boolean`        | `true` while a request is in progress.                          |
| `error`   | `Error \| null`  | The error if the request failed (network error or non-2xx).     |
| `retry`   | `() => void`     | Re-triggers the request for the current URL.                    |

## How it works

1. On mount (or when `url` changes), the hook sets `loading` to `true` and starts a `fetch` with an `AbortController` signal.
2. If the response is not OK (status outside 200-299), it throws an error like `Request failed: 404`.
3. On success, `data` is set and `loading` becomes `false`.
4. When the component unmounts or `url` changes, the pending request is aborted, and the resulting `AbortError` is ignored.
5. Calling `retry()` increments an internal counter, which re-runs the effect and refetches.

## Contributing

Issues and pull requests are welcome.

## License

MIT
