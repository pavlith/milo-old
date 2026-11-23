import { ru } from 'date-fns/locale/ru'

export function getDateFnsLocale(code: string | null | undefined) {
  return code === 'ru' ? ru : undefined
}
