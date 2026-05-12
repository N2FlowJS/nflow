import { useState, useEffect, useCallback } from 'react';
import { apiService, ApiMonitorEvent } from '../lib/apiService';

export interface ApiActivity extends ApiMonitorEvent {
  id: string;
}

export function useApiMonitor(limit = 20) {
  const [activities, setActivities] = useState<ApiActivity[]>([]);

  useEffect(() => {
    const handleEvent = (event: ApiMonitorEvent) => {
      setActivities(prev => {
        const newActivity: ApiActivity = {
          ...event,
          id: Math.random().toString(36).substring(7),
        };
        const updated = [newActivity, ...prev];
        return updated.slice(0, limit);
      });
    };

    const unsubscribe = apiService.subscribe(handleEvent);
    return () => unsubscribe();
  }, [limit]);

  const clear = useCallback(() => setActivities([]), []);

  return { activities, clear };
}
