//go:build darwin

package platform

// ReadSystemTheme returns empty on macOS
func ReadSystemTheme() string {
	return string(SystemThemeNoPreference)
}
