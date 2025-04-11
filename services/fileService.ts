import { apiRequest, getAuthHeader } from './apiUtils';
import { KnowledgeFile } from '../types/knowledge';
import { logApiRequest, logApiResponse, logApiError } from '../utils/logger';
import { IFile } from '../types/IFile';
import { getFileChunks as getNbaseFileChunks } from '../lib/services/nbaseService';
import { fetchTextChunksByFileId } from '../lib/services/localVectorService';
import { IChunk } from '../types/IChunk';
// Upload a single file to knowledge
export const uploadFile = async (knowledgeId: string, file: File, onProgress?: (percent: number) => void): Promise<KnowledgeFile | null> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('fileName', file.name);

  const url = `/api/knowledge/${knowledgeId}/files`;
  const method = 'POST';

  // Log upload request (exclude full file data)
  logApiRequest(method, url, {}, { fileName: file.name, fileSize: file.size, fileType: file.type });

  const startTime = performance.now();

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && onProgress) {
        const percentComplete = Math.round((event.loaded / event.total) * 100);
        onProgress(percentComplete);
      }
    };

    xhr.onload = () => {
      const endTime = performance.now();
      const duration = Math.round(endTime - startTime);

      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const responseData = JSON.parse(xhr.responseText);
          // Log successful response
          logApiResponse(method, url, xhr.status, responseData, duration);
          resolve(responseData);
        } catch (e) {
          // Log parse error
          logApiError(method, url, 'Invalid response format', duration);
          reject(new Error('Invalid response format'));
        }
      } else {
        // Log error response
        logApiError(method, url, `Upload failed: ${xhr.status}`, duration);
        reject(new Error(`Upload failed: ${xhr.status}`));
      }
    };

    xhr.onerror = () => {
      const endTime = performance.now();
      const duration = Math.round(endTime - startTime);

      logApiError(method, url, 'Network error', duration);
      reject(new Error('Network error'));
    };

    xhr.open(method, url, true);
    const authHeader = getAuthHeader();
    if (authHeader.Authorization) {
      xhr.setRequestHeader('Authorization', authHeader.Authorization);
    }
    xhr.send(formData);
  });
};

// Upload multiple files one by one
export async function uploadFiles(knowledgeId: string, files: File[], onOverallProgress?: (percent: number) => void): Promise<(KnowledgeFile | null)[]> {
  console.log('Uploading files:', files);

  if (!files || files.length === 0) return [];

  // Filter out any undefined or invalid files
  const validFiles = files;

  if (validFiles.length === 0) return [];

  const results: (KnowledgeFile | null)[] = [];

  for (let i = 0; i < validFiles.length; i++) {
    const file = validFiles[i];

    try {
      // For each file, track its individual progress
      const result = await uploadFile(knowledgeId, file, (fileProgress) => {
        // Calculate overall progress across all files
        const fileContribution = fileProgress / validFiles.length;
        const previousFilesContribution = (i / validFiles.length) * 100;
        const overallProgress = Math.round(previousFilesContribution + fileContribution);

        if (onOverallProgress) {
          onOverallProgress(overallProgress);
        }
      });

      results.push(result);
    } catch (error) {
      console.error(`Error uploading file ${file ? file.name : 'unknown'}:`, error);
      results.push(null);
    }
  }

  return results;
}

// Delete a file
export const deleteFile = async (knowledgeId: string, fileId: string): Promise<boolean> => {
  return apiRequest<boolean>(`/api/knowledge/${knowledgeId}/files/${fileId}`, {
    method: 'DELETE',
  });
};

// Get download URL for a file
export const getFileDownloadUrl = (knowledgeId: string, fileId: string): string => {
  return `/api/knowledge/${knowledgeId}/files/${fileId}/download`;
};
// Fetch a specific file by ID
export async function fetchFileById(fileId: string): Promise<any | null> {
  return apiRequest(`/api/files/${fileId}`, {
    method: 'GET',
  });
}

// Fetch all files across all knowledge items
export async function fetchAllFiles(): Promise<any[]> {
  return apiRequest(`/api/files`, {
    method: 'GET',
  });
}

// Parse a file to create a parsing task
export const parseFile = async (fileId: string): Promise<{ success: boolean; message?: string; taskId?: string }> => {
  return apiRequest<{ success: boolean; message?: string; taskId?: string }>(`/api/parsing`, {
    method: 'POST',
    body: JSON.stringify({ fileId }),
  });
};
type IParseTaskStatus = {
  completedAt: string;
  createdAt: string;
  fileId: string;
  fileName: string;
  message: string;
  status: 'completed' | 'failed' | 'pending' | 'processing';
  taskId: string;
  updatedAt: string;
};
// Get parsing task status
export const getParsingTaskStatus = async (taskId: string): Promise<IParseTaskStatus> => {
  return apiRequest<IParseTaskStatus>(`/api/parsing/${taskId}/status`, {
    method: 'GET',
  });
};

// Get all parsing tasks
export const getAllParsingTasks = async (): Promise<any[]> => {
  return apiRequest<any[]>(`/api/parsing`, {
    method: 'GET',
  });
};

// Update parsing task status (for admin/worker use)
export const updateParsingTaskStatus = async (
  taskId: string,
  status: string,
  fileContent?: string,
  message?: string // Changed from errorMessage to message
): Promise<any> => {
  return apiRequest<any>(`/api/parsing/${taskId}`, {
    method: 'PATCH',
    body: JSON.stringify({ status, fileContent, message }),
  });
};

// Delete parsing task
export const deleteParsingTask = async (taskId: string): Promise<boolean> => {
  return apiRequest<boolean>(`/api/parsing/${taskId}`, {
    method: 'DELETE',
  });
};

// Get file content
export const getFileContent = async (fileId: string): Promise<{ content: string; originalName: string }> => {
  return apiRequest<{ content: string; originalName: string }>(`/api/files/${fileId}/content`, {
    method: 'GET',
  });
};

// Update file configuration
export const updateFileConfig = async (fileId: string, config: string | null): Promise<boolean> => {
  return apiRequest<boolean>(`/api/files/${fileId}/config`, {
    method: 'PATCH',
    body: JSON.stringify({ config }),
  });
};

export async function fetchFilesByKnowledgeId(knowledgeId: string) {
  try {
    return apiRequest<IFile[]>(`/api/knowledge/${knowledgeId}/files`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error fetching files:', error);
    throw error;
  }
}

// Get file chunks using nbase service
export const getFileChunks = async (fileId: string): Promise<any[]> => {
  try {
    // Determine which vector database to use
    const vectorDBType = process.env.VECTOR_DB_TYPE || 'local';
    switch (vectorDBType) {
      case 'nbase':
        return await getNbaseFileChunks(fileId);
      default: // 'local'
        const response = await apiRequest<{ chunks: IChunk[] }>(`/api/files/${fileId}/chunks`, {
          method: 'GET',
        });
        return response.chunks || [];
    }
  } catch (error) {
    console.error('Error getting file chunks:', error);
    return [];
  }
};
