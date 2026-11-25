//go:build linux

package platform

import (
	"fmt"

	"github.com/godbus/dbus/v5"
	"github.com/pavlith/milo/internal/logging"
)

// PortalOpenURI opens a URL using the desktop portal.
func PortalOpenURI(uri string) error {
	log := logging.WithComponent("filechooser")

	conn, err := dbus.SessionBus()
	if err != nil {
		return fmt.Errorf("failed to connect to session bus: %w", err)
	}

	var hasOwner bool
	if err := conn.BusObject().Call("org.freedesktop.DBus.NameHasOwner", 0, "org.freedesktop.portal.Desktop").Store(&hasOwner); err != nil || !hasOwner {
		return fmt.Errorf("portal service not available")
	}

	obj := conn.Object("org.freedesktop.portal.Desktop", "/org/freedesktop/portal/desktop")
	options := map[string]dbus.Variant{}
	call := obj.Call("org.freedesktop.portal.OpenURI.OpenURI", 0, "", uri, options)
	if call.Err != nil {
		return fmt.Errorf("OpenURI portal call failed: %w", call.Err)
	}

	log.Debug().Str("uri", uri).Msg("Opened URI via portal")
	return nil
}
