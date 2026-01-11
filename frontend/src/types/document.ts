import { IPaginatedResult } from "./common";

export enum DocumentVisibilityEnum {
  PUBLIC = "PUBLIC",
  PRIVATE = "PRIVATE"
}

export interface ChunkMetadata {
  characterCount: number;
  wordCount: number;
  document_id?: string;
  user_id?: string;
  created_at?: string;
}

export interface DocumentChunk {
  chunk_id: string;
  content: string;
  chunk_index: number;
  metadata: ChunkMetadata;
}

export interface IDocument {
  _id: string;
  name: string;
  metadata: {
    chunk_count: number;
    status: "indexed" | "pending" | "failed";
    source_type?: string;
    file_size?: number;
    mime_type?: string;
  };
  description: string;
  labels: string[];
  visibility: DocumentVisibilityEnum;
  chunks?: DocumentChunk[];
  is_owner?: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateDocumentChunk {
  id: string;
  content: string;
  index: number;
  metadata: {
    characterCount: number;
    wordCount: number;
  };
}

export interface CreateDocumentData {
  name: string;
  description: string;
  chunks: CreateDocumentChunk[];
  labels?: string[];
  visibility?: DocumentVisibilityEnum;
}

export interface UpdateDocumentData {
  name?: string;
  description?: string;
  labels?: string[];
  visibility?: DocumentVisibilityEnum;
}

export type DocumentsResponse = IPaginatedResult<IDocument>;
