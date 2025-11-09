---
layout: default
title: System Architecture
nav_order: 3
---

# NFlow System Architecture

> This section provides a high-level overview of the NFlow system architecture. For technical details, see [Technical Architecture](technical-architecture.md). For integration, see [Integration Guide](integration-guide.md).

NFlow is a modern web-based intelligent document processing and knowledge management system with a powerful visual flow builder. It uses AI techniques like vector embeddings and natural language processing (NLP) to extract, organize, and query information from various document formats (PDF, DOCX, XLSX, TXT, MD). The application has a Next.js and React front-end with a modular back-end built around a unified node execution system.

## Core Architecture Components

### **1. User Interface (Frontend Layer)**
The application uses Next.js (React) with Ant Design for UI components, Tailwind CSS for styling, and XYFlow for visualizing process diagrams. Client-side state is managed for a smooth interactive experience.

**Key Features:**
- **Visual Flow Builder:** Drag-and-drop canvas for creating complex workflows
- **Node Palette:** Dynamic registry of available node types
- **Custom Node Creation:** User-defined nodes with JavaScript execution
- **Real-time Execution:** Live flow execution with progress tracking

### **2. Flow Execution Engine (Core Layer)**
NFlow's execution engine is built around the `BaseNodeExecutor` pattern, providing unified execution for all node types:

**BaseNodeExecutor Architecture:**
```typescript
abstract class BaseNodeExecutor<TForm> {
  // Unified execution flow for all nodes
  async execute(node, context, dispatcher?): Promise<ExecutionResult>

  // Business logic implemented by subclasses
  protected abstract executeLogic(form, context): Promise<string>
}
```

**Execution Flow:**
1. **Template Processing:** Extract and resolve template variables (`{variable}`)
2. **Input Readiness:** Check if required inputs are available
3. **Business Logic:** Execute node-specific logic
4. **State Management:** Update flow state via dispatcher
5. **Next Node Resolution:** Determine execution path

### **3. Node Package System**
All nodes are implemented as packages with standardized structure:

**Package Structure:**
```
packages/{node-type}/
├── definition.ts    # Node metadata and form configuration
├── executor.ts      # BaseNodeExecutor implementation
└── .nflow.json      # Package configuration
```

**Node Categories:**
- **Built-in Nodes:** Core functionality (math, text processing, etc.)
- **API Nodes:** External service integrations (GitHub, Slack, etc.)
- **Custom Nodes:** User-defined JavaScript nodes
- **Specialized Nodes:** Document processing, AI/ML operations

### **4. API/Backend Layer (API Layer)**
Implemented as Next.js API Routes (serverless functions), providing RESTful APIs for the interface and external integrations. It handles authentication (JWT via NextAuth), authorization (RBAC), and business functions.

**Key Endpoints:**
- **Authentication:** `/api/auth`, `/api/user`
- **Document Management:** `/api/files`, `/api/knowledge`
- **Flow Management:** `/api/flows`, `/api/execution`
- **Custom Nodes:** `/api/custom-nodes`
- **AI Processing:** `/api/llm`, `/api/agent`

### **5. Document Processing and Embedding Layer (Processing Layer)**
This layer provides specialized services such as Document Service, Embedding Service, Vector Database Service, and Knowledge Service. These services are responsible for:
- **Document Analysis:** Extracting text and metadata from various file formats using libraries like `pdf2json`, `officeparser`, and `mammoth`. The extracted text is split into chunks for further processing.
- **Embedding Creation:** Creating embedding vectors for each text chunk using the OpenAI API for semantic search.
- **Vector Storage and Query:** Storing vectors in either SQLite (local) or NBase, a dedicated vector database optimized for high-performance approximate search.
- **Knowledge Management:** Building a knowledge graph from structured data extracted via the Knowledge Service, allowing users to create, update, and query stored knowledge.

### **6. Storage Layer**
NFlow uses Prisma ORM to interact with the relational database. The default is SQLite (file-based), but PostgreSQL is supported for large-scale production. Key tables include *User*, *File*, *TextChunk*, and *CustomNode*. Document files are stored on the hard drive or an optional storage service. Vectors are stored either within SQLite or on a dedicated NBase server.

### **7. Integration and Utility Layer (Integration Layer)**
NFlow supports integration with other systems via REST APIs and webhooks. It also features export/import functionality for knowledge exchange and allows setting up automatic workflows (Automation).

## Technologies Used

- **Frontend:** Next.js (React), Ant Design, React 19, Tailwind CSS, and XYFlow.
- **Backend/API:** Node.js, TypeScript, Next.js API Routes, Prisma ORM, OpenAI SDK.
- **Database:** SQLite (default) or PostgreSQL.
- **Other:** Multer/formidable, bcryptjs, jsonwebtoken, framer-motion, react-markdown, react-mentions, xlsx, mammoth/pdf2json/officeparser.

## Document Processing and Query Flow

NFlow's process consists of document ingestion and knowledge query.

- **Document Ingestion:** A user uploads a document, which is sent to an API endpoint (e.g., `/api/files/upload`). The system saves the file, and the Document Service extracts text and metadata. The text is divided into segments, and the Embedding Service creates vector embeddings using the OpenAI API. These vectors are stored using VectorDB Service in either SQLite or NBase. The text content and structured information are also stored in the relational database.

  > *Upload → Parse (extract) → Chunk (segment) → Create embedding → Save vector and text.*

- **Knowledge Query:** A user submits a query, which is converted into an embedding. The VectorDB Service searches for similar vectors in the vector database and returns the most relevant text segments. These results are fed into the Knowledge Service or an LLM-based answer generator to synthesize an answer.

  > *Query text → Create embedding → Search vector → Collect results → Format answer.*

- **Overview Diagram:** The figure below illustrates the main business flow from uploading a document to returning results for a query.

 *Figure 1: Basic processing flow of NFlow (upload document, extract content and vector; user query → search and answer).*

In summary, NFlow integrates the frontend, API, document processing, and storage layers. The frontend communicates via API with the backend, which coordinates processing services and interacts with the database. This architecture supports both stream processing and event-driven automation, allowing flexible expansion and integration with other systems.

**In summary**, NFlow uses Next.js/React for the interface, Next.js API + Node.js for the backend, Prisma + SQLite/Postgre for relational data, and integrates the NBase system or stores vectors internally to perform semantic search using embeddings. The processing flow starts from uploading the document, through the steps of extracting and embedding vectors, until the user queries and receives information from the system of related data segments.

**Source:** Refer to the official documentation on the NFlow project's GitHub.
