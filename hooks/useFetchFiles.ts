import { useState, useEffect, useCallback } from 'react';
import { fetchFilesByKnowledgeId } from '../services/fileService';
import { IFile } from '@models/IFile';

interface UseFetchFilesResult {
  files: IFile[] | null;
  loading: boolean;
  fetchFiles: () => Promise<void>;
}

export const useFetchFiles = (knowledgeId: string | undefined, t: any): UseFetchFilesResult => {
  const [files, setFiles] = useState<IFile[] | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchFiles = useCallback(async () => {
    if (!knowledgeId) return;
    if (!t) return;

    setLoading(true);
    try {
      const filesData = await fetchFilesByKnowledgeId(knowledgeId);
      setFiles(filesData || []);
    } catch (error) {
      console.error("Error fetching files:", error);
      // message.error(t('knowledgeDetail.fetchKnowledgeFailed') || "Failed to load files");
    } finally {
      setLoading(false);
    }
  }, [knowledgeId, t]);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  return { files, loading, fetchFiles };
};
