---
layout: default
title: System Architecture
nav_order: 3
---

# NFlow System Architecture

NFlow is a modern web-based intelligent document processing and knowledge management system. It uses AI techniques like vector embeddings and natural language processing (NLP) to extract, organize, and query information from various document formats (PDF, DOCX, XLSX, TXT, MD). The application has a Next.js and React front-end with a modular back-end.

The main components and technologies used include:

- **User Interface (Frontend Layer):** The application uses Next.js (React) with Ant Design for UI components, Tailwind CSS for styling, and XYFlow for visualizing process diagrams. Client-side state is managed for a smooth interactive experience.

- **API/Backend Layer (API Layer):** Implemented as Next.js API Routes (serverless functions), providing RESTful APIs for the interface and external integrations. It handles authentication (JWT via NextAuth), authorization (RBAC), and business functions. Key endpoints include user/auth management (`/api/auth`, `/api/user`), document management (`/api/files`), knowledge base management (`/api/knowledge`), and AI processing APIs (`/api/llm`, `/api/agent`). The back-end is written in TypeScript, runs on Node.js, and uses Prisma ORM to connect to the relational database.

- **Document Processing and Embedding Layer (Processing Layer):** This layer provides specialized services such as Document Service, Embedding Service, Vector Database Service, and Knowledge Service. These services are responsible for:
  - **Document Analysis:** Extracting text and metadata from various file formats using libraries like `pdf2json`, `officeparser`, and `mammoth`. The extracted text is split into chunks for further processing.
  - **Embedding Creation:** Creating embedding vectors for each text chunk using the OpenAI API for semantic search.
  - **Vector Storage and Query:** Storing vectors in either SQLite (local) or NBase, a dedicated vector database optimized for high-performance approximate search.
  - **Knowledge Management:** Building a knowledge graph from structured data extracted via the Knowledge Service, allowing users to create, update, and query stored knowledge.

- **Storage Layer:** NFlow uses Prisma ORM to interact with the relational database. The default is SQLite (file-based), but PostgreSQL is supported for large-scale production. Key tables include *User*, *File*, and *TextChunk*. Document files are stored on the hard drive or an optional storage service. Vectors are stored either within SQLite or on a dedicated NBase server.

- **Integration and Utility Layer (Integration Layer):** NFlow supports integration with other systems via REST APIs and webhooks. It also features export/import functionality for knowledge exchange and allows setting up automatic workflows (Automation).

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