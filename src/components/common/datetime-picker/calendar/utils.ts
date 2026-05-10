import type { DateParts } from '../format'

export function isBeforeDay(
  cell: { year: number; month: number; day: number },
  min: { year: number; month: number; day: number },
): boolean {
  if (cell.year !== min.year) return cell.year < min.year
  if (cell.month !== min.month) return cell.month < min.month
  return cell.day < min.day
}

export function defaultParts(): DateParts {
  return {
    year: new Date().getUTCFullYear(),
    month: new Date().getUTCMonth() + 1,
    day: new Date().getUTCDate(),
    hour: 0,
    minute: 0,
    second: 0,
    ms: 0,
  }
}

export function getCalendarCells(
  year: number,
  month: number,
): Array<{ year: number; month: number; day: number }> {
  const firstOfMonth = new Date(year, month - 1, 1)
  const startDow = firstOfMonth.getDay()
  const start = new Date(year, month - 1, 1 - startDow)

  const cells: Array<{ year: number; month: number; day: number }> = []
  for (let i = 0; i < 42; i++) {
    const d = new Date(
      start.getFullYear(),
      start.getMonth(),
      start.getDate() + i,
    )
    cells.push({
      year: d.getFullYear(),
      month: d.getMonth() + 1,
      day: d.getDate(),
    })
  }
  return cells
}
