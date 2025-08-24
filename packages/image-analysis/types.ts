import { BaseForm, BaseNodeData } from '@n2flowjs/flow';

export interface ImageAnalysisForm extends BaseForm {
  name: string;
  description?: string;
  imagePath: string;
  analysisType: 'metadata' | 'dimensions' | 'colors' | 'text_recognition' | 'object_detection';
  ocrLanguage?: string;
  colorPalette?: number;
  outputDetails?: boolean;
}

export type ImageAnalysisNodeData = BaseNodeData<ImageAnalysisForm> & {
  type: 'imageanalysis';
};


// Auto-added augmentation for NodeDataMap
declare module '../../models/nodeDataMap' {
  interface NodeDataMap {
    ImageAnalysisNodeData: ImageAnalysisNodeData;
  }
}
