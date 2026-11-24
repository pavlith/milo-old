package app

import (
	"os"
	"os/signal"
	"syscall"

	"github.com/hkdb/aerion/internal/logging"
)

func (a *App) watchTerminationSignals() {
	ch := make(chan os.Signal, 1)
	signal.Notify(ch, syscall.SIGTERM, syscall.SIGINT, syscall.SIGHUP)
	go func() {
		defer signal.Stop(ch)
		select {
		case sig := <-ch:
			log := logging.WithComponent("app")
			log.Info().Str("signal", sig.String()).Msg("Termination signal received")
			a.quit()
		case <-a.ctx.Done():
		}
	}()
}
