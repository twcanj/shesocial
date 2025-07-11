// Date utility functions
export const ensureDate = (date: Date | string): Date => {
  if (typeof date === 'string') {
    return new Date(date)
  }
  return date
}

export const formatDate = (date: Date | string, locale: string = 'zh-TW'): string => {
  return ensureDate(date).toLocaleDateString(locale)
}

export const formatDateTime = (date: Date | string, locale: string = 'zh-TW'): string => {
  return ensureDate(date).toLocaleString(locale)
}