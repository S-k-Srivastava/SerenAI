import { QdrantClient } from "@qdrant/js-client-rest";

export interface IDocumentFilterRequest {
    document_id: { $in: string[] } | string;
}

export interface IDocumentMetadataRequest {
    document_id: string;
    user_id: string;
    chunk_id: string;
    chunk_index: number;
    [key: string]: unknown;
}

export interface IIndexDocumentsResponse {
    indexed_count: number;
    ids: string[];
}

export interface IChunkResponse {
    chunk_id: string;
    content: string;
    chunk_index: number;
    metadata: Record<string, unknown>;
}

export interface IVectorService {
    getClient(): QdrantClient;
    indexDocuments(texts: string[], metadata: Record<string, unknown>[]): Promise<IIndexDocumentsResponse>;
    deleteDocuments(filter: IDocumentFilterRequest): Promise<void>;
    getChunksByDocumentId(documentId: string): Promise<IChunkResponse[]>;
    getChunksByIds(chunkIds: string[]): Promise<IChunkResponse[]>;
}
