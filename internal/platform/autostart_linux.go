package platform

import (
	"fmt"
	"os"
	"path/filepath"

	"github.com/pavlith/milo/internal/logging"
)

const (
	autostartFilename = "io.github.pavlith.milo.desktop"
	desktopEntryTmpl  = `[Desktop Entry]
Type=Application
Name=Milo
Comment=Milo Email Client
Exec=%s
Icon=io.github.pavlith.milo
Terminal=false
Categories=Network;Email;
X-GNOME-Autostart-enabled=true
`
)

type linuxAutostartManager struct{}

func NewAutostartManager(migrateLegacy bool) AutostartManager {
	manager := &linuxAutostartManager{}
	if migrateLegacy {
		if err := manager.migrateLegacyEntry(); err != nil {
			log := logging.WithComponent("autostart")
			log.Warn().Err(err).Msg("Could not migrate the previous login launcher")
		}
	}
	return manager
}

func (m *linuxAutostartManager) migrateLegacyEntry() error {
	dir, err := m.autostartDir()
	if err != nil {
		return err
	}
	legacy := filepath.Join(dir, "io.github.hkdb.Aerion.desktop")
	if _, err := os.Stat(legacy); err != nil {
		if os.IsNotExist(err) {
			return nil
		}
		return err
	}
	if !m.IsEnabled() {
		if err := m.Enable(); err != nil {
			return err
		}
	}
	return os.Remove(legacy)
}

func (m *linuxAutostartManager) Enable() error {
	log := logging.WithComponent("autostart")

	dir, err := m.autostartDir()
	if err != nil {
		return err
	}

	if err := os.MkdirAll(dir, 0755); err != nil {
		return fmt.Errorf("failed to create autostart directory: %w", err)
	}

	execCmd := m.execCommand()
	content := fmt.Sprintf(desktopEntryTmpl, execCmd)

	path := filepath.Join(dir, autostartFilename)
	if err := os.WriteFile(path, []byte(content), 0644); err != nil {
		return fmt.Errorf("failed to write autostart file: %w", err)
	}

	log.Info().Str("path", path).Msg("Autostart enabled")
	return nil
}

// Disable removes the autostart .desktop file.
func (m *linuxAutostartManager) Disable() error {
	log := logging.WithComponent("autostart")

	dir, err := m.autostartDir()
	if err != nil {
		return err
	}

	path := filepath.Join(dir, autostartFilename)
	if err := os.Remove(path); err != nil && !os.IsNotExist(err) {
		return fmt.Errorf("failed to remove autostart file: %w", err)
	}

	log.Info().Str("path", path).Msg("Autostart disabled")
	return nil
}

// IsEnabled checks if the autostart .desktop file exists.
func (m *linuxAutostartManager) IsEnabled() bool {
	dir, err := m.autostartDir()
	if err != nil {
		return false
	}

	path := filepath.Join(dir, autostartFilename)
	_, err = os.Stat(path)
	return err == nil
}

// autostartDir returns the XDG autostart directory.
func (m *linuxAutostartManager) autostartDir() (string, error) {
	configDir := os.Getenv("XDG_CONFIG_HOME")
	if configDir == "" {
		home, err := os.UserHomeDir()
		if err != nil {
			return "", fmt.Errorf("failed to get home directory: %w", err)
		}
		configDir = filepath.Join(home, ".config")
	}
	return filepath.Join(configDir, "autostart"), nil
}

// execCommand returns the path to the current executable.
func (m *linuxAutostartManager) execCommand() string {
	exe, err := os.Executable()
	if err != nil {
		return "milo"
	}
	return exe
}
