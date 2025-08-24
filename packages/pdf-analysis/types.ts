import { BaseForm, BaseNodeData } from '@n2flowjs/flow';

export interface PdfAnalysisForm extends BaseForm {
  name: string;
  description?: string;
  pdfPath: string;
  operation: 'extract_text' | 'extract_metadata' | 'extract_images' | 'split_pages' | 'merge_pdfs';
  pageRange?: string;
  outputDir?: string;
  preserveFormatting?: boolean;
  extractImages?: boolean;
}

export type PdfAnalysisNodeData = BaseNodeData<PdfAnalysisForm> & {
  type: 'pdfanalysis';
};


// Auto-added augmentation for NodeDataMap
declare module '../../models/nodeDataMap' {
  interface NodeDataMap {
    PdfAnalysisNodeData: PdfAnalysisNodeData;
  }
}
