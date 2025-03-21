export function getNextNthDayOfMonth(
  n: number,
  fromDate: Date = new Date(),
): Date {
  const currentMonth = fromDate.getMonth()
  const currentYear = fromDate.getFullYear()
  const nextDate = new Date(currentYear, currentMonth, n)

  if (nextDate < fromDate) {
    nextDate.setMonth(currentMonth + 1)
  }

  return nextDate
}

export function isValidDate(value: Date) {
  const dateValue = value.toISOString().slice(0, 10)
  if (
    !/^\d\d\d\d-\d\d-\d\d$/.test(dateValue) &&
    !/^\d\d\d\d\/\d\d\/\d\d$/.test(dateValue)
  ) {
    return false
  }
  const parts = dateValue.split(/[\/-]/).map((p: any) => parseInt(p, 10))
  parts[1] -= 1
  const d = new Date(parts[0], parts[1], parts[2])
  return (
    d.getFullYear() === parts[0] &&
    d.getMonth() === parts[1] &&
    d.getDate() === parts[2]
  )
}

export function now() {
  var ts = process.hrtime()
  return ts[0] * 1e3 + ts[1] / 1e6
}
