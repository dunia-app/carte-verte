export enum CacheTimes {
  OneMinute = 60,
  FifteenMinutes = 15 * 60,
  ThirtyMinutes = 30 * 60,
  OneHour = 60 * 60,
  OneDay = 60 * 60 * 24,
  TwoDays = 60 * 60 * 24 * 2,
  ThreeDays = 60 * 60 * 24 * 3,
  OneWeek = 60 * 60 * 24 * 7,
  OneMonth = 60 * 60 * 24 * 30,
}

export function getCacheTime(
  cacheTime: CacheTimes | number,
  asMilliseconds = false,
) {
  if (asMilliseconds) return 1000 * cacheTime
  return cacheTime
}
