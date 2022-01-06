export function getFormatDate(
  date: Date,
): {
  year: number;
  month: number;
  day: number;
  hour: number;
  min: number;
  sec: number;
} {
  return {
    year: date.getFullYear(),
    month: 1 + date.getMonth(),
    day: date.getDate(),
    hour: date.getHours(),
    min: date.getMinutes(),
    sec: date.getSeconds(),
  };
}

/** YYYY-MM-DD hh:mm:ss 포멧으로 리턴 */
export function getYYYYMMDDhhmm(date: {
  year: number;
  month: number;
  day: number;
  hour: number;
  min: number;
  sec: number;
}): string {
  return `${getYYYYMMDD(date)} ${gethhmmss(date)}`;
}

export function getYYYYMMDD({
  year,
  month,
  day,
}: {
  year: number;
  month: number;
  day: number;
  hour: number;
  min: number;
  sec: number;
}): string {
  return `${year}-${month < 10 ? '0' : ''}${month}-${day < 10 ? '0' : ''}${day}`;
}

export function gethhmmss({
  hour,
  min,
  sec,
}: {
  year: number;
  month: number;
  day: number;
  hour: number;
  min: number;
  sec: number;
}): string {
  return `${hour < 10 ? '0' : ''}${hour}:${min < 10 ? '0' : ''}${min}:${sec < 10 ? '0' : ''}${sec}`;
}

getYYYYMMDDhhmm(getFormatDate(new Date()));
