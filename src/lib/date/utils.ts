export function convertToLocalDateUTC0(datetimeLocalString: string): Date {
  const localDate = convertToLocalDate(datetimeLocalString)

  return new Date(
    Date.UTC(
      localDate.getFullYear(),
      localDate.getMonth(),
      localDate.getDate(),
      localDate.getHours(),
      localDate.getMinutes(),
      localDate.getSeconds()
    )
  )
}

export function convertToLocalDate(datetimeLocalString: string): Date {
  const localDate = new Date(datetimeLocalString)

  if (isNaN(localDate.getTime())) {
    throw new Error("Invalid date provided")
  }
  return localDate
}

export function formatDate(date: Date): string {
  const year = date.getFullYear()
  const month = (date.getMonth() + 1).toString().padStart(2, "0")
  const day = date.getDate().toString().padStart(2, "0")
  const hours = date.getHours().toString().padStart(2, "0")
  const minutes = date.getMinutes().toString().padStart(2, "0")

  return `${year}/${month}/${day} ${hours}:${minutes}`
}
