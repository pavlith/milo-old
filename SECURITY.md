# Milo security reporting

## Report a vulnerability

Sign in to GitHub and submit security findings through Milo's private vulnerability reporting form. Keep vulnerability details out of public issues and discussions. [Report a vulnerability privately](https://github.com/pavlith/milo/security/advisories/new)

For a private report, include the Milo revision, operating system, affected feature and impact. Use a test account and remove secrets and personal data from any example or diagnostic output.

## Security-related behavior

Milo uses OS keyring storage where available with an encrypted SQLite fallback for credentials. The viewer isolates HTML mail and blocks remote images by default. See [Privacy and local data](docs/PRIVACY.md) for local storage, network connections and diagnostic logs.
