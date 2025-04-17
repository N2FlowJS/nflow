export const EXECUTION_STATUS = {
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  ERROR: 'error',
} as const;

export type EXECUTION_STATUS = (typeof EXECUTION_STATUS)[keyof typeof EXECUTION_STATUS];
