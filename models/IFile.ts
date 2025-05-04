
export type IFile = {
    path: string;
    id: string;
    content: string | null;
    size: number;
    originalName: string;
    mimetype: string;
    knowledgeId: string;
    config:  any | null;
    createdAt: Date;
    parsingStatus: string | null;
    filename: string;
}