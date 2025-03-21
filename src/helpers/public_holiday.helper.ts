export function isPublicHoliday(date: Date) {
  const publicHolidays = findPublicHoliday(date.getFullYear())
  return !!publicHolidays.find(
    (holiday) =>
      holiday.getMonth() === date.getMonth() &&
      holiday.getDate() === date.getDate(),
  )
}

export function countPublicHolidayInMonthByDay(
  year: number,
  month: number,
): number[] {
  const publicHolidays = findPublicHoliday(year)

  // Filter public holidays that are in the same month as the provided month
  const holidaysInMonth = publicHolidays.filter(
    (holiday) => holiday.getMonth() === month - 1,
  )

  // Initialize an array to count occurrences of each weekday
  const count: number[] = new Array(7).fill(0)

  // Count occurrences of each weekday
  holidaysInMonth.forEach((holiday) => {
    const dayOfWeek = holiday.getDay() // 0 for Sunday, 1 for Monday, ..., 6 for Saturday
    count[dayOfWeek]++
  })

  return count
}

function findPublicHoliday(an: number) {
  const JourAn = new Date(an, 0, 1)
  const FeteTravail = new Date(an, 4, 1)
  const Victoire1945 = new Date(an, 4, 8)
  const FeteNationale = new Date(an, 6, 14)
  const Assomption = new Date(an, 7, 15)
  const Toussaint = new Date(an, 10, 1)
  const Armistice = new Date(an, 10, 11)
  const Noel = new Date(an, 11, 25)

  const G = an % 19
  const C = Math.floor(an / 100)
  const H =
    (C - Math.floor(C / 4) - Math.floor((8 * C + 13) / 25) + 19 * G + 15) % 30
  const I =
    H -
    Math.floor(H / 28) *
      (1 -
        Math.floor(H / 28) *
          Math.floor(29 / (H + 1)) *
          Math.floor((21 - G) / 11))
  const J = (an * 1 + Math.floor(an / 4) + I + 2 - C + Math.floor(C / 4)) % 7
  const L = I - J
  const MoisPaques = 3 + Math.floor((L + 40) / 44)
  const JourPaques = L + 28 - 31 * Math.floor(MoisPaques / 4)
  const LundiPaques = new Date(an, MoisPaques - 1, JourPaques + 1)
  const Ascension = new Date(an, MoisPaques - 1, JourPaques + 39)
  // const LundiPentecote = new Date(an, MoisPaques - 1, JourPaques + 50)

  return new Array(
    JourAn,
    LundiPaques,
    FeteTravail,
    Victoire1945,
    Ascension,
    // LundiPentecote,
    FeteNationale,
    Assomption,
    Toussaint,
    Armistice,
    Noel,
  )
}
