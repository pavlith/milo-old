//go:build linux

package platform

/*
#cgo pkg-config: gtk4
#include <gdk/gdk.h>
#include <glib.h>

static gboolean notify_startup_complete_cb(gpointer data) {
	GdkDisplay *display = gdk_display_get_default();
	if (display != NULL) gdk_display_notify_startup_complete(display, NULL);
	return G_SOURCE_REMOVE;
}

static void schedule_notify_startup_complete() {
	g_idle_add(notify_startup_complete_cb, NULL);
}
*/
import "C"

// NotifyStartupComplete tells the desktop environment that the application
// has finished starting up, clearing the busy cursor. Uses g_idle_add to
// dispatch to the GTK main thread since this may be called from a goroutine.
func NotifyStartupComplete() {
	C.schedule_notify_startup_complete()
}
