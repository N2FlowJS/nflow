# NFlow: Intelligent Document Processing & Knowledge Engine

## Overview

NFlow is an intelligent document processing and knowledge management system that leverages vector embeddings and natural language processing to extract, organize, and query information from various document formats.

![NFlow Architecture](./docs/assets/nflow-architecture.png)

## Key Features

- **Document Processing**: Extract text and metadata from multiple file formats (PDF, DOCX, XLSX, TXT, MD)
- **Knowledge Graph**: Build structured knowledge representations from unstructured content
- **Vector Search**: Find semantically similar content using AI embeddings
- **Workflow Automation**: Create automated processing pipelines for documents
- **API Integration**: Easy integration with existing systems via REST API

## System Requirements

- Node.js 18.x or higher
- SQLite (default) or PostgreSQL database
- 4GB RAM minimum (8GB+ recommended)
- OpenAI API key for embeddings generation

## Quick Start

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/nflow.git
   cd nflow
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. Initialize the database:
   ```bash
   npm run prisma:migrate
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

6. Open your browser to http://localhost:3000

## Configuration

NFlow can be configured through environment variables:

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | Database connection string | `file:./nflow.db` |
| `OPENAI_API_KEY` | OpenAI API key for embeddings | - |
| `EMBEDDING_MODEL` | Model for generating embeddings | `text-embedding-3-small` |
| `VECTOR_DB_TYPE` | Vector database to use (`nbase`, `local`) | `local` |
| `NBASE_URL` | URL for NBase vector database | `http://localhost:1307` |
| `NEXT_PUBLIC_BASE_URL` | Base URL for Next.js app | `http://localhost:3000` |

See `.env.example` for a complete list of configuration options.

## Vector Database Options

NFlow supports multiple vector database backends:

### Local SQLite (Default)
- Stores vectors directly in the SQLite database
- Simple setup, no additional services required
- Limited performance for large datasets

### NBase (Recommended)
- High-performance vector database included with NFlow
- Optimized for semantic search and similarity queries
- Requires separate process (automatically managed in development)

To use NBase, set `VECTOR_DB_TYPE=nbase` in your `.env` file.

## Documentation

- [User Guide](./docs/user-guide.md)
- [API Reference](./docs/api-reference.md)
- [Technical Architecture](./docs/technical-architecture.md)
- [Vector Database Guide](./docs/vector-database.md)
- [Integration Guide](./docs/integration-guide.md)
- [Deployment Guide](./docs/deployment.md)

## Development

### Project Structure

```
nflow/
├── components/       # React components
├── lib/             # Core backend logic
│   ├── services/    # Service modules
│   ├── utils/       # Utility functions
│   └── prisma/      # Database models and migrations
├── nbase/           # NBase vector database
├── pages/           # Next.js pages
│   ├── api/         # API endpoints
│   └── ...          # Frontend pages
├── public/          # Static assets
└── scripts/         # Utility scripts
```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run linter
- `npm run prisma:studio` - Open Prisma database GUI
- `npm run prisma:migrate` - Apply database migrations
- `npm run start:nbase` - Start NBase vector database separately

## License

[MIT License](./LICENSE)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request
