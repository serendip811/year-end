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
  const utcDate = typeof date === 'string' ? new Date(date) : date;
  return utcDate.toLocaleTimeString('ko-KR', { 
    hour: '2-digit', 
    minute: '2-digit',
    timeZone: 'Asia/Seoul' // UTC를 직접 Asia/Seoul 타임존으로 변환
  });
}

/**
 * 한국 시간으로 날짜 포맷팅 (M월 D일)
 */
export function formatDateKST(date: Date | string): string {
  const utcDate = typeof date === 'string' ? new Date(date) : date;
  return utcDate.toLocaleDateString('ko-KR', { 
    month: 'short', 
    day: 'numeric',
    timeZone: 'Asia/Seoul' // UTC를 직접 Asia/Seoul 타임존으로 변환
  });
}

/**
 * 한국 시간으로 날짜+시간 포맷팅
 */
export function formatDateTimeKST(date: Date | string): string {
  const utcDate = typeof date === 'string' ? new Date(date) : date;
  return utcDate.toLocaleString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Seoul' // UTC를 직접 Asia/Seoul 타임존으로 변환
  });
}

