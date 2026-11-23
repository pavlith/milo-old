// waitForRuntime resolves when Wails has injected `window.runtime` into the
// page. In dev mode (Vite-served bundle), injection happens AFTER the bundle
// script begins executing, so a naive `window.runtime.X()` call at module
// top throws. Poll for up to two seconds; if the runtime never appears,
// resolve anyway and let downstream calls fail loudly with their own errors
// rather than wedging here forever.
export function waitForRuntime(): Promise<void> {
  return new Promise<void>((resolve) => {
    const startedAt = performance.now()
    function check() {
      const w = window as unknown as { runtime?: { WindowShow?: unknown } }
      if (w.runtime?.WindowShow) {
        resolve()
        return
      }
      if (performance.now() - startedAt > 2000) {
        console.warn('[boot] Wails runtime never injected after 2s; proceeding anyway.')
        resolve()
        return
      }
      // The detached composer is still hidden during bootstrap.
      setTimeout(check, 16)
    }
    check()
  })
}
