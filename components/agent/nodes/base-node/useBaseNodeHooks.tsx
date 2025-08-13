import React, { useCallback, useMemo, useRef } from 'react';
import { Handle, Position, useReactFlow } from '@xyflow/react';
import type { GlobalToken } from 'antd/es/theme/interface';
import { getHandleStyle } from './handle-icon';
import { Modal } from 'antd';
import { theme } from 'antd';
import { useCardStyle } from '../../../../hooks/useCardStyle';
import { NODE_REGISTRY } from '../../../../utils/client/NODE_REGISTRY';
import { useNodeExecutionStatus } from '../../../../context/FlowStateContext';
import type { NodeData } from '../../../../models/flowTypes';
import { useFlowEditorContext } from '../../canvas/FlowEditorContext';

export type HandleStyleOpts = {
  sourceColor: string;
  targetColor: string;
  borderColor: string;
  shadow: string;
};

// Utility: group handle positions to know how many handles exist per side
const groupByPosition = (positions: Position[]) => {
  const map = new Map<Position, number>();
  positions.forEach((pos) => map.set(pos, (map.get(pos) ?? 0) + 1));
  return map; // position -> count
};

export const useHandleOptions = (token: GlobalToken): HandleStyleOpts => {
  return useMemo(
    () => ({
      sourceColor: token.colorSuccess,
      targetColor: token.colorPrimary,
      borderColor: (token as any).colorBorderSecondary ?? token.colorBorder,
      shadow: (token as any).boxShadowSecondary ?? token.boxShadow,
    }),
    [
      token.colorSuccess,
      token.colorPrimary,
      (token as any).colorBorderSecondary,
      token.colorBorder,
      (token as any).boxShadowSecondary,
      token.boxShadow,
    ]
  );
};

export const useChildrenSection = (children?: React.ReactNode) =>
  useMemo(() => (children ? <div style={{ padding: '10px 0' }}>{children}</div> : null), [children]);

export const useInputHandles = (positions: Position[], opts: HandleStyleOpts) => {
  return useMemo(() => {
    const grouped = groupByPosition(positions);
    const handles: React.ReactNode[] = [];

    grouped.forEach((count, pos) => {
      for (let i = 0; i < count; i++) {
        const hid = `in-${pos}-${i}`;
        handles.push(
          <Handle
            key={hid}
            type="target"
            position={pos}
            style={getHandleStyle?.(pos, 'target', i, count, opts)}
            id={hid}
          />
        );
      }
    });

    return handles;
  }, [positions, opts]);
};

export const useOutputHandles = (args: {
  positions: Position[];
  opts: HandleStyleOpts;
  id: string;
  dataType: string;
  getNode: (id: string) => any;
  wrapperRef: React.RefObject<HTMLDivElement | null>;
  openNextStepModal?: (p: any) => void;
}) => {
  const { positions, opts, id, dataType, getNode, wrapperRef, openNextStepModal } = args;

  const createOnClick = useCallback(
    (hid: string, pos: Position) => (e: React.MouseEvent<HTMLDivElement>) => {
      e.stopPropagation();
      const n = getNode(id as any);
      const sourceW = n?.width ?? n?.measured?.width ?? wrapperRef.current?.offsetWidth ?? undefined;
      const sourceH = n?.height ?? n?.measured?.height ?? wrapperRef.current?.offsetHeight ?? undefined;

      openNextStepModal?.({
        nodeId: id,
        handleId: hid,
        handleType: 'source',
        position: pos,
        nodeType: dataType as any,
        clientX: (e as any).clientX,
        clientY: (e as any).clientY,
        sourceW: sourceW as number,
        sourceH: sourceH as number,
      });
    },
    [dataType, getNode, id, openNextStepModal, wrapperRef]
  );

  return useMemo(() => {
    const grouped = groupByPosition(positions);
    const handles: React.ReactNode[] = [];

    grouped.forEach((count, pos) => {
      for (let i = 0; i < count; i++) {
        const hid = `out-${pos}-${i}`;
        handles.push(
          <Handle
            key={hid}
            type="source"
            position={pos}
            style={getHandleStyle?.(pos, 'source', i, count, opts)}
            id={hid}
            onClick={createOnClick(hid, pos)}
          />
        );
      }
    });

    return handles;
  }, [positions, opts, createOnClick]);
};

export const useNodeActions = (args: {
  id: string;
  deleteNode: (id: string) => void;
  openConfigDrawer: () => void;
}) => {
  const { id, deleteNode, openConfigDrawer } = args;

  const handleDebug = useCallback(() => {
    // Keep a lightweight debug log; can be swapped for an injected logger
    // eslint-disable-next-line no-console
    console.log(`Debugging node ${id}`);
  }, [id]);

  const handleConfig = useCallback(() => {
    openConfigDrawer();
  }, [openConfigDrawer]);

  // We return a placeholder for delete; the component can wrap it with Modal.confirm
  const doDelete = useCallback(() => deleteNode(id), [deleteNode, id]);

  return { handleDebug, handleConfig, doDelete };
};

export const useDeleteConfirm = (doDelete: () => void) => {
  return useCallback(() => {
    Modal.confirm({
      title: 'Are you sure you want to delete this node?',
      content: 'This action cannot be undone.',
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onOk() {
        doDelete();
      },
    });
  }, [doDelete]);
};

// Hook: auto-select the node when hovered
export const useHoverSelectOnEnter = (id: string) => {
  const { setNodes } = useReactFlow();

  return useCallback(() => {
    setNodes((nds: any[]) => nds.map((n) => (n.id === id ? { ...n, selected: true } : { ...n, selected: false })));
  }, [id, setNodes]);
};

// Composed hook: encapsulates BaseNode behavior and wiring so component stays lean
export const useBaseNode = (args: {
  data: NodeData;
  id: string;
  selected: boolean;
  handlePositions: { input: Position[]; output: Position[] };
  children?: React.ReactNode;
}) => {
  const { data, id, selected, handlePositions, children } = args;

  // Context and config
  const nodeConfig = NODE_REGISTRY[data.type];
  const isExecutedNode = useNodeExecutionStatus(id);
  const { openConfigDrawer, deleteNode, openNextStepModal } = useFlowEditorContext();
  const { getNode } = useReactFlow();
  const { token } = theme.useToken();

  // Styles and refs
  const cardStyle = useCardStyle({ selected, isExecutedNode, nodeConfig });
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Derived UI pieces
  const handleOpts = useHandleOptions(token as any);
  const childrenSection = useChildrenSection(children);
  const inputHandles = useInputHandles(handlePositions.input, handleOpts);
  const outputHandles = useOutputHandles({
    positions: handlePositions.output,
    opts: handleOpts,
    id,
    dataType: String(data.type),
    getNode: getNode as any,
    wrapperRef: wrapperRef as React.RefObject<HTMLDivElement | null>,
    openNextStepModal,
  });

  // Actions
  const { handleConfig, handleDebug, doDelete } = useNodeActions({ id, deleteNode, openConfigDrawer });
  const handleDelete = useDeleteConfirm(doDelete);
  const onMouseEnter = useHoverSelectOnEnter(id);

  return {
    cardStyle,
    wrapperRef,
    childrenSection,
    inputHandles,
    outputHandles,
    actions: { handleConfig, handleDebug, handleDelete },
    onMouseEnter,
  };
};

// Hook: NodeHeader helpers
export const useNodeHeader = (icon?: React.ReactNode) => {
  const { token } = theme.useToken();
  const unifiedIcon = useMemo(() => {
    if (React.isValidElement(icon)) {
      return React.cloneElement(icon as React.ReactElement<any>, {
        style: { ...((icon as any).props?.style || {}), color: token.colorPrimary },
      });
    }
    return icon ?? null;
  }, [icon, token.colorPrimary]);

  return { unifiedIcon };
};
