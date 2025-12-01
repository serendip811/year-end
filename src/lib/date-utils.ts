/**
 * UTC 시간을 한국 시간(KST, UTC+9)으로 변환
 * (현재 DB가 KST이므로 사용 안 함 - 하위 호환성 유지용)
 */
export function toKST(date: Date | string): Date {
  const utcDate = typeof date === 'string' ? new Date(date) : date;
  return utcDate; // DB가 이미 KST이므로 변환 안 함
}

/**
 * 시간 포맷팅 (HH:MM)
 * DB가 이미 KST이므로 그대로 표시
 */
export function formatTimeKST(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  const hours = dateObj.getHours().toString().padStart(2, '0');
  const minutes = dateObj.getMinutes().toString().padStart(2, '0');
  
  return `${hours}:${minutes}`;
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

