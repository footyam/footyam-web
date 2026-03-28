export function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat('en-GB', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

export function isMorningMatch(value: string): boolean {
  const hour = new Date(value).getHours();
  return hour >= 0 && hour < 12;
}
