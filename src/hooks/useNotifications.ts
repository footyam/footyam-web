import { useEffect, useState } from 'react';

export interface HighlightNotification {
  id: string;
  matchId: string;
  sourceId: string;
  sourceName: string;
  homeTeam: string;
  awayTeam: string;
  league: string;
  videoUrl: string;
  createdAt: number;
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<HighlightNotification[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function loadNotifications() {
      try {
        const res = await fetch('http://localhost:8787/api/notifications');
        const data = await res.json();

        if (!cancelled) {
          setNotifications(Array.isArray(data.notifications) ? data.notifications : []);
        }
      } catch {
        if (!cancelled) setNotifications([]);
      }
    }

    loadNotifications();

    const timer = window.setInterval(loadNotifications, 30_000);

    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, []);

  return { notifications };
}