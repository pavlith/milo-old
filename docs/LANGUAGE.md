# UI translations

Milo ships English (`en`) and Russian (`ru`) UI catalogs. With no saved preference, the application uses Russian when the WebView reports a Russian system locale (for example, `ru-RU`). Otherwise it uses English. An unsupported saved code falls back to English.

To change languages, open **Settings → General → Language**, select **English** or **Русский**, and save. The main window and open detached composers update immediately. The choice survives restart and applies to new composer windows.

## Catalogs

| UI | Catalog directory |
| --- | --- |
| Mail and shared UI | `frontend/src/lib/i18n/locales/` |
| Contacts | `extensions/contacts/frontend/i18n/locales/` |
| Calendar | `extensions/calendar/frontend/i18n/locales/` |

Use `en.json` as the source of truth. Add or update the corresponding value in `ru.json` in the same change. Preserve the keys, value types, interpolation names, ICU syntax, HTML and functional identifiers. Move named parameters as needed for natural word order. For example, `"saved": "Saved {filename}"` becomes `"saved": "Файл «{filename}» сохранён"`.

Keep visible error messages concise and actionable. Preserve shortcut names such as `Ctrl+Enter`, and write short labels for dialogs, tabs and menus. Use `date-fns` with the active UI locale for shared date formatting and pass that locale to browser date formatters.

Extensions register their own `en` and `ru` loaders. The shared frontend auto-discovers extension registrars and merges their messages under each extension's namespace. See [extension i18n](EXTENSIONS.md#extension-i18n).

## Verification

From `frontend/`, run `npm run check:locales`. It checks JSON and catalog structure, parses messages in the same ICU mode as the runtime, compares interpolation parameters, and checks which catalogs are registered and referenced. `npm run check` also runs the validator, including in CI.

Review the affected screens in both languages. Check long labels and interpolated messages at a narrow window width. Verify the detached composer when touching shared translations or language selection.

## Desktop metadata and spellcheck

The [Linux launcher](../build/linux/io.github.pavlith.milo.desktop) uses English base strings and `[ru]` entries. Validate changes with `desktop-file-validate`.

Spellcheck dictionaries are selected separately under **Settings → Composer**. Current dictionaries include US and UK English, Czech, German, French, Italian, Norwegian Bokmål, Dutch and Turkish. The Russian interface uses English spellcheck by default when no dictionaries are selected. A Russian dictionary is currently unavailable.
