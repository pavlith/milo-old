# Milo Keyboard Shortcuts

Keyboard reference for the native main window, composer and enabled extensions. [Mail handlers](../frontend/src/App.svelte) · [Shared key bindings](../frontend/src/lib/keyboard/shortcuts.ts)

## Global Shortcuts

These shortcuts apply to the main window outside modal dialogs and the inline composer.

| Shortcut | Action |
|----------|--------|
| `Ctrl+Q` | Quit application |
| `Ctrl+S` | Focus the active pane's search field where available |
| `Ctrl+Tab` | Switch to next extension on the rail (Mail / Contacts / ...) |
| `` Ctrl+` `` | Switch to previous extension on the rail |

### Pane Navigation

| Shortcut | Action |
|----------|--------|
| `Alt+Left` / `Alt+H` | Focus previous pane (viewer -> list -> sidebar) |
| `Alt+Right` / `Alt+L` | Focus next pane (sidebar -> list -> viewer) |

### Mail shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+N` | Compose a new message |
| `Ctrl+Shift+A` | Toggle synchronization of all accounts |
| `Ctrl+Shift+S` | Toggle synchronization of the selected folder |

### Folder Navigation

| Shortcut | Action |
|----------|--------|
| `Alt+Up` / `Alt+K` | Navigate to previous folder |
| `Alt+Down` / `Alt+J` | Navigate to next folder |
| `Alt+G` | Jump to top of sidebar (All Inboxes when present) |
| `Alt+Shift+G` | Jump to last visible folder (last account header if all trees are collapsed) |
| `Alt+Enter` | Expand or collapse the focused account or a folder with children |
| `Alt(L)+Alt(R)` | Open the selected folder's context menu |

### Message Actions (when message is selected/focused)

| Shortcut | Action |
|----------|--------|
| `Ctrl+R` | Reply to the focused message in the viewer, or to the last message in the open conversation |
| `Ctrl+Shift+R` | Reply all to the focused message in the viewer, or to the last message in the open conversation |
| `Ctrl+F` | Forward the focused message in the viewer, or the last message in the open conversation |
| `Ctrl+U` | Mark as read (keyboard-focused or checked messages) |
| `Ctrl+Shift+U` | Mark as unread (keyboard-focused or checked messages) |
| `Ctrl+K` | Archive (keyboard-focused or checked messages) |
| `Ctrl+J` | Mark as spam (keyboard-focused or checked messages) |
| `Ctrl+L` | Load remote images in viewed message |
| `Ctrl+Shift+L` | Open "Always Load Images" dropdown |
| `Shift+F` | Toggle focus mode for the message |

---

## Pane-Specific Shortcuts

These shortcuts depend on which pane is focused. They are disabled when typing in input fields.

### Sidebar (Folder List)

| Shortcut | Action |
|----------|--------|
| `Up` / `K` | Navigate to previous folder |
| `Down` / `J` | Navigate to next folder |
| `Alt+G` / `Alt+Shift+G` | Jump to top of sidebar / last visible folder |
| `Alt + Enter` / `Space` | Expand/collapse account (when account header is focused) |
| `Alt(L) + Alt(R)` | Open the selected folder's context menu |

### Message List

| Shortcut | Action |
|----------|--------|
| `Up` / `K` | Select previous conversation |
| `Down` / `J` | Select next conversation |
| `G` (lowercase) | Select + scroll to first conversation |
| `Shift+G` | Select + scroll to last loaded conversation (does not auto-load more) |
| `Shift+Up` / `Shift+K` | Select previous + toggle checkbox |
| `Shift+Down` / `Shift+J` | Select next + toggle checkbox |
| `Space` | Toggle checkbox on current conversation |
| `Enter` / `V` | Open selected conversation in viewer |
| `D` | Delete selected/checked message(s) — move to Trash (same as `Delete`) |
| `CTRL+A` | Select all messages in folder |
| `Alt+M` | Toggle "Move to folder" dialog for the focused message |
| `Alt+C` | Toggle "Copy to folder" dialog for the focused message |
| `Alt(R)` | Open the message-list context menu. The Context Menu key also works |

`G` / `Shift+G` / `V` also work in extension list panes (e.g., Contacts list, Calendar agenda).

### Conversation Viewer

| Shortcut | Action |
|----------|--------|
| `Up` / `K` | Scroll up |
| `Down` / `J` | Scroll down |
| `Tab` | Cycle through messages when focused on conversation viewer |
| `Delete` / `Backspace` | Delete focused message when focused on conversation viewer |
| `Ctrl + A` | Select all text of message in viewport |
| `Alt(R)` | Open the focused message's context menu. The Context Menu key also works |
| `F` | Toggles focus mode on the current thread (conversation) |

---

## Single-Key Shortcuts

These work when not in an input field. They apply to checked messages (bulk) or the keyboard-focused message in the list.

| Shortcut | Action |
|----------|--------|
| `S` | Toggle star |
| `Backspace` / `Delete` | Move to trash |
| `Shift+Backspace` / `Shift+Delete` | Permanently delete |
| `Escape` | Exit focus mode, dismiss a responsive overlay, clear checked rows or close the conversation, in that order |

---

## Composer Shortcuts

These apply when composing. Formatting keys apply in the rich-text editor. [Composer handler](../frontend/src/lib/components/composer/Composer.svelte)

| Shortcut | Action |
|----------|--------|
| `Ctrl+Enter` | Send message |
| `Alt+T` | Activate/Deactivate toolbar mode |
| `Alt+A` | Attach a file |
| `Alt+P` | Toggle PGP security mode (S = sign, E = encrypt) |
| `Alt+S` | Toggle S/MIME security mode (S = sign, E = encrypt) |
| `Ctrl+D` | Move the inline composer to a separate window |
| `Escape` | Close composer (prompts to save draft if unsaved) |

---

### Text Formatting

| Shortcut | Action |
|----------|--------|
| `Ctrl+B` | Bold |
| `Ctrl+I` | Italic |
| `Ctrl+U` | Underline |
| `Alt+T`  | Toggle toolbar and follow hint to choose |

---

## Behavior Notes

### Pane Focus Model

The UI has three panes with visual focus indication:
1. **Sidebar** - Account/folder list
2. **Message List** - Conversations in selected folder
3. **Conversation Viewer** - Selected conversation content

Clicking a pane focuses it. Focus is indicated by a subtle border flash animation.

### Folder Navigation

`Alt+Up/Down` navigates through all folders in visual order:
1. Unified Inbox (All Inboxes)
2. Individual account inboxes under Unified Inbox
3. Account 1 header
4. Account 1 folders (if expanded)
5. Account 2 header
6. Account 2 folders (if expanded)
7. ... and so on

Collapsed accounts show only their header (not folders) in navigation.

### Message Actions Hierarchy

Action shortcuts (Delete, Archive, Spam, Star, Read/Unread) follow this priority:

1. **Checked messages** - If any messages are checked (via Space or Shift+navigation), actions apply to ALL checked messages
2. **Keyboard-focused message** - Otherwise, actions apply to the message that's currently focused in the message list (the one with keyboard highlight from j/k navigation)
3. The message being viewed in the conversation pane is independent - you can navigate to and delete a different message without opening it first

With a message focused in the viewer, Delete and Backspace act on that message before list selection.

`Ctrl+Tab` and `` Ctrl+` `` cycle through Mail and enabled extensions. The main-window shortcuts pause when the inline composer owns keyboard input.

### Unified Inbox

When viewing Unified Inbox and replying:
- Reply uses the account associated with the selected message
- This ensures replies come from the correct email address

---

## Extensions

The active rail pane determines which actions run for shared shortcuts such as `Ctrl+N` and `Ctrl+Shift+A`. Pane-local shortcuts use the shared navigation predicates. [Calendar shortcuts](../extensions/calendar/frontend/keyboard/shortcuts.ts) · [Contacts shortcuts](../extensions/contacts/frontend/keyboard/shortcuts.ts)

### Calendar

**Navigation (pane cycling)**

| Shortcut | Action |
|----------|--------|
| `Alt+Left` / `Alt+H` | Focus previous pane |
| `Alt+Right` / `Alt+L` | Focus next pane |

**Date / view navigation**

| Shortcut | Action |
|----------|--------|
| `T` | Jump the calendar view to today |
| `←` | Previous view-unit (prev month / week / day) |
| `→` | Next view-unit (next month / week / day) |
| `Alt+M` | Switch to month view |
| `Alt+W` | Switch to week view |
| `Alt+D` | Switch to day view |
| `Alt+A` | Switch to agenda view |

**Actions**

| Shortcut | Action |
|----------|--------|
| `Ctrl+N` | Open the new-event composer |
| `Ctrl+R` | Sync all calendar sources |
| `Ctrl+Shift+A` | Sync all calendar sources (same chord as Mail's "sync all accounts" — fires whichever handler matches the active rail) |
| `F` | Toggle focus mode for the selected event |

> The calendar sidebar uses checkbox toggles per calendar (not single-select navigation), so it doesn't follow the kit's `J`/`K` row-cycling pattern. Clicking a checkbox or row in the sidebar toggles visibility.

### Contacts

**Sidebar navigation (works from any pane)**

Mirrors mail's "Folder Navigation" shortcuts. These fire regardless of which contacts pane currently has keyboard focus — so you can scroll through addressbooks while the list or detail pane is focused.

| Shortcut | Action |
|----------|--------|
| `Alt+Up` / `Alt+K` | Move to previous source / addressbook in the sidebar |
| `Alt+Down` / `Alt+J` | Move to next source / addressbook in the sidebar |

**Pane cycling**

| Shortcut | Action |
|----------|--------|
| `Alt+Left` / `Alt+H` | Focus previous pane (detail → list → sidebar) |
| `Alt+Right` / `Alt+L` | Focus next pane (sidebar → list → detail) |

**Actions**

| Shortcut | Action |
|----------|--------|
| `E` | Edit the currently-focused contact |
| `Ctrl+N` | Open the new-contact dialog (pre-targeted to the sidebar-focused addressbook; falls back to local when the focused source isn't writable) |
| `Ctrl+Shift+A` | Sync all contact sources (same chord as Mail's "sync all accounts" — fires whichever handler matches the active rail) |
| `Ctrl+Shift+S` | Sync the contact source currently focused in the sidebar (no-op with warning toast when a built-in entry like "All" / "Local" is focused) |

> Within a focused pane, `Up`/`K` and `Down`/`J` cycle rows (contact list, sidebar sources) and `Enter` opens / activates — same kit predicates Mail's list and folder tree use.
