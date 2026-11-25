#!/usr/bin/env python3
"""Check Wails appearance, legacy data, panes, Contacts, composer and mailto in an isolated profile."""

import argparse
from contextlib import contextmanager
import json
import os
from pathlib import Path
import select
import shlex
import signal
import sqlite3
import subprocess
import sys
from tempfile import TemporaryDirectory
from time import monotonic, sleep


ROOT = Path(__file__).resolve().parents[2]


def software_graphics():
    env = {**os.environ, "LIBGL_ALWAYS_SOFTWARE": "1"}
    mesa_vendor = Path("/usr/share/glvnd/egl_vendor.d/50_mesa.json")
    if mesa_vendor.is_file():
        env["__EGL_VENDOR_LIBRARY_FILENAMES"] = str(mesa_vendor)
    return env


@contextmanager
def run(*command, **options):
    with subprocess.Popen(command, start_new_session=True, **options) as process:
        try:
            yield process
        finally:
            if process.poll() is None:
                os.killpg(process.pid, signal.SIGTERM)
                try:
                    process.wait(timeout=5)
                except subprocess.TimeoutExpired:
                    os.killpg(process.pid, signal.SIGKILL)
                    process.wait(timeout=5)


@contextmanager
def virtual_display():
    read_fd, write_fd = os.pipe()
    with os.fdopen(read_fd, "r", encoding="ascii") as display_number:
        try:
            with run("Xvfb", "-displayfd", str(write_fd), "-screen", "0", "1440x1050x24",
                     "-nolisten", "tcp", "-extension", "GLX", pass_fds=(write_fd,),
                     env=software_graphics()):
                if not select.select([display_number], [], [], 10)[0]:
                    raise RuntimeError("Xvfb did not start")
                display = display_number.readline().strip()
                if not display.isdecimal():
                    raise RuntimeError("Xvfb did not report a display number")
                yield f":{display}"
        finally:
            os.close(write_fd)


def wait_for(check, description, seconds=12):
    deadline = monotonic() + seconds
    while monotonic() < deadline:
        result = check()
        if result:
            return result
        sleep(0.05)
    raise AssertionError(description)


class WebView:
    def __init__(self, directory, number=1):
        self.request = directory / f"{number}.js"
        self.response = self.request.with_suffix(".json")

    def evaluate(self, expression):
        self.response.unlink(missing_ok=True)
        pending = self.request.with_suffix(".pending")
        pending.write_text(f"JSON.stringify(({expression}) ?? null)", encoding="utf-8")
        pending.replace(self.request)
        wait_for(self.response.is_file, f"WebKit did not evaluate {expression}")
        return json.loads(self.response.read_text(encoding="utf-8"))

    def check(self, expression, description):
        wait_for(lambda: self.evaluate(expression), description)


def seed_profile(database):
    version = json.loads((ROOT / "frontend/package.json").read_text(encoding="utf-8"))["version"]
    with sqlite3.connect(database) as connection:
        connection.executemany(
            "INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)",
            {
                "terms_accepted": "true",
                "oauth_warning_disabled": "true",
                "last_seen_version": version,
                "language": "en",
                "theme_mode": "nord-dark",
                "autostart": "true",
                "composer_mode": "detached",
                "composer_format": "plain",
                "mailto_mode": "detached",
                "extension_contacts_enabled": "true",
            }.items(),
        )
        connection.execute("""
            INSERT INTO accounts (id, name, email, imap_host, imap_port, smtp_host, smtp_port, username, enabled)
            VALUES ('smoke', 'Fixture', 'smoke@example.invalid', '127.0.0.1', 1, '127.0.0.1', 1, 'smoke', 1)
        """)
        connection.execute("""
            INSERT INTO identities (id, account_id, name, email, is_default)
            VALUES ('smoke-identity', 'smoke', 'Fixture', 'smoke@example.invalid', 1)
        """)
        connection.execute("""
            INSERT INTO contact_records (id, source, kind, fn)
            VALUES ('smoke-contact', 'local', 'manual', 'Fixture Contact')
        """)
        connection.execute("""
            INSERT INTO contact_emails (record_id, email, is_primary)
            VALUES ('smoke-contact', 'contact@example.invalid', 1)
        """)


def check_contacts(main):
    contacts = "document.querySelector('nav button[aria-label=Contacts]')"
    mail = "document.querySelector('nav button[aria-label=Mail]')"
    fixture_visible = "document.querySelector('[role=listbox][aria-label=Contacts]')?.textContent.includes('Fixture Contact')"
    main.check(f"!!{contacts}", "The enabled Contacts extension should have a rail tab")
    main.evaluate(f"{contacts}.click()")
    main.check(fixture_visible, "Contacts should list the local fixture")
    main.evaluate("window.dispatchEvent(new KeyboardEvent('keydown', {key: 's', ctrlKey: true, cancelable: true}))")
    search = "document.querySelector('input[aria-label=\"Search contacts...\"]')"
    main.check(f"!!{search}", "Ctrl+S should open Contacts search")
    main.evaluate(f"""(() => {{
        const input = {search};
        input.value = 'no matching contacts';
        input.dispatchEvent(new Event('input', {{bubbles: true}}));
        {mail}.click();
    }})()""")
    main.check(f"!{search} && {mail}.getAttribute('aria-pressed') === 'true'",
               "The Mail tab should unmount Contacts")
    sleep(0.3)  # Allow the old 200 ms search to run if teardown failed to cancel it.
    main.evaluate(f"{contacts}.click()")
    main.check(fixture_visible, "A pending Contacts search should be canceled on unmount")
    main.evaluate(f"{mail}.click()")


def check_theme_change(main, composer):
    main.evaluate("document.querySelector('nav button[aria-label=Settings]').click()")
    main.check("document.querySelector('#appearance-theme')?.textContent.trim() === 'Dark'",
               "Appearance should show the migrated Dark setting")
    main.evaluate("document.querySelector('#appearance-theme').click()")
    main.check("Array.from(document.querySelectorAll('[role=option]')).some(option => option.textContent.trim() === 'System')",
               "The appearance picker should offer System mode")
    main.evaluate("Array.from(document.querySelectorAll('[role=option]')).find(option => option.textContent.trim() === 'Light').dispatchEvent(new PointerEvent('pointerup', {bubbles: true, pointerType: 'mouse'}))")
    light = "getComputedStyle(document.body).backgroundColor === 'rgb(255, 255, 255)'"
    main.check(light, "The appearance preview should switch the main window to Carbon White")
    assert composer.evaluate("document.documentElement.classList.contains('dark')"), "Preview must stay in the main window"
    main.evaluate("Array.from(document.querySelectorAll('[role=dialog] button')).find(button => button.textContent.trim() === 'Save').click()")
    composer.check(light, "The detached composer should switch to Light after Save")


def check_ui(binary, directory, display):
    library = directory / "webview_probe.so"
    webkit_flags = shlex.split(subprocess.check_output(
        ["pkg-config", "--cflags", "--libs", "webkitgtk-6.0"], text=True
    ))
    subprocess.run([
        "cc", "-shared", "-fPIC", str(Path(__file__).with_name("webview_probe.c")),
        "-o", str(library), *webkit_flags, "-ldl",
    ], check=True)
    runtime = directory / "runtime"
    runtime.mkdir(mode=0o700)
    env = {
        **software_graphics(),
        "DISPLAY": display,
        "GDK_BACKEND": "x11",
        "LANG": "C.UTF-8",
        "LC_ALL": "C.UTF-8",
        "LANGUAGE": "en",
        "XDG_CONFIG_HOME": str(directory / "config"),
        "XDG_DATA_HOME": str(directory / "data"),
        "XDG_CACHE_HOME": str(directory / "cache"),
        "XDG_RUNTIME_DIR": str(runtime),
        "TMPDIR": str(runtime),
        "DBUS_SESSION_BUS_ADDRESS": f"unix:path={runtime}/no-bus",
        "NO_AT_BRIDGE": "1",
        "GTK_USE_PORTAL": "0",
        "WEBKIT_DISABLE_DMABUF_RENDERER": "1",
        "WEBKIT_DISABLE_COMPOSITING_MODE": "1",
        "MILO_SMOKE_PROBE_DIR": str(directory),
        "LD_PRELOAD": str(library),
    }
    with (directory / "native.log").open("w", encoding="utf-8") as log:
        main = WebView(directory)
        with run(binary, env=env, stdout=log, stderr=log):
            main.check("!!document.querySelector('#agree-terms')", "A fresh profile should show Terms")
        data_home = directory / "data"
        database = data_home / "milo/milo.db"
        seed_profile(database)
        for file in database.parent.glob("milo.db*"):
            file.rename(file.with_name(file.name.replace("milo.db", "aerion.db", 1)))
        database.parent.rename(data_home / "aerion")
        autostart = directory / "config/autostart"
        autostart.mkdir(parents=True)
        legacy_launcher = autostart / "io.github.hkdb.Aerion.desktop"
        legacy_launcher.write_text("[Desktop Entry]\nName=Aerion\nExec=aerion\n", encoding="utf-8")

        with run(binary, env=env, stdout=log, stderr=log):
            check_contacts(main)
            assert not (data_home / "milo/milo.db").exists(), "Milo must use the existing profile"
            launcher = autostart / "io.github.pavlith.milo.desktop"
            wait_for(lambda: launcher.is_file() and not legacy_launcher.exists(),
                     "The old login launcher should be replaced after creating Milo's launcher")
            main.check("document.title === 'Milo' && getComputedStyle(document.body).backgroundColor === 'rgb(22, 22, 22)'",
                       "The old dark preference should open Milo with Carbon Gray 100")
            main.evaluate("document.fonts.load('400 13px Inter Variable', 'Mail Почта')")
            main.check("document.fonts.check('400 13px Inter Variable', 'Mail Почта') && "
                       "getComputedStyle(document.body).fontFamily.includes('Inter Variable') && "
                       "getComputedStyle(document.body).fontSize === '13px'",
                       "The UI should load the Latin and Cyrillic Inter faces at 13px")
            handle = "document.querySelector('[aria-label=\"Resize message list\"]')"
            main.check(f"!!{handle} && !document.querySelector('[role=dialog],[role=alertdialog]')",
                       "Mail should open with a keyboard-accessible list separator")
            result = main.evaluate(f"""(() => {{
                const handle = {handle};
                handle.focus();
                const before = handle.getBoundingClientRect().left;
                const key = new KeyboardEvent('keydown', {{key: 'ArrowRight', bubbles: true, cancelable: true}});
                handle.dispatchEvent(key);
                return {{before, prevented: key.defaultPrevented}};
            }})()""")
            assert result["prevented"], "PaneForge should consume its arrow keys"
            main.check(f"{handle}?.getBoundingClientRect().left > {result['before']} + 1",
                       "The consumed key should resize the list")
            assert main.evaluate(f"""(() => {{
                const handle = {handle};
                if (document.activeElement !== handle) return false;
                const key = new KeyboardEvent('keydown', {{key: 'n', ctrlKey: true, bubbles: true, cancelable: true}});
                handle.dispatchEvent(key);
                return key.defaultPrevented;
            }})()"""), "Ctrl+N should open a composer with the separator focused"
            composer = WebView(directory, 2)
            composer.check(
                "location.pathname.endsWith('/composer.html') && "
                "document.querySelector('.plaintext-editor')?.getBoundingClientRect().height > 0",
                "The detached composer should honor the saved Plain Text format",
            )

            check_theme_change(main, composer)

        with run(binary, env=env, stdout=log, stderr=log):
            main.check("!!document.querySelector('nav button[aria-label=Settings]') && "
                       "getComputedStyle(document.body).backgroundColor === 'rgb(255, 255, 255)'",
                       "The saved Light mode should survive restart")

        uri = "mailto:smoke@example.invalid?subject=Desktop%20fixture"
        with run(binary, uri, env=env, stdout=log, stderr=log):
            WebView(directory, 2).check(
                "location.pathname.endsWith('/composer.html') && "
                "document.querySelector('#composer-subject')?.value === 'Desktop fixture'",
                "A cold mailto launch should honor the detached mode and preserve its subject",
            )


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--binary", type=Path, default=ROOT / "build/bin/milo")
    args = parser.parse_args()
    with TemporaryDirectory(prefix="milo-smoke-") as profile, virtual_display() as display:
        directory = Path(profile)
        try:
            check_ui(args.binary.resolve(strict=True), directory, display)
        except (AssertionError, ValueError):
            log = directory / "native.log"
            if log.is_file():
                print("\n".join(log.read_text(encoding="utf-8", errors="replace").splitlines()[-20:]), file=sys.stderr)
            raise
    print("PASS: Legacy profile, Carbon themes, Inter, Contacts, PaneForge, detached composer and cold mailto")


if __name__ == "__main__":
    main()
