import { definedEntries, present, required } from '$lib/bindingValues'
/**
 * Composer API Abstraction Layer
 *
 * Provides a unified interface for composer operations that works in both:
 * - Main window (modal/inline composer) - uses App bindings
 * - Detached composer window - uses the same App bindings
 *
 * The API is injected via Svelte context to allow different implementations
 * depending on the window type.
 */

import { smtp, account, contact, app, smime, pgp } from '$lib/models'

/**
 * Interface for composer API operations.
 * The shared mail service implements these operations for every window.
 */
export interface ComposerApi {
  /** Send a composed email */
  sendMessage: (accountId: string, message: smtp.ComposeMessage) => Promise<void>

  /** Search contacts for autocomplete */
  searchContacts: (query: string, limit: number) => Promise<contact.Contact[]>

  /** Get identities for an account */
  getIdentities: (accountId: string) => Promise<account.Identity[]>

  /** Get the account's default address list for a kind ('bcc' | 'replyto'); "" when disabled */
  getDefaultAddress: (kind: string, accountId: string) => Promise<string>

  /** Save a draft (creates new or updates existing if draftId provided) */
  saveDraft: (accountId: string, message: smtp.ComposeMessage, draftId: string) => Promise<{ id: string; syncStatus: string }>

  /** Delete a draft */
  deleteDraft: (draftId: string) => Promise<void>

  /** Pick attachment files via native file picker */
  pickAttachmentFiles: () => Promise<app.ComposerAttachment[]>

  /** Get account details */
  getAccount: (accountId: string) => Promise<account.Account>

  /** Check if account has a valid default S/MIME certificate */
  hasSMIMECertificate: (accountId: string) => Promise<boolean>

  /** Get the S/MIME certificate matching a specific email (for identity-aware bar visibility) */
  getSMIMECertificateForEmail: (accountId: string, email: string) => Promise<smime.Certificate | null>

  /** Get the S/MIME signing policy for an account */
  getSMIMESignPolicy: (accountId: string) => Promise<string>

  /** Get the S/MIME encryption policy for an account */
  getSMIMEEncryptPolicy: (accountId: string) => Promise<string>

  /** Check which recipients have S/MIME certificates available */
  checkRecipientCerts: (emails: string[]) => Promise<Record<string, boolean>>

  /** Open a file picker for recipient certificate files */
  pickRecipientCertFile: () => Promise<string>

  /** Import a recipient's public certificate from a file */
  importRecipientCert: (email: string, filePath: string) => Promise<void>

  /** Check if account has a valid default PGP key */
  hasPGPKey: (accountId: string) => Promise<boolean>

  /** Get the PGP key matching a specific email (for identity-aware bar visibility) */
  getPGPKeyForEmail: (accountId: string, email: string) => Promise<pgp.Key | null>

  /** Get the PGP signing policy for an account */
  getPGPSignPolicy: (accountId: string) => Promise<string>

  /** Get the PGP encryption policy for an account */
  getPGPEncryptPolicy: (accountId: string) => Promise<string>

  /** Check which recipients have PGP public keys available */
  checkRecipientPGPKeys: (emails: string[]) => Promise<Record<string, boolean>>

  /** Open a file picker for recipient PGP public key files */
  pickRecipientPGPKeyFile: () => Promise<string>

  /** Import a recipient's PGP public key from a file */
  importRecipientPGPKey: (email: string, filePath: string) => Promise<void>

  /** Perform a WKD lookup for a recipient's PGP key */
  lookupWKD: (email: string) => Promise<string>

  /** Perform an HKP key server lookup for a recipient's PGP key */
  lookupHKP: (email: string) => Promise<string>

  /** Perform a unified WKD+HKP lookup for a recipient's PGP key */
  lookupPGPKey: (email: string) => Promise<string>

  /** Read a file from a filesystem path as an attachment */
  readFileAsAttachment: (filePath: string) => Promise<app.ComposerAttachment | null>

  /**
   * Get all accounts with their identities (only available in main window).
   * Returns undefined in detached composer windows.
   */
  getAllAccountIdentities?: () => Promise<app.AccountIdentityGroup[]>

  /**
   * Open a detached composer window (only available in main window).
   * Returns undefined in detached composer windows.
   */
  openComposerWindow?: (accountId: string, mode: string, messageId: string, draftId: string, mailtoURL?: string) => Promise<void>
}

/**
 * Context key for accessing the composer API.
 * Use with getContext/setContext.
 */
export const COMPOSER_API_KEY = 'composer-api'

/**
 * Creates the composer API implementation for the main window.
 * Uses App bindings.
 */
export function createMainWindowApi(): ComposerApi {
  // Dynamic import to avoid bundling issues
  // These will be resolved at runtime based on which entry point is used
  return {
    sendMessage: async (accountId: string, message: smtp.ComposeMessage) => {
      const { SendMessage } = await import('$bindings/github.com/pavlith/milo/app/app')
      return SendMessage(accountId, message)
    },

    searchContacts: async (query: string, limit: number) => {
      const { SearchContacts } = await import('$bindings/github.com/pavlith/milo/app/app')
      return present(await SearchContacts(query, limit))
    },

    getIdentities: async (accountId: string) => {
      const { GetIdentities } = await import('$bindings/github.com/pavlith/milo/app/app')
      return present(await GetIdentities(accountId))
    },

    saveDraft: async (accountId: string, message: smtp.ComposeMessage, draftId: string) => {
      const { SaveDraft } = await import('$bindings/github.com/pavlith/milo/app/app')
      const result = await SaveDraft(accountId, message, draftId)
      return { id: result?.draft?.id || '', syncStatus: result?.draft?.syncStatus || 'pending' }
    },

    deleteDraft: async (draftId: string) => {
      const { DeleteDraft } = await import('$bindings/github.com/pavlith/milo/app/app')
      return DeleteDraft(draftId)
    },

    pickAttachmentFiles: async () => {
      const { PickAttachmentFiles } = await import('$bindings/github.com/pavlith/milo/app/app')
      return PickAttachmentFiles()
    },

    getAccount: async (accountId: string) => {
      const { GetAccount } = await import('$bindings/github.com/pavlith/milo/app/app')
      return required(await GetAccount(accountId), 'account')
    },

    getDefaultAddress: async (kind: string, accountId: string) => {
      const { GetDefaultAddress } = await import('$bindings/github.com/pavlith/milo/app/app')
      return GetDefaultAddress(kind, accountId)
    },

    hasSMIMECertificate: async (accountId: string) => {
      const { HasSMIMECertificate } = await import('$bindings/github.com/pavlith/milo/app/app')
      return HasSMIMECertificate(accountId)
    },

    getSMIMECertificateForEmail: async (accountId: string, email: string) => {
      const { GetSMIMECertificateForEmail } = await import('$bindings/github.com/pavlith/milo/app/app')
      return GetSMIMECertificateForEmail(accountId, email)
    },

    getSMIMESignPolicy: async (accountId: string) => {
      const { GetSMIMESignPolicy } = await import('$bindings/github.com/pavlith/milo/app/app')
      return GetSMIMESignPolicy(accountId)
    },

    getSMIMEEncryptPolicy: async (accountId: string) => {
      const { GetSMIMEEncryptPolicy } = await import('$bindings/github.com/pavlith/milo/app/app')
      return GetSMIMEEncryptPolicy(accountId)
    },

    checkRecipientCerts: async (emails: string[]) => {
      const { CheckRecipientCerts } = await import('$bindings/github.com/pavlith/milo/app/app')
      return definedEntries(await CheckRecipientCerts(emails))
    },

    pickRecipientCertFile: async () => {
      const { PickRecipientCertFile } = await import('$bindings/github.com/pavlith/milo/app/app')
      return PickRecipientCertFile()
    },

    importRecipientCert: async (email: string, filePath: string) => {
      const { ImportRecipientCert } = await import('$bindings/github.com/pavlith/milo/app/app')
      return ImportRecipientCert(email, filePath)
    },

    hasPGPKey: async (accountId: string) => {
      const { HasPGPKey } = await import('$bindings/github.com/pavlith/milo/app/app')
      return HasPGPKey(accountId)
    },

    getPGPKeyForEmail: async (accountId: string, email: string) => {
      const { GetPGPKeyForEmail } = await import('$bindings/github.com/pavlith/milo/app/app')
      return GetPGPKeyForEmail(accountId, email)
    },

    getPGPSignPolicy: async (accountId: string) => {
      const { GetPGPSignPolicy } = await import('$bindings/github.com/pavlith/milo/app/app')
      return GetPGPSignPolicy(accountId)
    },

    getPGPEncryptPolicy: async (accountId: string) => {
      const { GetPGPEncryptPolicy } = await import('$bindings/github.com/pavlith/milo/app/app')
      return GetPGPEncryptPolicy(accountId)
    },

    checkRecipientPGPKeys: async (emails: string[]) => {
      const { CheckRecipientPGPKeys } = await import('$bindings/github.com/pavlith/milo/app/app')
      return definedEntries(await CheckRecipientPGPKeys(emails))
    },

    pickRecipientPGPKeyFile: async () => {
      const { PickRecipientPGPKeyFile } = await import('$bindings/github.com/pavlith/milo/app/app')
      return PickRecipientPGPKeyFile()
    },

    importRecipientPGPKey: async (email: string, filePath: string) => {
      const { ImportRecipientPGPKey } = await import('$bindings/github.com/pavlith/milo/app/app')
      return ImportRecipientPGPKey(email, filePath)
    },

    lookupWKD: async (email: string) => {
      const { LookupWKD } = await import('$bindings/github.com/pavlith/milo/app/app')
      return LookupWKD(email)
    },

    lookupHKP: async (email: string) => {
      const { LookupHKP } = await import('$bindings/github.com/pavlith/milo/app/app')
      return LookupHKP(email)
    },

    lookupPGPKey: async (email: string) => {
      const { LookupPGPKey } = await import('$bindings/github.com/pavlith/milo/app/app')
      return LookupPGPKey(email)
    },

    readFileAsAttachment: async (filePath: string) => {
      const { ReadFileAsAttachment } = await import('$bindings/github.com/pavlith/milo/app/app')
      return ReadFileAsAttachment(filePath)
    },

    getAllAccountIdentities: async () => {
      const { GetAllAccountIdentities } = await import('$bindings/github.com/pavlith/milo/app/app')
      return GetAllAccountIdentities()
    },

    openComposerWindow: async (accountId: string, mode: string, messageId: string, draftId: string, mailtoURL?: string) => {
      const { OpenComposerWindow } = await import('$bindings/github.com/pavlith/milo/app/app')
      return OpenComposerWindow(accountId, mode, messageId, draftId, mailtoURL || '')
    },
  }
}

// Detached editors use the shared mail service, with the pop-out action hidden.
export function createComposerWindowApi(): ComposerApi {
  const { openComposerWindow: _openComposerWindow, ...api } = createMainWindowApi()
  return api
}
