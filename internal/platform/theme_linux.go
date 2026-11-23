//go:build linux

package platform

import (
	"fmt"

	"github.com/godbus/dbus/v5"
)

const (
	portalDest     = "org.freedesktop.portal.Desktop"
	portalPath     = "/org/freedesktop/portal/desktop"
	settingsIface  = "org.freedesktop.portal.Settings"
	appearanceNS   = "org.freedesktop.appearance"
	colorSchemeKey = "color-scheme"
)

// parseColorScheme unwraps a D-Bus variant containing the color-scheme value.
// The portal can return the uint32 wrapped in a second variant.
func parseColorScheme(v dbus.Variant) (SystemTheme, error) {
	inner := v.Value()

	// Unwrap nested variant if present (from Read method)
	if innerVariant, ok := inner.(dbus.Variant); ok {
		inner = innerVariant.Value()
	}

	val, ok := inner.(uint32)
	if !ok {
		return SystemThemeNoPreference, fmt.Errorf("unexpected color-scheme type: %T", inner)
	}

	// 0 = no preference, 1 = prefer dark, 2 = prefer light
	switch val {
	case 1:
		return SystemThemeDark, nil
	case 2:
		return SystemThemeLight, nil
	default:
		return SystemThemeLight, nil
	}
}

// ReadSystemTheme performs a one-shot read of the system color-scheme
// from the XDG Settings Portal.
func ReadSystemTheme() string {
	conn, err := dbus.ConnectSessionBus()
	if err != nil {
		return string(SystemThemeNoPreference)
	}
	defer conn.Close()

	obj := conn.Object(portalDest, dbus.ObjectPath(portalPath))
	call := obj.Call(settingsIface+".Read", 0, appearanceNS, colorSchemeKey)
	if call.Err != nil {
		return string(SystemThemeNoPreference)
	}

	var outerVariant dbus.Variant
	if err := call.Store(&outerVariant); err != nil {
		return string(SystemThemeNoPreference)
	}

	theme, err := parseColorScheme(outerVariant)
	if err != nil {
		return string(SystemThemeNoPreference)
	}
	return string(theme)
}
