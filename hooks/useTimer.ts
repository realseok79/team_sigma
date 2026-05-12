// ==============================
// Flow To-Do: Timer Utility
// ==============================

/**
 * 초(seconds)를 "HH:MM:SS" 형식으로 변환합니다.
 */
export function formatTime(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return [hours, minutes, seconds]
    .map((v) => v.toString().padStart(2, "0"))
    .join(":");
}
