export function getBrowserTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
  } catch {
    return 'UTC'
  }
}

export function listAllTimezones(): string[] {
  try {
    const fn = (
      Intl as unknown as {
        supportedValuesOf?: (key: 'timeZone') => string[]
      }
    ).supportedValuesOf
    if (typeof fn === 'function') return fn('timeZone').toSorted()
  } catch {
    // fall through
  }
  return ['UTC']
}

export function getTimezoneOffsetMinutes(date: Date, timezone: string): number {
  try {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      timeZoneName: 'shortOffset',
    }).formatToParts(date)
    const offsetStr = parts.find(p => p.type === 'timeZoneName')?.value ?? 'GMT'
    const match = offsetStr.match(/GMT([+-])(\d{1,2})(?::(\d{2}))?/)
    if (!match) return 0
    const sign = match[1] === '-' ? -1 : 1
    const hours = Number.parseInt(match[2], 10)
    const mins = match[3] ? Number.parseInt(match[3], 10) : 0
    return sign * (hours * 60 + mins)
  } catch {
    return 0
  }
}

export type TimezoneInfo = {
  id: string
  city: string
  longName: string
  shortName: string
}

function timezoneNames(
  timezone: string,
  type: 'long' | 'short',
  instant: Date,
): string {
  try {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      timeZoneName: type,
    }).formatToParts(instant)
    return parts.find(p => p.type === 'timeZoneName')?.value ?? timezone
  } catch {
    return timezone
  }
}

export function getTimezoneInfo(
  timezone: string,
  instant: Date = new Date(),
): TimezoneInfo {
  const longName = timezoneNames(timezone, 'long', instant)
  const shortName = timezoneNames(timezone, 'short', instant)
  const last = timezone.split('/').at(-1) ?? timezone
  const city = last.replaceAll('_', ' ')
  return { id: timezone, city, longName, shortName }
}

export type DateParts = {
  year: number
  month: number
  day: number
  hour: number
  minute: number
  second: number
  ms: number
}

export function isoToParts(
  iso: string,
  timezone: string,
): DateParts | undefined {
  if (!iso) return undefined
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return undefined
  const offsetMinutes = getTimezoneOffsetMinutes(date, timezone)
  const wall = new Date(date.getTime() + offsetMinutes * 60_000)
  return {
    year: wall.getUTCFullYear(),
    month: wall.getUTCMonth() + 1,
    day: wall.getUTCDate(),
    hour: wall.getUTCHours(),
    minute: wall.getUTCMinutes(),
    second: wall.getUTCSeconds(),
    ms: wall.getUTCMilliseconds(),
  }
}

export function partsToIso(parts: DateParts, timezone: string): string {
  const utc = Date.UTC(
    parts.year,
    parts.month - 1,
    parts.day,
    parts.hour,
    parts.minute,
    parts.second,
    parts.ms,
  )
  if (Number.isNaN(utc)) return ''
  const offsetMinutes = getTimezoneOffsetMinutes(new Date(utc), timezone)
  return new Date(utc - offsetMinutes * 60_000).toISOString()
}

export function formatDisplay(iso: string, timezone: string): string {
  if (!iso) return ''
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  try {
    return new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).format(date)
  } catch {
    return ''
  }
}

const HAS_EXPLICIT_TZ = /(?:Z|[+-]\d{2}:?\d{2})\s*$/i

export function parseDateInput(
  text: string,
  timezone: string,
): string | undefined {
  const trimmed = text.trim()
  if (!trimmed) return undefined

  if (HAS_EXPLICIT_TZ.test(trimmed)) {
    const date = new Date(trimmed)
    if (!Number.isNaN(date.getTime())) return date.toISOString()
  }

  // Try common wall-clock pattern first (treat as selected timezone)
  const wallMatch = trimmed.match(
    /^(\d{4})-(\d{1,2})-(\d{1,2})[T ](\d{1,2}):(\d{2})(?::(\d{2}))?/,
  )
  if (wallMatch) {
    const [, y, mo, d, h, mi, s = '0'] = wallMatch
    return partsToIso(
      {
        year: Number(y),
        month: Number(mo),
        day: Number(d),
        hour: Number(h),
        minute: Number(mi),
        second: Number(s),
        ms: 0,
      },
      timezone,
    )
  }

  // Last resort: hand the string to Date(). new Date() interprets bare
  // wall-clock strings (e.g. "Apr 14, 2026, 12:00 AM") in the browser's
  // local timezone. Extract the wall-clock components and re-interpret
  // them in the selected timezone so the user's typed time means what
  // they expect when the picker is set to a non-local zone.
  const fallback = new Date(trimmed)
  if (!Number.isNaN(fallback.getTime())) {
    return partsToIso(
      {
        year: fallback.getFullYear(),
        month: fallback.getMonth() + 1,
        day: fallback.getDate(),
        hour: fallback.getHours(),
        minute: fallback.getMinutes(),
        second: fallback.getSeconds(),
        ms: fallback.getMilliseconds(),
      },
      timezone,
    )
  }

  return undefined
}
