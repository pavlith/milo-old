package platform

// SystemTheme represents the system's preferred color scheme
type SystemTheme string

const (
	SystemThemeLight        SystemTheme = "light"
	SystemThemeDark         SystemTheme = "dark"
	SystemThemeNoPreference SystemTheme = "" // No preference or unavailable
)
