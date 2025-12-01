/**
 * UTC 시간을 한국 시간(KST, UTC+9)으로 변환
 */
export function toKST(date: Date | string): Date {
  const utcDate = typeof date === 'string' ? new Date(date) : date;
  // UTC 시간에 9시간 추가
  return new Date(utcDate.getTime() + 9 * 60 * 60 * 1000);
}

/**
 * 한국 시간으로 시간 포맷팅 (HH:MM)
 */
export function formatTimeKST(date: Date | string): string {
  const kstDate = toKST(date);
  return kstDate.toLocaleTimeString('ko-KR', { 
    hour: '2-digit', 
    minute: '2-digit',
    timeZone: 'UTC' // 이미 KST로 변환했으므로 UTC 기준으로 표시
  });
}

/**
 * 한국 시간으로 날짜 포맷팅 (M월 D일)
 */
export function formatDateKST(date: Date | string): string {
  const kstDate = toKST(date);
  return kstDate.toLocaleDateString('ko-KR', { 
    month: 'short', 
    day: 'numeric',
    timeZone: 'UTC' // 이미 KST로 변환했으므로 UTC 기준으로 표시
  });
}

/**
 * 한국 시간으로 날짜+시간 포맷팅
 */
export function formatDateTimeKST(date: Date | string): string {
  const kstDate = toKST(date);
  return kstDate.toLocaleString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'UTC' // 이미 KST로 변환했으므로 UTC 기준으로 표시
  });
}

