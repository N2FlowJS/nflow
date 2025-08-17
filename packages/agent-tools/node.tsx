import React from 'react';
import { AgentToolsConfig } from './agentTools';

interface AgentToolsNodeProps {
  value: AgentToolsConfig;
  onChange: (val: AgentToolsConfig) => void;
}

export const AgentToolsNode: React.FC<AgentToolsNodeProps> = ({ value, onChange }) => {
  const toggleTool = (tool: string) => {
    const exists = value.tools.includes(tool);
    const tools = exists ? value.tools.filter(t => t !== tool) : [...value.tools, tool];
    onChange({ ...value, tools });
  };

  const candidateTools = ['search', 'web-browse', 'calculator', 'code-run'];

  return (
    <div className="space-y-2">
      <div className="font-semibold text-sm">Agent Tools</div>
      <div className="grid grid-cols-2 gap-2">
        {candidateTools.map(t => {
          const active = value.tools.includes(t);
          return (
            <button
              key={t}
              type="button"
              onClick={() => toggleTool(t)}
              className={`px-2 py-1 rounded text-xs border ${active ? 'bg-blue-600 text-white' : 'bg-white dark:bg-neutral-800'}`}
            >
              {t}
            </button>
          );
        })}
      </div>
    </div>
  );
};
