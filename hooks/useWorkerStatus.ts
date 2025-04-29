import { useState, useEffect } from 'react';
import { getWorkerStatus } from '../services/adminService';

const useWorkerStatus = (pollingInterval = 5000) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const result = await getWorkerStatus();
      setData(result);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch worker status');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Set up polling
    const interval = setInterval(fetchData, pollingInterval);
    setRefreshInterval(interval);

    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, [pollingInterval]);

  return { data, loading, error, fetchData };
};

export default useWorkerStatus;

