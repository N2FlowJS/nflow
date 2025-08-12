import React, { useCallback, useMemo } from 'react';
import { Handle, Position } from '@xyflow/react';
import type { GlobalToken } from 'antd/es/theme/interface';
import { getHandleStyle } from './handle-icon';
import { Modal } from 'antd';

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
