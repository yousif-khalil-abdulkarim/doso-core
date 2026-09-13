---
"eridu-tech": minor
---

Added new `withBeforeHook`, `withAfterHook`, `withOnError`, `withBeforeHookSync`, `withAfterHookSync` and `withOnErrorSync` middlewares, which cover the common around-advice use cases without having to write them by hand.

- `withBeforeHook` runs a `BeforeHook` before the wrapped function. The hook receives the argument tuple and can replace it by returning a new tuple; returning `void`/`undefined` keeps the original arguments. Both the hook and the wrapped function may be async.

- `withAfterHook` runs an `AfterHook` after the wrapped function resolves. The hook receives the argument tuple and the result, and can replace the result by returning a new value; returning `void`/`undefined` keeps the original result. The hook is skipped when the wrapped function throws.

- `withOnError` runs an `OnErrorHook` when the wrapped function throws. The hook receives the argument tuple and the error for side effects only, and the error is always re-thrown unchanged. The hook is skipped when the wrapped function succeeds.

- `withBeforeHook`, `withAfterHook` and `withOnError` accept an optional `detach` setting. When `true`, the hook is invoked without being awaited, which means it cannot change the arguments or the result (and for `withOnError` it cannot affect the re-thrown error).

Each middleware also has a synchronous variant, which returns a `MiddlewareFn` instead of a promise so errors propagate synchronously:

- `withBeforeHookSync`, `withAfterHookSync` and `withOnErrorSync` take a synchronous `BeforeHookSync`, `AfterHookSync` or `OnErrorHookSync` callback. They have no `detach` setting, and the hook is always invoked.

- Because the wrapped function is not awaited, `withAfterHookSync` receives the unresolved result and `withOnErrorSync` only catches synchronous throws, not promise rejections.
