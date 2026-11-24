import { Browser, Clipboard, Events, Window } from '@wailsio/runtime'

// Deliver the event's application payload to Svelte subscribers.
export function EventsOn<T>(name: string, listener: (data: T) => void): () => void {
  return Events.On(name, event => listener(event.data))
}

export const EventsOff = Events.Off
export const BrowserOpenURL = Browser.OpenURL
export const WindowShow = () => Window.Show()
export const WindowHide = () => Window.Hide()
export const WindowMinimise = () => Window.Minimise()
export const WindowToggleMaximise = () => Window.ToggleMaximise()
export const WindowSetTitle = (title: string) => Window.SetTitle(title)

export { Clipboard }
