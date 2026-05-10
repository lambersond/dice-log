import {
  formatDisplay,
  getBrowserTimezone,
  getTimezoneInfo,
  getTimezoneOffsetMinutes,
  isoToParts,
  listAllTimezones,
  parseDateInput,
  partsToIso,
} from './format'

describe('components/common/datetime-picker/format', () => {
  describe('partsToIso / isoToParts', () => {
    it('round-trips parts through ISO in the given timezone', () => {
      const parts = {
        year: 2026,
        month: 4,
        day: 30,
        hour: 14,
        minute: 30,
        second: 5,
        ms: 0,
      }
      const iso = partsToIso(parts, 'America/New_York')
      expect(iso).toBe('2026-04-30T18:30:05.000Z')
      expect(isoToParts(iso, 'America/New_York')).toEqual(parts)
    })

    it('isoToParts returns undefined for empty input', () => {
      expect(isoToParts('', 'UTC')).toBeUndefined()
    })

    it('isoToParts returns undefined for unparseable ISO strings', () => {
      expect(isoToParts('not-a-date', 'UTC')).toBeUndefined()
    })
  })

  describe('getTimezoneOffsetMinutes', () => {
    it('returns a negative offset for zones west of UTC', () => {
      // EDT is UTC-4 → -240 minutes; EST (winter) is -300.
      const summer = getTimezoneOffsetMinutes(
        new Date('2026-07-01T12:00:00Z'),
        'America/New_York',
      )
      expect(summer).toBe(-240)

      const winter = getTimezoneOffsetMinutes(
        new Date('2026-01-15T12:00:00Z'),
        'America/New_York',
      )
      expect(winter).toBe(-300)
    })

    it('returns a positive offset for zones east of UTC', () => {
      const tokyo = getTimezoneOffsetMinutes(
        new Date('2026-07-01T12:00:00Z'),
        'Asia/Tokyo',
      )
      expect(tokyo).toBe(540)
    })

    it('returns 0 for UTC', () => {
      expect(
        getTimezoneOffsetMinutes(new Date('2026-07-01T12:00:00Z'), 'UTC'),
      ).toBe(0)
    })

    it('returns 0 when the timezone is unknown', () => {
      expect(
        getTimezoneOffsetMinutes(
          new Date('2026-07-01T12:00:00Z'),
          'Not/A_Real_Zone',
        ),
      ).toBe(0)
    })
  })

  describe('formatDisplay', () => {
    it('formats an ISO instant in the given timezone using MM/DD/YYYY h:mm a', () => {
      const formatted = formatDisplay(
        '2026-04-30T18:30:00.000Z',
        'America/New_York',
      )
      // The exact whitespace and comma layout may vary by ICU version; assert key parts
      expect(formatted).toMatch(/04\/30\/2026/)
      expect(formatted).toMatch(/2:30/)
      expect(formatted).toMatch(/PM/)
    })

    it('returns empty for empty or invalid input', () => {
      expect(formatDisplay('', 'UTC')).toBe('')
      expect(formatDisplay('not a date', 'UTC')).toBe('')
    })

    it('returns empty when the timezone is unknown', () => {
      expect(formatDisplay('2026-04-30T12:00:00.000Z', 'Not/A_Real_Zone')).toBe(
        '',
      )
    })
  })

  describe('getTimezoneInfo', () => {
    it('humanizes the city, returns long and short names', () => {
      const info = getTimezoneInfo('America/New_York', new Date('2026-07-01'))
      expect(info.id).toBe('America/New_York')
      expect(info.city).toBe('New York')
      expect(info.shortName).toMatch(/EDT|EST/)
      expect(info.longName).toMatch(/Eastern/i)
    })

    it('falls back to the timezone string when given an unknown id', () => {
      const info = getTimezoneInfo('Not/A_Real_Zone', new Date('2026-07-01'))
      // Intl throws for unknown zones, so the catch falls back to the id.
      expect(info.id).toBe('Not/A_Real_Zone')
      expect(info.city).toBe('A Real Zone')
    })
  })

  describe('getBrowserTimezone', () => {
    it('returns a non-empty timezone string', () => {
      const tz = getBrowserTimezone()
      expect(typeof tz).toBe('string')
      expect(tz.length).toBeGreaterThan(0)
    })
  })

  describe('listAllTimezones', () => {
    it('returns a non-empty list of IANA timezones', () => {
      const list = listAllTimezones()
      expect(list.length).toBeGreaterThan(0)
      expect(list).toContain('America/New_York')
    })
  })

  describe('parseDateInput', () => {
    it('parses an ISO with explicit Z', () => {
      expect(
        parseDateInput('2026-04-30T18:30:00.000Z', 'America/New_York'),
      ).toBe('2026-04-30T18:30:00.000Z')
    })

    it('parses an ISO with an explicit numeric offset', () => {
      // 14:30 at +05:00 = 09:30 UTC, regardless of the picker's selected zone.
      expect(parseDateInput('2026-04-30T14:30:00+05:00', 'UTC')).toBe(
        '2026-04-30T09:30:00.000Z',
      )
    })

    it('parses a wall-clock relative to the given timezone', () => {
      expect(parseDateInput('2026-04-30T14:30', 'America/New_York')).toBe(
        '2026-04-30T18:30:00.000Z',
      )
    })

    it('returns undefined for empty input', () => {
      expect(parseDateInput('', 'UTC')).toBeUndefined()
    })

    it('returns undefined for unparseable input', () => {
      expect(parseDateInput('hello world', 'UTC')).toBeUndefined()
    })

    describe('free-form text (no explicit timezone)', () => {
      it('parses "Apr 14, 2026, 12:00 AM" as midnight in the selected timezone', () => {
        // Midnight Eastern on April 14, 2026 = 04:00 UTC (EDT is UTC-4)
        expect(
          parseDateInput('Apr 14, 2026, 12:00 AM', 'America/New_York'),
        ).toBe('2026-04-14T04:00:00.000Z')
      })

      it('parses "Apr 23, 2026, 12:35 PM" as 12:35 in the selected timezone', () => {
        expect(
          parseDateInput('Apr 23, 2026, 12:35 PM', 'America/New_York'),
        ).toBe('2026-04-23T16:35:00.000Z')
      })

      it('preserves seconds from "Apr 23, 2026, 2:10:44 PM"', () => {
        expect(
          parseDateInput('Apr 23, 2026, 2:10:44 PM', 'America/New_York'),
        ).toBe('2026-04-23T18:10:44.000Z')
      })

      it('parses the same wall-clock to UTC when timezone is UTC', () => {
        expect(parseDateInput('Apr 14, 2026, 12:00 AM', 'UTC')).toBe(
          '2026-04-14T00:00:00.000Z',
        )
      })
    })
  })
})
