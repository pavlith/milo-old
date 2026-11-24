//go:build !linux

package platform

import "fmt"

func PortalOpenURI(uri string) error {
	return fmt.Errorf("portal not supported on this platform")
}
