package app

import (
	"context"
	"fmt"

	"github.com/pavlith/milo/internal/smtp"
	"github.com/wailsapp/wails/v3/pkg/application"
	"github.com/wailsapp/wails/v3/pkg/events"
)

// ComposeMode identifies the message or draft opened in a composer.
type ComposeMode struct {
	AccountID string `json:"accountId"`
	Mode      string `json:"mode"`
	MessageID string `json:"messageId"`
	DraftID   string `json:"draftId"`
}

type composerWindow struct {
	window     *application.WebviewWindow
	mode       ComposeMode
	mailto     *MailtoData
	allowClose bool
}

// OpenComposerWindow opens a native window using the shared mail service.
func (a *App) OpenComposerWindow(accountID, mode, messageID, draftID, mailtoURL string) error {
	if !a.ready.Load() || a.shuttingDown.Load() {
		return fmt.Errorf("mail service is unavailable")
	}
	if accountID == "" {
		return fmt.Errorf("a composer requires an account")
	}
	switch mode {
	case "", "new":
		mode = "new"
	case "reply", "reply-all", "forward":
		if messageID == "" && draftID == "" {
			return fmt.Errorf("a reply or forward requires a message")
		}
	default:
		return fmt.Errorf("unknown compose mode %q", mode)
	}
	nativeTitleBar, _ := a.settingsStore.GetNativeTitleBar()

	// Window creation can dispatch onto GTK. Keep native calls outside the map lock.
	if draftID != "" {
		a.composersMu.Lock()
		for _, existing := range a.composers {
			if existing.mode.DraftID == draftID {
				a.composersMu.Unlock()
				existing.window.Show()
				existing.window.Focus()
				return nil
			}
		}
		a.composersMu.Unlock()
	}

	window := application.Get().Window.NewWithOptions(application.WebviewWindowOptions{
		Title: "Milo", URL: "/composer.html",
		Width: 800, Height: 600, MinWidth: 500, MinHeight: 400,
		Frameless: !nativeTitleBar, Hidden: true,
		BackgroundColour: application.NewRGB(22, 22, 22),
	})
	composer := &composerWindow{
		window: window, mode: ComposeMode{AccountID: accountID, Mode: mode, MessageID: messageID, DraftID: draftID},
		mailto: ParseMailtoURL(mailtoURL),
	}
	a.composersMu.Lock()
	if a.composers == nil {
		a.composers = make(map[uint]*composerWindow)
	}
	a.composers[window.ID()] = composer
	a.composersMu.Unlock()

	window.RegisterHook(events.Common.WindowClosing, func(event *application.WindowEvent) {
		a.composersMu.Lock()
		allowed := composer.allowClose || a.shuttingDown.Load()
		if allowed {
			delete(a.composers, window.ID())
		}
		quit := allowed && a.quitAfterComposers && len(a.composers) == 0
		a.composersMu.Unlock()
		if !allowed {
			event.Cancel()
			window.EmitEvent("composer:close")
		}
		if quit {
			go a.quit()
		}
	})
	return nil
}

func (a *App) composerFor(ctx context.Context) (*composerWindow, error) {
	if window := callerWindow(ctx); window != nil {
		a.composersMu.Lock()
		composer := a.composers[window.ID()]
		a.composersMu.Unlock()
		if composer != nil {
			return composer, nil
		}
	}
	return nil, fmt.Errorf("this window has no composer")
}

// GetComposeMode returns the opening parameters of the calling composer.
func (a *App) GetComposeMode(ctx context.Context) (ComposeMode, error) {
	composer, err := a.composerFor(ctx)
	if err != nil {
		return ComposeMode{}, err
	}
	return composer.mode, nil
}

// PrepareComposer loads the draft, reply, forward, or mailto data for the caller.
func (a *App) PrepareComposer(ctx context.Context) (*smtp.ComposeMessage, error) {
	composer, err := a.composerFor(ctx)
	if err != nil {
		return nil, err
	}
	mode := composer.mode
	if mode.DraftID != "" {
		return a.GetDraft(mode.DraftID)
	}
	if mode.Mode != "new" {
		return a.PrepareReply(mode.MessageID, mode.Mode)
	}
	acc, err := a.accountStore.Get(mode.AccountID)
	if err != nil {
		return nil, err
	}
	if acc == nil {
		return nil, fmt.Errorf("composer account not found")
	}
	msg := &smtp.ComposeMessage{From: smtp.Address{Address: acc.Email, Name: acc.Name}}
	identities, _ := a.accountStore.GetIdentities(mode.AccountID)
	for i, identity := range identities {
		if i == 0 || identity.IsDefault {
			msg.From = smtp.Address{Address: identity.Email, Name: identity.Name}
		}
		if identity.IsDefault {
			break
		}
	}
	if data := composer.mailto; data != nil {
		for _, address := range data.To {
			msg.To = append(msg.To, smtp.Address{Address: address})
		}
		for _, address := range data.Cc {
			msg.Cc = append(msg.Cc, smtp.Address{Address: address})
		}
		for _, address := range data.Bcc {
			msg.Bcc = append(msg.Bcc, smtp.Address{Address: address})
		}
		msg.Subject, msg.TextBody = data.Subject, data.Body
	}
	return msg, nil
}

// FinishComposer closes the calling window after the editor has handled its draft.
func (a *App) FinishComposer(ctx context.Context) error {
	composer, err := a.composerFor(ctx)
	if err != nil {
		return err
	}
	a.composersMu.Lock()
	composer.allowClose = true
	a.composersMu.Unlock()
	composer.window.Close()
	return nil
}

// KeepComposerOpen cancels a requested application quit.
func (a *App) KeepComposerOpen(ctx context.Context) error {
	if _, err := a.composerFor(ctx); err != nil {
		return err
	}
	a.composersMu.Lock()
	a.quitAfterComposers = false
	a.composersMu.Unlock()
	return nil
}
