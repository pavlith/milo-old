# Milo security reporting

## Report a vulnerability

GitHub Private Vulnerability Reporting for [pavlith/milo](https://github.com/pavlith/milo/security) was disabled when checked on 2026-11-25. A dedicated Milo security contact has yet to be published.

If GitHub offers **Report a vulnerability** in the repository's Security advisories, use that private form. Otherwise, ask the maintainers for a private contact in a [GitHub issue](https://github.com/pavlith/milo/issues/new). Keep the public request limited to arranging contact. Share technical details, credentials, personal information and logs only as appropriate after a private channel is established. [GitHub reporting guidance](https://docs.github.com/en/code-security/how-tos/report-and-fix-vulnerabilities/report-privately)

For a private report, include the Milo revision, operating system, affected feature and impact. Use a test account and remove secrets and personal data from any example or diagnostic output.

## Security-related behavior

Milo uses OS keyring storage where available with an encrypted SQLite fallback for credentials. The viewer isolates HTML mail and blocks remote images by default. See [Privacy and local data](docs/PRIVACY.md) for local storage, network connections and diagnostic logs.
