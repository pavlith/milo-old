// Go pointer slices may contain null elements in the generated bindings.
export function present<T>(values: readonly (T | null | undefined)[] | undefined): T[] {
  return values?.filter(value => value != null) ?? []
}

export function required<T>(value: T | null | undefined, label: string): T {
  if (value == null) throw new Error(`Missing ${label}`)
  return value
}

export function definedEntries<T>(values: Record<string, T | undefined>): Record<string, T> {
  const entries: Record<string, T> = {}
  for (const [key, value] of Object.entries(values)) {
    if (value !== undefined) entries[key] = value
  }
  return entries
}

export function enumValue<T extends string>(value: string, options: readonly T[]): T {
  return required(options.find(option => option === value), `option "${value}"`)
}
