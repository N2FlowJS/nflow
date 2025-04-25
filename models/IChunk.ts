import { JsonValue } from "@prisma/client/runtime/library";

export type IChunk = {
  id: string;
  content: string;
  chunkIndex: number;
  fileId: string;
  fileName: string;
  knowledgeId: string;
  metadata: JsonValue;
};
