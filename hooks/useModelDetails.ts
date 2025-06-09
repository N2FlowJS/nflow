import { useEffect, useState } from 'react'; 
import { fetchLLMModelById } from '../services/llmService';

export const useModelDetails = (modelId?: string) => {
  const [modelDetails, setModelDetails] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (modelId && typeof modelId === 'string' && modelId.length > 10) {
      setLoading(true);
      setError(null);

      fetchLLMModelById(modelId)
        .then(modelData => {
          setModelDetails(modelData);
        })
        .catch(err => {
          console.error("Error fetching model details:", err);
          setError("Failed to load model information");
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [modelId]);

  const getModelDisplayName = () => {
    if (loading) return "Loading...";
    if (error) return "Error loading model";
    if (!modelId) return "No model selected";

    if (modelDetails?.name) return modelDetails.name;
    return modelId;
  };

  const getProviderName = () => {
    if (modelDetails?.provider?.name) {
      return modelDetails.provider.name;
    }
    return null;
  };

  return {
    modelDetails,
    loading,
    error,
    getModelDisplayName,
    getProviderName
  };
};
