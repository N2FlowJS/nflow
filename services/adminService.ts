import { apiRequest } from "./apiUtils";

/**
 * Get worker status and task statistics without requiring authentication
 */
export const getWorkerStatus = async (): Promise<any> => {
  try {
    const response = await fetch('/api/admin/workers', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Ensure the returned data has the expected structure
    return {
      workerConfig: data.workerConfig || {
        enabled: false, 
        maxWorkers: 0, 
        pollingInterval: 5000
      },
      taskStats: data.taskStats || {
        byStatus: [],
        pending: 0,
        processing: 0,
        completed: 0,
        failed: 0,
        total: 0
      },
      recentTasks: Array.isArray(data.recentTasks) ? data.recentTasks : []
    };
  } catch (error) {
    console.error('Error fetching worker status:', error);
    // Return default data structure in case of error
    return {
      workerConfig: { enabled: false, maxWorkers: 0, pollingInterval: 5000 },
      taskStats: {
        byStatus: [],
        pending: 0,
        processing: 0,
        completed: 0,
        failed: 0,
        total: 0
      },
      recentTasks: []
    };
  }
};

/**
 * Get pending tasks count (for dashboard indicators)
 */
export const getPendingTasksCount = async (): Promise<number> => {
  try {
    const status = await getWorkerStatus();
    return status?.taskStats?.pending || 0;
  } catch (error) {
    console.error('Error getting pending tasks count:', error);
    return 0;
  }
};

/**
 * Fetch overall system statistics for the dashboard
 */
export const getSystemStats = async (): Promise<any> => {
  try {
    const response = await apiRequest('/api/admin/stats', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
     return response;
    
  } catch (error) {
    console.error('Error fetching system statistics:', error);
    return {
      userStats: { total: 0 },
      teamStats: { total: 0 },
      knowledgeStats: { total: 0 },
      fileStats: { total: 0, byStatus: [] },
      taskStats: { total: 0, byStatus: [] },
      agentStats: { total: 0, active: 0, inactive: 0 },
      chunkStats: { total: 0 }
    };
  }
};
