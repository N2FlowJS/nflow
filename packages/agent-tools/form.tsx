import React from 'react';
import { AgentToolsConfig } from './agentTools';

interface AgentToolsFormProps {
  value: AgentToolsConfig;
  onChange?: (val: AgentToolsConfig) => void;
}

export const AgentToolsForm: React.FC<AgentToolsFormProps> = ({ value }) => {
  return (
    <div className="space-y-4">
      <div className="text-sm text-neutral-600 dark:text-neutral-300">Configure which tools the agent can use.</div>
      {/* Reuse the node UI for now */}
      <div>
        {/* This could import and reuse <AgentToolsNode /> but kept inline to reduce coupling */}
      </div>
      <pre className="text-xs bg-neutral-100 dark:bg-neutral-800 p-2 rounded">{JSON.stringify(value, null, 2)}</pre>
    </div>
  );
};
