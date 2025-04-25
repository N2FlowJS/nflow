import { Prisma } from "@prisma/client";

export type IFile = {
    path: string;
    id: string;
    content: string | null;
    size: number;
    originalName: string;
    mimetype: string;
    knowledgeId: string;
    config: Prisma.JsonValue | null;
    createdAt: Date;
    parsingStatus: string | null;
    filename: string;
}