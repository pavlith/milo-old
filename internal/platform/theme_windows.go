//go:build windows

package platform

// ReadSystemTheme returns empty on Windows
func ReadSystemTheme() string {
	return string(SystemThemeNoPreference)
}
