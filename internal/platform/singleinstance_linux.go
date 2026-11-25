package platform

import (
	"bufio"
	"fmt"
	"net"
	"os"
	"path/filepath"
	"strings"
	"sync"
	"time"

	"github.com/pavlith/milo/internal/logging"
)

// linuxSingleInstanceLock uses a Unix socket for single-instance detection.
// The original socket is used when opening a legacy profile.
type linuxSingleInstanceLock struct {
	legacyProfile bool
	listener      net.Listener
	onShow        func(data string)
	pending       []string
	mu            sync.Mutex
	done          chan struct{}
}

// NewSingleInstanceLock creates a new single-instance lock.
func NewSingleInstanceLock(legacyProfile bool) SingleInstanceLock {
	return &linuxSingleInstanceLock{
		legacyProfile: legacyProfile,
		done:          make(chan struct{}),
	}
}

// TryLock attempts to acquire the single-instance lock.
// activateMsg is the command to send to an existing instance (e.g. "show" or "mailto:...").
func (l *linuxSingleInstanceLock) TryLock(activateMsg string) (bool, error) {
	log := logging.WithComponent("singleinstance")

	socketPath, err := l.buildSocketPath()
	if err != nil {
		return true, fmt.Errorf("failed to build socket path: %w", err)
	}

	// Try to listen on the socket (atomic — only one process succeeds)
	listener, err := net.Listen("unix", socketPath)
	if err == nil {
		// We are the first instance
		l.listener = listener
		go l.acceptLoop()
		log.Info().Str("socket", socketPath).Msg("Single-instance lock acquired")
		return true, nil
	}

	// Listen failed — try to activate the existing instance
	conn, dialErr := net.DialTimeout("unix", socketPath, 2*time.Second)
	if dialErr == nil {
		// Existing instance is alive — send activation command
		_, _ = conn.Write([]byte(activateMsg + "\n"))
		conn.Close()
		log.Info().Str("command", activateMsg).Msg("Activated existing instance")
		return false, nil
	}

	// Socket exists but no one is listening — stale socket, remove and retry
	log.Warn().Msg("Stale instance socket found, removing")
	os.Remove(socketPath)

	listener, err = net.Listen("unix", socketPath)
	if err != nil {
		return true, fmt.Errorf("failed to acquire lock after cleanup: %w", err)
	}

	l.listener = listener
	go l.acceptLoop()
	log.Info().Str("socket", socketPath).Msg("Single-instance lock acquired after cleanup")
	return true, nil
}

// SetOnShow sets the callback invoked when a second instance sends a command.
func (l *linuxSingleInstanceLock) SetOnShow(fn func(data string)) {
	l.mu.Lock()
	l.onShow = fn
	pending := l.pending
	l.pending = nil
	l.mu.Unlock()
	for _, command := range pending {
		fn(command)
	}
}

// Unlock releases the lock and cleans up resources.
func (l *linuxSingleInstanceLock) Unlock() {
	close(l.done)
	if l.listener != nil {
		l.listener.Close()
	}
}

// acceptLoop handles incoming connections from second instances.
func (l *linuxSingleInstanceLock) acceptLoop() {
	log := logging.WithComponent("singleinstance")

	for {
		conn, err := l.listener.Accept()
		if err != nil {
			select {
			case <-l.done:
				return
			default:
				log.Debug().Err(err).Msg("Accept error")
				return
			}
		}
		go l.handleConnection(conn)
	}
}

// handleConnection reads the command from a second instance.
func (l *linuxSingleInstanceLock) handleConnection(conn net.Conn) {
	defer conn.Close()
	log := logging.WithComponent("singleinstance")

	_ = conn.SetReadDeadline(time.Now().Add(2 * time.Second))
	scanner := bufio.NewScanner(conn)
	// Include room for the newline after a 2 KB mailto URL.
	scanner.Buffer(make([]byte, 2049), 2049)
	if !scanner.Scan() {
		return
	}

	cmd := scanner.Text()
	// Command allowlist: only accept "show" or "mailto:..." — reject everything else
	if cmd != "show" && !strings.HasPrefix(cmd, "mailto:") {
		log.Warn().Str("cmd", cmd).Msg("Rejected unknown command from second instance")
		return
	}

	l.mu.Lock()
	fn := l.onShow
	if fn == nil && len(l.pending) < 16 {
		// GTK and the main WebView can still be starting up.
		l.pending = append(l.pending, cmd)
	}
	l.mu.Unlock()

	if fn == nil {
		return
	}

	log.Info().Str("command", cmd).Msg("Command received from second instance")
	fn(cmd)
}

// buildSocketPath returns the path for the instance lock socket.
func (l *linuxSingleInstanceLock) buildSocketPath() (string, error) {
	uid := os.Getuid()
	name := appName
	if l.legacyProfile {
		name = legacyAppName
	}
	socketDir := filepath.Join(os.TempDir(), fmt.Sprintf("%s-%d", name, uid))

	if err := os.MkdirAll(socketDir, 0700); err != nil {
		return "", fmt.Errorf("failed to create socket directory: %w", err)
	}

	return filepath.Join(socketDir, "instance.sock"), nil
}
