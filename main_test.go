package main

import (
	"os"
	"testing"
)

func TestDebugModeDefault(t *testing.T) {
	// Ensure the env var is not set so we only test the default flag value
	t.Setenv("MILO_DEBUG", "")

	if DebugMode() {
		t.Error("DebugMode() = true, want false by default")
	}
}

func TestDebugModeEnvVar(t *testing.T) {
	t.Setenv("MILO_DEBUG", "1")

	if !DebugMode() {
		t.Error("DebugMode() = false, want true when MILO_DEBUG=1")
	}

	// Verify env var was actually set (sanity check)
	if os.Getenv("MILO_DEBUG") != "1" {
		t.Error("MILO_DEBUG env var not set correctly")
	}
}
