import { ValidationLocale } from "@n2flow/types";
import React from "react";

export interface CommonActions {
  onCopy: () => void;
  onPaste: () => void;
  onDuplicate: () => void;
  undo: () => void;
  redo: () => void;
  onLayout: (type: string) => void;
  onGroupNodes: () => void;
  onUngroupNodes: () => void;
  onDownloadImage: () => void;
  onClear: () => void;
}

export interface PanelStates {
  setIsPlaygroundOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setIsFlowManagerOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setIsVariablesPanelOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setIsVersionHistoryOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setShowShortcutHelp: React.Dispatch<React.SetStateAction<boolean>>;
  setShowCommandPalette: React.Dispatch<React.SetStateAction<boolean>>;
  setShowMinimap: React.Dispatch<React.SetStateAction<boolean>>;
}

export interface EditorContextProps extends CommonActions, PanelStates {
  currentFlowName: string;
  setCurrentFlowName: (name: string) => void;
  isSaving: boolean;
  onSave: (name: string, versionLabel?: string, isAutoSave?: boolean) => void;
  onRunAll: () => void;
  onValidateFlow: () => void;
  validationLocale: ValidationLocale;
  setValidationLocale: React.Dispatch<React.SetStateAction<ValidationLocale>>;
  importInputRef: React.RefObject<HTMLInputElement>;
  onImport: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onExport: () => void;
  setIsLiveMode: React.Dispatch<React.SetStateAction<boolean>>;
  isLiveMode: boolean;
  reactFlowInstance: any;
  navigate: (path: string) => void;
  lastAutoSave: number | null;
  isAutoSaving: boolean;
  isOnline?: boolean;
}
