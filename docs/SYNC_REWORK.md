# Mail synchronization

Milo's sync engine uses IMAP to discover folders, update counts and fetch messages. Cached data feeds the message list and local search. IMAP search can retrieve results outside the local sync window. [Sync engine](../internal/sync/engine.go) · [Folder sync](../internal/sync/folders.go) · [Search](../internal/sync/search.go)

## Connection use and unread counts

- The [IMAP pool](../internal/imap/pool.go) limits pooled connections and concurrent logins by account. It skips a NOOP health probe for connections used within ten seconds and discards dead connections when released. IMAP IDLE uses a separate connection.
- Folder sync releases its initial connection before refreshing server counts. The STATUS pass can pipeline requests over two connections and skips folders that the same pass is about to message-sync. Server-side unread counts can cover more messages than the local sync window. [Folder sync](../internal/sync/folders.go)
- Background body fetches use a per-account limit of three. This leaves pool capacity for header and status work. [Body fetch gate](../internal/sync/bodygate.go) · [Message fetch](../internal/sync/fetch.go)

Use the [Linux diagnostics instructions](BUILD.md#existing-profiles) to enable local logs when investigating synchronization.
