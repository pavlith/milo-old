import type { Readable } from 'svelte/store'

// Formsnap uses these four stores at runtime. The account forms keep their
// existing values, validation and submission through the Wails bridge.
export type FormPath<T> = Extract<keyof T, string>
export type FormPathLeaves<T> = FormPath<T>
export type ValidationErrors<T> = Partial<Record<FormPath<T>, string[]>>
export type SuperForm<T, _Message = unknown> = {
  form: Readable<T>
  errors: Readable<ValidationErrors<T>>
  constraints: Readable<Partial<Record<FormPath<T>, { required?: boolean }>>>
  tainted: Readable<Partial<Record<FormPath<T>, boolean>> | undefined>
}
