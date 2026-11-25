#define _GNU_SOURCE
#include <dlfcn.h>
#include <glib/gstdio.h>
#include <webkit/webkit.h>

/* Loaded by the smoke runner into its isolated Wails process. Requests and
 * responses stay in the runner's private temporary directory. */
static void save_result(GObject *view, GAsyncResult *result, gpointer path) {
    GError *error = NULL;
    JSCValue *value = webkit_web_view_evaluate_javascript_finish(WEBKIT_WEB_VIEW(view), result, &error);
    gchar *output = value ? jsc_value_to_string(value) : g_strdup(error ? error->message : "No result");
    g_file_set_contents(path, output, -1, NULL);
    g_free(path);
    g_free(output);
    g_clear_object(&value);
    g_clear_error(&error);
}

static gboolean read_request(gpointer data) {
    WebKitWebView *view = data;
    guint id = GPOINTER_TO_UINT(g_object_get_data(G_OBJECT(view), "smoke-view-id"));
    const gchar *dir = g_getenv("AERION_SMOKE_PROBE_DIR");
    gchar *request = g_strdup_printf("%s/%u.js", dir, id);
    gchar *script = NULL;
    if (g_file_get_contents(request, &script, NULL, NULL)) {
        g_unlink(request);
        gchar *response = g_strdup_printf("%s/%u.json", dir, id);
        webkit_web_view_evaluate_javascript(view, script, -1, NULL, NULL, NULL, save_result, response);
        g_free(script);
    }
    g_free(request);
    return G_SOURCE_CONTINUE;
}

static void stop_polling(gpointer timer, GObject *view) {
    (void)view;
    g_source_remove(GPOINTER_TO_UINT(timer));
}

void webkit_web_view_set_background_color(WebKitWebView *view, const GdkRGBA *color) {
    static guint next_id;
    void (*set_color)(WebKitWebView *, const GdkRGBA *) =
        dlsym(RTLD_NEXT, "webkit_web_view_set_background_color");
    set_color(view, color);

    if (g_getenv("AERION_SMOKE_PROBE_DIR") && !g_object_get_data(G_OBJECT(view), "smoke-view-id")) {
        g_object_set_data(G_OBJECT(view), "smoke-view-id", GUINT_TO_POINTER(++next_id));
        guint timer = g_timeout_add(30, read_request, view);
        g_object_weak_ref(G_OBJECT(view), stop_polling, GUINT_TO_POINTER(timer));
    }
}
