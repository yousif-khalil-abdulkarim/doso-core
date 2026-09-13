---
"eridu-tech": minor
---

Added a new `transaction-context` component for running code inside a transaction scope. It is available from `eridu-tech/transaction-context`, `eridu-tech/transaction-context/contracts`, `eridu-tech/transaction-context/middlewares` and the `eridu-tech/transaction-context/{kysely,mongodb,no-op}-transaction-adapter` adapter paths.

- Added the `TransactionContext` derivable, which tracks the active transaction in an execution context, so nested calls join the same transaction instead of starting a new one:
    - `run(invocable)` runs an invocable inside a transaction with `REQUIRED` propagation. `run(propagation, invocable)` accepts a `TransactionPropagation` mode: `TRANSACTION_PROPAGATION.REQUIRED` joins an active transaction or starts one, `SUPPORTS` joins an active transaction or runs without one, `MANDATORY` requires an active transaction and `NEVER` requires that none is active.

    - `client`, `transaction` and `isInTransaction` expose the base client and the current transaction, while `current` returns the transaction-scoped client when a transaction is active and the base client otherwise.

    - `getTransactionOrFail()` returns the transaction-scoped client and throws `MandatoryPropagationError` when no transaction is active.

    - `afterCommit(invocable, settings)` registers an invocable that runs once the active transaction commits. When no transaction is active it runs immediately, unless `runWithoutTransaction: false` is passed, in which case it is discarded.

    - `TransactionContext.noOp(client)` creates a context that never uses a transaction, which is useful when transactions are not needed or not supported.

- Added the `ITransactionAdapter`, `ITransaction`, `ITransactionContext`, `ITransactionContextBase`, `ITransactionConnection`, `ITransactionHooks` and `TransactionAware` contracts, the `TRANSACTION_PROPAGATION` constant with its `TransactionPropagation` type, and the `MandatoryPropagationError`, `NeverPropagationError`, `StartTransactionError`, `CommitTransactionError` and `AbortTransactionError` errors.

- Added new adapters:
    - `KyselyTransactionAdapter` starts Kysely transactions from a base `Kysely` client using a configurable access mode (default `"read write"`) and isolation level (default `"serializable"`).

    - `MongodbTransactionAdapter` starts MongoDB transactions from a `MongoClient` session, with configurable session, transaction, commit/abort timeout and end-session settings.

    - `NoOpTransactionAdapter` performs no transactional work, so `start()` resolves to `null` and `commit()`/`abort()` have no effect.

- Added the `withTransactionFactory` middleware, which runs the wrapped function inside a transaction through the given transaction context and defaults to `TRANSACTION_PROPAGATION.REQUIRED`.
