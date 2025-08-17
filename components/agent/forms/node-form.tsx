import React, { useMemo } from 'react';
import { FlowNode } from '../../../models/flowTypes';
import { getDiscoveredNodeForms } from '../../../packages/@node-plugin/discovery/ui-discover';

interface NodeFormProps {
  form: any;
  selectedNode: FlowNode | null;
  setIsDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const NodeForm: React.FC<NodeFormProps> = ({ form, selectedNode, setIsDrawerOpen }) => {
  const discoveredForms = useMemo(() => {
    try {
      return getDiscoveredNodeForms();
    } catch {
      return {} as Record<string, React.ComponentType<any>>;
    }
  }, []);

  const renderNodeForm = () => {
    if (!selectedNode) return null;

    const key = selectedNode.type?.replace(/[^a-zA-Z0-9]/g, '') || '';
    const DynamicForm = (discoveredForms as any)[key];
    const commonProps = { form, selectedNode, setIsDrawerOpen };

    if (DynamicForm) return <DynamicForm {...commonProps} />;

    return (
      <div style={{ padding: 12 }}>
        Unsupported node type (no dynamic form found): <strong>{selectedNode.type}</strong>
      </div>
    );
  };

  return <>{renderNodeForm()}</>;
};

export default NodeForm;
