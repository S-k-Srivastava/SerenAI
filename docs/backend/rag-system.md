# RAG System Architecture

## Overview

The RAG (Retrieval-Augmented Generation) system combines semantic search with LLM generation to provide context-aware responses from user documents.

**Architecture**:
```
User Question
    ↓
RAG Service → Embedding Factory → OpenAI/Local Embedding
           → Vector Service → Qdrant (semantic search)
           → Model Factory → OpenAI/Ollama LLM
           → Token Service (usage tracking)
    ↓
Response + Source Documents
```

**Key Components** in [src/ai/](../../node-backend/src/ai/):
- RAG Service: Main orchestration
- Vector Service: Qdrant integration
- Embedding Factory: Pluggable embedding providers
- Model Factory: Pluggable LLM providers
- Token Service: Accurate token counting

---

## RAG Pipeline Flow

### 1. Document Indexing

**Entry Point**: [services/user.documents.service.ts](../../node-backend/src/services/user.documents.service.ts)

```typescript
1. User uploads document with pre-chunked text
2. Create Document in MongoDB (status: "pending")
3. Generate embeddings for each chunk
4. Upsert vectors to Qdrant with metadata
5. Update Document (status: "indexed")
6. Track UsageEvent (type: CREATE_DOCUMENT_INDEX)
```

**Chunking**: Handled by frontend/client (not in backend). Chunks sent as array:

```json
{
  "chunks": [
    {
      "chunk_id": "uuid-v4-1",
      "text": "Chunk content...",
      "chunk_index": 0
    }
  ]
}
```

### 2. Chat Query Pipeline

**Entry Point**: [services/user.chats.service.ts](../../node-backend/src/services/user.chats.service.ts)

```typescript
1. User sends message
2. Load ChatBot config (documents, system_prompt, LLM config, temperature, max_tokens)
3. Load Conversation history (last N messages)
4. Call RAG Service:
   a. Embed user question
   b. Vector search in Qdrant (top 4 chunks from chatbot documents)
   c. Build prompt:
      - System prompt
      - Retrieved context chunks
      - Conversation history
      - User question
   d. Call LLM (OpenAI/Ollama)
   e. Track token usage
5. Update Conversation with user + assistant messages
6. Return response + source documents
```

### 3. Public Chat (Anonymous)

Same pipeline as authenticated chat, but:
- Uses `session_id` instead of `user_id`
- Only PUBLIC chatbots accessible
- `UsageEvent` created with `chatbot_owner_id` as user

---

## RAG Service

**File**: [ai/rag.service.ts](../../node-backend/src/ai/rag.service.ts)

**Singleton**: Single instance shared across application.

### `chat(params)` Method

**Parameters**:
```typescript
{
  question: string,
  documentIds: string[],         // MongoDB ObjectIds
  userId: string,                // For vector filtering
  systemPrompt: string,
  history: Message[],            // Previous conversation
  llmConfig: LLMConfig,          // User's LLM settings
  temperature?: number,
  maxTokens?: number
}
```

**Returns**:
```typescript
{
  response: string,              // LLM generated answer
  sourceChunks: Chunk[],         // Top 4 relevant chunks
  usage: {
    prompt_tokens: number,
    completion_tokens: number,
    total_tokens: number
  }
}
```

**Implementation Steps**:

1. **Query Embedding**:
```typescript
const embeddingService = EmbeddingFactory.getEmbeddingService();
const embeddingModel = await embeddingService.getModel();
const queryVector = await embeddingModel.embedQuery(question);
```

2. **Vector Search** (Qdrant):
```typescript
const searchResults = await vectorService.search({
  vector: queryVector,
  filter: {
    must: [
      { key: "document_id", match: { any: documentIds } },
      { key: "user_id", match: { value: userId } }
    ]
  },
  limit: 4,  // Top 4 chunks
  scoreThreshold: 0.3  // Min similarity
});
```

3. **Build Context**:
```typescript
const context = searchResults
  .map(chunk => chunk.text)
  .join("\n\n---\n\n");
```

4. **Build Messages** (LangChain format):
```typescript
[
  { role: "system", content: systemPrompt },
  { role: "system", content: `Context:\n${context}` },
  ...history,  // Previous messages
  { role: "user", content: question }
]
```

5. **LLM Invocation**:
```typescript
const modelService = ModelFactory.getModelService(llmConfig.provider);
const llm = await modelService.getModel(llmConfig, {
  temperature,
  maxTokens
});

const response = await llm.invoke(messages);
```

6. **Token Counting**:
```typescript
const promptTokens = tokenService.countTokens(
  messages,
  llmConfig.model_name
);
const completionTokens = tokenService.countTokens(
  response.content,
  llmConfig.model_name
);
```

7. **Return**:
```typescript
return {
  response: response.content,
  sourceChunks: searchResults,
  usage: {
    prompt_tokens: promptTokens,
    completion_tokens: completionTokens,
    total_tokens: promptTokens + completionTokens
  }
};
```

### Other Methods

#### `getChunks(chunkIds: string[])`
Batch retrieve chunks by IDs from Qdrant.

#### `hydrateMessages(messages: Message[])`
Enrich chat history with source document text for displaying in UI.

---

## Vector Service

**File**: [ai/vector.service.ts](../../node-backend/src/ai/vector.service.ts)

**Singleton**: Single Qdrant client instance.

**Connection**:
```typescript
new QdrantClient({
  url: env.QDRANT_URL,         // http://localhost:6333
  apiKey: env.QDRANT_API_KEY   // Optional
});
```

### Collection Configuration

**Collection**: `documents` (configurable via `QDRANT_COLLECTION_NAME`)

**Vector Config**:
- **Size**: 1536 (OpenAI) or 768 (local) - detected from embedding service
- **Distance**: Cosine similarity
- **On-Disk**: true (for large datasets)

**Payload Schema**:
```typescript
{
  chunk_id: string,      // UUID v4
  document_id: string,   // MongoDB ObjectId
  user_id: string,       // MongoDB ObjectId
  text: string,          // Original chunk text
  chunk_index: number    // Position in document
}
```

**Payload Indexes** (for filtering):
- `document_id` (keyword)
- `chunk_id` (keyword)
- `user_id` (keyword)

**Auto-initialization**: Collection created on first use if not exists.

### Methods

#### `indexDocuments(chunks, userId, documentId)`
Embed and upsert document chunks.

**Parameters**:
```typescript
chunks: Array<{
  chunk_id: string,
  text: string,
  chunk_index: number
}>
userId: string
documentId: string
```

**Process**:
1. Embed all chunk texts in batch
2. Upsert to Qdrant with payload:
```typescript
{
  id: chunk_id,
  vector: embedding,
  payload: {
    chunk_id,
    document_id,
    user_id,
    text,
    chunk_index
  }
}
```

#### `deleteDocuments(documentId)`
Delete all chunks for a document.

**Filter**:
```typescript
{
  must: [
    { key: "document_id", match: { value: documentId } }
  ]
}
```

#### `search(params)`
Semantic similarity search.

**Parameters**:
```typescript
{
  vector: number[],           // Query embedding
  filter: QdrantFilter,       // document_id, user_id filters
  limit: number,              // Top K (default: 4)
  scoreThreshold: number      // Min similarity (default: 0.3)
}
```

**Returns**: Array of chunks with similarity scores.

#### `getChunksByDocumentId(documentId)`
Retrieve all chunks for a document (sorted by `chunk_index`).

#### `getChunksByIds(chunkIds)`
Batch retrieve specific chunks by IDs.

---

## Embedding Providers

### Embedding Factory

**File**: [ai/embedding.factory.ts](../../node-backend/src/ai/embedding.factory.ts)

**Factory Pattern**: Returns embedding service based on `USE_LOCAL_EMBEDDING` config.

```typescript
if (env.USE_LOCAL_EMBEDDING) {
  return new LocalEmbeddingService();
} else {
  return new OpenAIEmbeddingService();
}
```

### OpenAI Embedding Service

**File**: [ai/openai.embedding.service.ts](../../node-backend/src/ai/openai.embedding.service.ts)

**Configuration**:
- **Model**: `text-embedding-3-small`
- **Dimensions**: 1536
- **API Key**: `env.OPENAI_API_KEY`

**Implementation**: Uses `@langchain/openai` `OpenAIEmbeddings` class.

**Cost**: ~$0.02 per 1M tokens.

**getModel()**:
```typescript
return new OpenAIEmbeddings({
  openAIApiKey: env.OPENAI_API_KEY,
  modelName: "text-embedding-3-small",
  dimensions: 1536
});
```

### Local Embedding Service

**File**: [ai/local.embedding.service.ts](../../node-backend/src/ai/local.embedding.service.ts)

**Configuration**:
- **Model**: `BAAI/bge-base-en` (or any HuggingFace model)
- **Dimensions**: 768 (model-dependent)
- **Service**: HuggingFace Text Embeddings Inference (TEI)
- **URL**: `env.EMBEDDING_SERVICE_URL` (http://embeddings:80 in Docker)

**Implementation**: Uses `@huggingface/inference` `HfInference` client.

**Cost**: Free (self-hosted).

**getModel()**:
```typescript
const hf = new HfInference();
return new HuggingFaceInferenceEmbeddings({
  model: env.EMBEDDING_LOCAL_MODEL,
  apiKey: "hf_xxx",  // Not required for local TEI
  endpointUrl: env.EMBEDDING_SERVICE_URL
});
```

**Docker Service**:
```yaml
embeddings:
  image: ghcr.io/huggingface/text-embeddings-inference:cpu-1.2
  command: ["--model-id", "BAAI/bge-base-en", "--port", "80"]
  profiles:
    - local-embeddings
```

**Model Options**:
- `BAAI/bge-base-en` (768 dims) - Recommended, good balance
- `BAAI/bge-small-en` (384 dims) - Lighter, faster
- `BAAI/bge-large-en` (1024 dims) - Best quality, slower

---

## LLM Providers

### Model Factory

**File**: [ai/model.factory.ts](../../node-backend/src/ai/model.factory.ts)

**Factory Pattern**: Returns model service based on `provider` in `LLMConfig`.

```typescript
switch (llmConfig.provider) {
  case "OPENAI":
    return new OpenAIModelService();
  case "OLLAMA":
    return new OllamaModelService();
  default:
    throw new Error("Unsupported provider");
}
```

### OpenAI Model Service

**File**: [ai/openai.model.service.ts](../../node-backend/src/ai/openai.model.service.ts)

**Configuration**:
- **Models**: Any OpenAI chat model (gpt-4, gpt-3.5-turbo, etc.)
- **API Key**: From user's `LLMConfig.api_key`

**getModel(llmConfig, options)**:
```typescript
return new ChatOpenAI({
  openAIApiKey: llmConfig.api_key,
  modelName: llmConfig.model_name,
  temperature: options.temperature,
  maxTokens: options.maxTokens
});
```

**Error Handling**: Fallback to no temperature if model doesn't support it.

**Token Counting**: Uses `tiktoken` library for accurate counts (no API calls).

### Ollama Model Service

**File**: [ai/ollama.model.service.ts](../../node-backend/src/ai/ollama.model.service.ts)

**Configuration**:
- **Models**: Any Ollama model (llama2, mistral, codellama, etc.)
- **Base URL**: From user's `LLMConfig.base_url` (e.g., http://localhost:11434)

**getModel(llmConfig, options)**:
```typescript
const baseUrl = swapLocalhostForDocker(llmConfig.base_url);

return new ChatOpenAI({
  openAIApiKey: "ollama",  // Dummy key
  modelName: llmConfig.model_name,
  configuration: {
    baseURL: `${baseUrl}/v1`  // OpenAI-compatible endpoint
  },
  temperature: options.temperature,
  maxTokens: options.maxTokens
});
```

**Docker Compatibility**: Automatically swaps `localhost` → `host.docker.internal` when running in container.

**No API Key Required**: Ollama is local/self-hosted.

**Token Counting**: Uses `tiktoken` with fallback encoding (gpt-4).

---

## Token Service

**File**: [ai/token.service.ts](../../node-backend/src/ai/token.service.ts)

**Purpose**: Accurate token counting without API calls.

**Library**: `tiktoken` (official OpenAI tokenizer)

### `countTokens(text, modelName)`

**Supports**:
- `gpt-4`, `gpt-4-turbo`, `gpt-4o`
- `gpt-3.5-turbo`
- `text-embedding-ada-002`, `text-embedding-3-small`

**Encoding**:
- Uses model-specific encoding (cl100k_base for GPT-4, p50k_base for older models)
- Fallback to `gpt-4` encoding for unknown models (e.g., Ollama)

**Usage**:
```typescript
const tokens = tokenService.countTokens(
  "Hello, how are you?",
  "gpt-4"
);
// Returns: 6
```

**Message Counting**:
```typescript
const tokens = messages.reduce((sum, msg) => {
  return sum + tokenService.countTokens(msg.content, modelName);
}, 0);
```

---

## RAG Performance Tuning

### Vector Search Parameters

**Top K** (default: 4):
- Higher K = more context but slower, more tokens
- Lower K = faster but may miss relevant info
- Recommended: 3-5 for most use cases

**Score Threshold** (default: 0.3):
- Higher = stricter relevance, fewer results
- Lower = more results, may include noise
- Recommended: 0.2-0.4 (cosine similarity)

**Filters**:
- Always filter by `document_id` (chatbot documents only)
- Always filter by `user_id` (data isolation)

### Embedding Strategy

**OpenAI** (text-embedding-3-small):
- ✅ Best quality
- ✅ No infrastructure required
- ❌ API costs (~$0.02/1M tokens)
- ❌ External dependency

**Local** (BAAI/bge-base-en):
- ✅ Free
- ✅ Private data (no external calls)
- ❌ Requires CPU/GPU resources
- ❌ Slightly lower quality

**Recommendation**:
- **Development**: Use local embeddings (save costs)
- **Production**: Use OpenAI for best quality, or local if privacy/cost sensitive

### LLM Strategy

**OpenAI GPT-4**:
- ✅ Best responses
- ❌ Expensive ($0.03/1K prompt tokens, $0.06/1K completion tokens)
- Use for: High-value conversations

**OpenAI GPT-3.5-turbo**:
- ✅ Good quality
- ✅ 10x cheaper than GPT-4
- Use for: General chatbots

**Ollama (llama2, mistral)**:
- ✅ Free
- ✅ Private
- ❌ Requires GPU (8GB+ VRAM recommended)
- ❌ Slower inference
- Use for: Cost-sensitive, privacy-critical, or offline deployments

### Temperature Settings

- **0.0-0.3**: Deterministic, factual responses (support bots)
- **0.4-0.7**: Balanced creativity (default: 0.7)
- **0.8-2.0**: Creative, varied responses (storytelling)

### Max Tokens

- **500-1000**: Short answers (FAQs)
- **1000-2000**: Standard responses (default: 2000)
- **2000+**: Long-form content (articles)

**Note**: Higher max_tokens = higher costs and latency.

---

## Usage Tracking

**Event Types**:

1. **CREATE_DOCUMENT_INDEX**:
   - Created during document indexing
   - Token count = sum of all chunk embeddings
   - Provider = embedding service (OPENAI/LOCAL)

2. **QUERY_DOCUMENT**:
   - Created during vector search
   - Token count = query embedding
   - Provider = embedding service

3. **LLM_INPUT**:
   - Created during chat
   - Token count = system prompt + context + history + question
   - Provider = LLM provider (OPENAI/OLLAMA)

4. **LLM_OUTPUT**:
   - Created during chat
   - Token count = assistant response
   - Provider = LLM provider

**Service**: [services/usageEvents.service.ts](../../node-backend/src/services/usageEvents.service.ts)

**Example**:
```typescript
await usageEventsService.createEvent({
  user_id: userId,
  provider: "OPENAI",
  model_name: "gpt-4",
  token_count: 150,
  event_type: "LLM_OUTPUT"
});
```

---

## Error Handling

### Embedding Errors
- **OpenAI API Failure**: Retry with exponential backoff (LangChain built-in)
- **Local Service Down**: Return 503, log error
- **Invalid API Key**: Return 401 to user

### Vector DB Errors
- **Qdrant Down**: Return 503, retry indexing later
- **Collection Not Found**: Auto-create collection
- **Search Timeout**: Return partial results or empty

### LLM Errors
- **OpenAI Rate Limit**: Return 429, suggest retry after delay
- **Ollama Timeout**: Return 504, suggest checking Ollama service
- **Invalid Model**: Return 400, list supported models
- **Context Too Long**: Truncate history or context, retry

### Graceful Degradation
- If no chunks found (low similarity), still respond: "I don't have specific information about that in the documents."
- If LLM fails, return error with chunk sources: "Error generating response, but here are relevant sections..."

---

## Testing RAG System

### Manual Testing

**1. Test Document Indexing**:
```bash
curl -X POST http://localhost:5000/api/v1/documents \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Doc",
    "chunks": [
      {"chunk_id": "uuid1", "text": "Paris is the capital of France.", "chunk_index": 0}
    ]
  }'
```

**2. Test Chat**:
```bash
curl -X POST http://localhost:5000/api/v1/chat/conversation/<id> \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "What is the capital of France?"
  }'
```

**Expected**: Response mentions Paris with source chunk.

### Debugging

**Enable Debug Logs**:
Set `LOG_LEVEL=debug` in `.env` and restart with `./start.sh --dev`

**Check Qdrant**:
```bash
curl http://localhost:6333/collections/documents
```

**Check Token Counts**:
Look for `UsageEvent` records in MongoDB after chat.

---

## Scaling Considerations

### Horizontal Scaling
- **RAG Service**: Stateless, can run multiple instances
- **Qdrant**: Supports clustering for large datasets
- **Embedding Service**: Can deploy multiple TEI containers with load balancer

### Performance Bottlenecks
1. **Embedding Generation**: Slowest part (100-500ms per chunk)
   - Solution: Batch embed multiple chunks together
2. **Vector Search**: Fast (<50ms) unless dataset is huge
   - Solution: Use Qdrant filters, enable HNSW indexing
3. **LLM Inference**: 1-5 seconds depending on model and tokens
   - Solution: Use faster models (gpt-3.5-turbo, local quantized models)

### Cost Optimization
- Cache embeddings (don't re-embed same text)
- Use smaller chunks (reduce embedding costs)
- Use local embeddings for non-critical use cases
- Set aggressive max_tokens limits
- Use cheaper models for simple queries

---

## Future Enhancements

- [ ] Hybrid search (keyword + semantic)
- [ ] Chunk reranking (improve relevance)
- [ ] Multi-query retrieval (generate multiple search queries)
- [ ] Streaming responses (real-time UI updates)
- [ ] Caching frequent queries (Redis)
- [ ] Fine-tuned embeddings (domain-specific)
- [ ] Agentic RAG (tool use, web search augmentation)

---

**Last Updated**: 11 January 2026
**Documentation Version**: 1.0.0
