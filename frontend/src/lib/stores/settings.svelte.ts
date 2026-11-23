// Runes-based settings store
// Provides reactive state for application settings

// @ts-ignore - wailsjs path
import { GetMessageListDensity, GetMessageListSortOrder, GetShowTitleBar, GetRunBackground, GetStartHidden, GetAutostart, GetComposerMode, GetMailtoMode, GetComposerFormat, GetNativeTitleBar, GetAlwaysLoadImages, GetDarkMailContent, GetDarkComposerBody, GetAccentBarUnread, GetAccentUnreadStyle, GetShowMessageListCircles, GetShowMessageListProfilePics, GetAlwaysShowMessageCheckbox, GetShowViewerCircles, GetSpellcheckEnabled, GetSpellcheckLanguages, GetSpellcheckCustomWords } from '../../../wailsjs/go/app/App'
import { applyTheme, DEFAULT_THEME_MODE, normalizeThemeMode, type ThemeMode } from './theme.svelte'

export type ComposerMode = 'inline' | 'detached'
export type ComposerFormat = 'rich' | 'plain'
export type MessageListDensity = 'micro' | 'compact' | 'standard' | 'large'
export type MessageListSortOrder = 'newest' | 'oldest'
// Module-level reactive state
let messageListDensity = $state<MessageListDensity>('standard')
let messageListSortOrder = $state<MessageListSortOrder>('newest')
let themeMode = $state<ThemeMode>(DEFAULT_THEME_MODE)
let showTitleBar = $state<boolean>(true)
let runBackground = $state<boolean>(false)
let startHidden = $state<boolean>(false)
let autostart = $state<boolean>(false)
let spellcheckEnabled = $state<boolean>(true)
let spellcheckLanguages = $state<string[]>([])
let spellcheckCustomWords = $state<string[]>([])
let composerMode = $state<ComposerMode>('inline')
let mailtoMode = $state<ComposerMode>('inline')
let composerFormat = $state<ComposerFormat>('rich')
let nativeTitleBar = $state<boolean>(false)
let alwaysLoadImages = $state<boolean>(false)
let darkMailContent = $state<boolean>(false)
let darkComposerBody = $state<boolean>(false)
let accentBarUnread = $state<boolean>(false)
let accentUnreadStyle = $state<string>('dot')
let showMessageListCircles = $state<boolean>(true)
let showMessageListProfilePics = $state<boolean>(false)
let alwaysShowMessageCheckbox = $state<boolean>(false)
let showViewerCircles = $state<boolean>(true)

// Getter functions to access the state
export function getMessageListDensity(): MessageListDensity {
  return messageListDensity
}

export function getMessageListSortOrder(): MessageListSortOrder {
  return messageListSortOrder
}

export function getThemeMode(): ThemeMode {
  return themeMode
}

export function getShowTitleBar(): boolean {
  return showTitleBar
}

export function getRunBackground(): boolean {
  return runBackground
}

export function getStartHidden(): boolean {
  return startHidden
}

export function getAutostart(): boolean {
  return autostart
}

export function getSpellcheckEnabled(): boolean {
  return spellcheckEnabled
}

export function getSpellcheckLanguages(): string[] {
  return spellcheckLanguages
}

export function getSpellcheckCustomWords(): string[] {
  return spellcheckCustomWords
}

export function getComposerMode(): ComposerMode {
  return composerMode
}

export function getMailtoMode(): ComposerMode {
  return mailtoMode
}

export function getComposerFormat(): ComposerFormat {
  return composerFormat
}

export function getNativeTitleBar(): boolean {
  return nativeTitleBar
}

export function getAlwaysLoadImages(): boolean {
  return alwaysLoadImages
}

export function getDarkMailContent(): boolean {
  return darkMailContent
}

export function getDarkComposerBody(): boolean {
  return darkComposerBody
}

export function getAccentBarUnread(): boolean {
  return accentBarUnread
}

export function getAccentUnreadStyle(): string {
  return accentUnreadStyle
}

export function getShowMessageListCircles(): boolean {
  return showMessageListCircles
}

export function getShowMessageListProfilePics(): boolean {
  return showMessageListProfilePics
}

export function getAlwaysShowMessageCheckbox(): boolean {
  return alwaysShowMessageCheckbox
}

export function getShowViewerCircles(): boolean {
  return showViewerCircles
}

// Setter functions to update the state
export function setMessageListDensity(density: MessageListDensity) {
  messageListDensity = density
}

export function setMessageListSortOrder(sortOrder: MessageListSortOrder) {
  messageListSortOrder = sortOrder
}

export function setThemeMode(mode: unknown) {
  themeMode = normalizeThemeMode(mode)
  applyTheme(themeMode)
}

export function setShowTitleBar(show: boolean) {
  showTitleBar = show
}

export function setRunBackground(v: boolean) {
  runBackground = v
}

export function setStartHidden(v: boolean) {
  startHidden = v
}

export function setAutostart(v: boolean) {
  autostart = v
}

export function setSpellcheckEnabled(v: boolean) {
  spellcheckEnabled = v
}

export function setSpellcheckLanguages(v: string[]) {
  spellcheckLanguages = v
}

export function setSpellcheckCustomWords(v: string[]) {
  spellcheckCustomWords = v
}

export function setComposerMode(mode: ComposerMode) {
  composerMode = mode
}

export function setMailtoMode(mode: ComposerMode) {
  mailtoMode = mode
}

export function setComposerFormat(format: ComposerFormat) {
  composerFormat = format
}

export function setNativeTitleBar(v: boolean) {
  nativeTitleBar = v
}

export function setAlwaysLoadImages(v: boolean) {
  alwaysLoadImages = v
}

export function setDarkMailContent(v: boolean) {
  darkMailContent = v
}

export function setDarkComposerBody(v: boolean) {
  darkComposerBody = v
}

export function setAccentBarUnread(v: boolean) {
  accentBarUnread = v
}

export function setAccentUnreadStyle(v: string) {
  accentUnreadStyle = v
}

export function setShowMessageListCircles(v: boolean) {
  showMessageListCircles = v
}

export function setShowMessageListProfilePics(v: boolean) {
  showMessageListProfilePics = v
}

export function setAlwaysShowMessageCheckbox(v: boolean) {
  alwaysShowMessageCheckbox = v
}

export function setShowViewerCircles(v: boolean) {
  showViewerCircles = v
}

// Load settings from backend (call on app startup)
export async function loadSettings(): Promise<void> {
  try {
    const [density, sortOrder, titleBar, runBg, startHid, autoSt, compMode, mailMode, compFormat, nativeTB, alwaysImages, darkMail, darkComposer, accentBar, accentStyle, listCircles, listProfilePics, alwaysCheckbox, viewerCircles, scEnabled, scLangs, scWords] = await Promise.all([
      GetMessageListDensity(),
      GetMessageListSortOrder(),
      GetShowTitleBar(),
      GetRunBackground(),
      GetStartHidden(),
      GetAutostart(),
      GetComposerMode(),
      GetMailtoMode(),
      GetComposerFormat(),
      GetNativeTitleBar(),
      GetAlwaysLoadImages(),
      GetDarkMailContent(),
      GetDarkComposerBody(),
      GetAccentBarUnread(),
      GetAccentUnreadStyle(),
      GetShowMessageListCircles(),
      GetShowMessageListProfilePics(),
      GetAlwaysShowMessageCheckbox(),
      GetShowViewerCircles(),
      GetSpellcheckEnabled(),
      GetSpellcheckLanguages(),
      GetSpellcheckCustomWords(),
    ])
    messageListDensity = (density as MessageListDensity) || 'standard'
    messageListSortOrder = (sortOrder as MessageListSortOrder) || 'newest'
    showTitleBar = titleBar ?? true // Default to true
    runBackground = runBg ?? false
    startHidden = startHid ?? false
    autostart = autoSt ?? false
    composerMode = (compMode as ComposerMode) || 'inline'
    mailtoMode = (mailMode as ComposerMode) || 'inline'
    composerFormat = (compFormat as ComposerFormat) || 'rich'
    nativeTitleBar = nativeTB ?? false
    alwaysLoadImages = alwaysImages ?? false
    darkMailContent = darkMail ?? false
    darkComposerBody = darkComposer ?? false
    accentBarUnread = accentBar ?? false
    accentUnreadStyle = accentStyle || 'dot'
    showMessageListCircles = listCircles ?? true
    showMessageListProfilePics = listProfilePics ?? false
    alwaysShowMessageCheckbox = alwaysCheckbox ?? false
    showViewerCircles = viewerCircles ?? true
    spellcheckEnabled = scEnabled ?? true
    spellcheckLanguages = scLangs ?? []
    spellcheckCustomWords = scWords ?? []
  } catch (err) {
    console.error('Failed to load settings:', err)
  }
}
