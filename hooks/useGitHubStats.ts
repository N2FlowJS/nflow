import { useState, useEffect } from 'react';

export const useGitHubStats = () => {
  const [stars, setStars] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStars = async () => {
      try {
        const response = await fetch('https://api.github.com/repos/N2FlowJS/nflow');
        const data = await response.json();
        setStars(data.stargazers_count);
      } catch (error: unknown) {
        console.error('Error fetching GitHub stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStars();
  }, []);

  return { stars, loading };
};
