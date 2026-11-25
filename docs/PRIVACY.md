# Milo privacy and local data

Milo is a desktop application. This page describes how the current source handles local data and communicates with services.

## Local data

The profile stores account and application settings, cached mail, drafts, and contact and calendar data. Attachments and cached files may also exist on disk. Contacts and Calendar use extension-owned SQLite files for their own data. See the [profile guide](BUILD.md#existing-profiles) for locations and compatibility with earlier profiles.

Milo stores passwords and OAuth tokens in the OS keyring when available and uses encrypted database fields as a fallback. The profile holds the key material needed by the fallback. Mail, drafts and other general SQLite data belong to the local profile and should be treated as readable by anyone with access to the relevant files. [Credential store](../internal/credentials/store.go) · [Database](../internal/database/)

## Network connections

- Mail sync, server search and sending connect to the configured IMAP and SMTP servers. Draft synchronization can write drafts to the configured account.
- OAuth uses the provider's authorization page in a browser and a loopback callback. The app exchanges authorization codes and refreshes tokens with the configured provider. Built-in and user-configured clients can request different scopes. [OAuth flow](../internal/oauth2/flow.go) · [Build configuration](BUILD.md#build-develop-and-install)
- Configured contact and calendar sources can exchange data with their CardDAV, CalDAV, Google or Microsoft service, depending on the source and access granted. The provider receives changes when Milo writes to a remote source. [Extension authorization](EXTENSIONS.md#storage-and-authorization)
- Remote images are blocked by default in the message viewer. Loading them can contact the sender's or a third party's server. OpenPGP key discovery can contact external key services. [Message viewer](../frontend/src/lib/components/viewer/EmailBody.svelte) · [Key discovery](../internal/pgp/lookup.go)

## Diagnostics and data removal

The application source has no analytics or telemetry reporting integration. Diagnostic logging is local. A log file is opt-in and may include operational data such as URLs or account and message metadata. Review and redact logs before sharing them. [Logging implementation](../internal/logging/logging.go)

Removing local profile files affects local data and may discard unsynchronized drafts or changes. Provider data and credentials in the OS keyring are stored separately. For OAuth access removal, use the provider's authorization settings. [Profile and backup guidance](BUILD.md#existing-profiles)
