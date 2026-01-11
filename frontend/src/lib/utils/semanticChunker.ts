import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';

export interface Chunk {
    id: string;
    content: string;
    index: number;
    metadata: {
        characterCount: number;
        wordCount: number;
    };
}

export interface ChunkingOptions {
    chunkSize?: number;
    chunkOverlap?: number;
    onProgress?: (progress: number) => void;
}

/**
 * Chunks text using semantic boundaries with LangChain's RecursiveCharacterTextSplitter
 * This splitter tries to keep semantically related text together by splitting on paragraphs,
 * sentences, and words in that order.
 */
export const chunkTextSemanticically = async (
    text: string,
    options: ChunkingOptions = {}
): Promise<Chunk[]> => {
    const {
        chunkSize = 1000,
        chunkOverlap = 200,
        onProgress,
    } = options;

    try {
        if (onProgress) onProgress(10);

        // Create a semantic text splitter
        const splitter = new RecursiveCharacterTextSplitter({
            chunkSize,
            chunkOverlap,
            separators: ['\n\n', '\n', '. ', '! ', '? ', '; ', ', ', ' ', ''],
            keepSeparator: false,
        });

        if (onProgress) onProgress(30);

        // Split the text into chunks
        const textChunks = await splitter.createDocuments([text]);

        if (onProgress) onProgress(70);

        // Convert to our Chunk format with metadata
        const chunks: Chunk[] = textChunks.map((doc, index) => {
            const content = doc.pageContent;
            const wordCount = content.split(/\s+/).filter(word => word.length > 0).length;

            return {
                id: `chunk-${index + 1}-${Date.now()}`,
                content,
                index: index + 1,
                metadata: {
                    characterCount: content.length,
                    wordCount,
                },
            };
        });

        if (onProgress) onProgress(100);

        return chunks;
    } catch (error) {
        console.error('Error chunking text:', error);
        throw new Error('Failed to chunk text semantically');
    }
};

/**
 * Get statistics about the chunks
 */
export const getChunkStatistics = (chunks: Chunk[]) => {
    const totalChunks = chunks.length;
    const totalCharacters = chunks.reduce((sum, chunk) => sum + chunk.metadata.characterCount, 0);
    const totalWords = chunks.reduce((sum, chunk) => sum + chunk.metadata.wordCount, 0);
    const avgCharactersPerChunk = totalChunks > 0 ? Math.round(totalCharacters / totalChunks) : 0;
    const avgWordsPerChunk = totalChunks > 0 ? Math.round(totalWords / totalChunks) : 0;

    return {
        totalChunks,
        totalCharacters,
        totalWords,
        avgCharactersPerChunk,
        avgWordsPerChunk,
    };
};

/**
 * Validate chunk size and overlap settings
 */
export const validateChunkingSettings = (chunkSize: number, chunkOverlap: number): boolean => {
    if (chunkSize <= 0) {
        throw new Error('Chunk size must be greater than 0');
    }
    if (chunkOverlap < 0) {
        throw new Error('Chunk overlap cannot be negative');
    }
    if (chunkOverlap >= chunkSize) {
        throw new Error('Chunk overlap must be less than chunk size');
    }
    return true;
};
