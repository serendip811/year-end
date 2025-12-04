/**
 * UTC 시간을 한국 시간(KST, UTC+9)으로 변환
 * (현재 DB가 KST이므로 사용 안 함 - 하위 호환성 유지용)
 */
export function toKST(date: Date | string): Date {
  const utcDate = typeof date === 'string' ? new Date(date) : date;
  return utcDate; // DB가 이미 KST이므로 변환 안 함
}

/**
 * 시간 포맷팅 (오전/오후 HH:MM)
 * DB가 이미 KST이므로 그대로 표시
 */
export function formatTimeKST(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  const hours24 = dateObj.getHours();
  const hours12 = hours24 % 12 || 12;
  const minutes = dateObj.getMinutes().toString().padStart(2, '0');
  const period = hours24 < 12 ? '오전' : '오후';

  return `${period} ${hours12}:${minutes}`;
}

/**
 * 날짜 포맷팅 (M월 D일)
 * DB가 이미 KST이므로 그대로 표시
 */
export function formatDateKST(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  const month = dateObj.getMonth() + 1;
  const day = dateObj.getDate();
  
  return `${month}월 ${day}일`;
}

/**
 * 날짜+시간 포맷팅
 * DB가 이미 KST이므로 그대로 표시
 */
export function formatDateTimeKST(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  const year = dateObj.getFullYear();
  const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
  const day = dateObj.getDate().toString().padStart(2, '0');
  const hours = dateObj.getHours().toString().padStart(2, '0');
  const minutes = dateObj.getMinutes().toString().padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}`;
}

/**
 * 두 날짜가 같은 날인지 확인
 */
export function isSameDay(date1: Date | string, date2: Date | string): boolean {
  const d1 = typeof date1 === 'string' ? new Date(date1) : date1;
  const d2 = typeof date2 === 'string' ? new Date(date2) : date2;

  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

/**
 * 날짜 구분선용 포맷팅 (YYYY년 M월 D일 요일)
 */
export function formatDateSeparator(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  const year = dateObj.getFullYear();
  const month = dateObj.getMonth() + 1;
  const day = dateObj.getDate();
  const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
  const weekday = weekdays[dateObj.getDay()];

  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (isSameDay(dateObj, today)) {
    return '오늘';
  } else if (isSameDay(dateObj, yesterday)) {
    return '어제';
  } else {
    return `${year}년 ${month}월 ${day}일 ${weekday}요일`;
  }
}

