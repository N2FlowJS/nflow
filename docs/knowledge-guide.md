---
layout: default
title: Knowledge Management Guide
nav_order: 16
---

# NFlow Knowledge Management Guide

## Overview

A **Knowledge Base** in NFlow is a logical container for documents, files, and structured information. It enables semantic search, document organization, and serves as the foundation for AI agents and workflows.

## Creating a Knowledge Base

1. Go to the **Knowledge** section in the NFlow dashboard.
2. Click **Add Knowledge**.
3. Enter the required information:
   - **Name**: The title of your knowledge base.
   - **Description**: Purpose or scope of the knowledge base.
   - **Users/Teams**: (Optional) Share access with specific users or teams.
4. Click **Save** to create the knowledge base.

## Uploading and Managing Files

1. Select a knowledge base from the list.
2. Use the **Upload Files** button to add documents (PDF, DOCX, XLSX, TXT, etc.).
3. Uploaded files are listed with their status (not processed, processing, completed, failed).
4. You can:
   - **Parse**: Start document processing and embedding.
   - **Configure**: Adjust chunking and processing settings per file.
   - **Delete**: Remove files from the knowledge base.

## File Processing Flow

- **Upload** → **Parse** → **Extract Text** → **Chunk** → **Generate Embeddings** → **Store Vectors**
- Processing status is updated in real-time. Errors and progress are shown in the UI.

## Sharing and Permissions

- Knowledge bases can be private, user-shared, or team-shared.
- Only owners and authorized users/teams can edit or delete a knowledge base.
- Permissions are managed during creation or via the knowledge base settings.

## Searching Knowledge

- Use the search bar to perform semantic search across all documents in a knowledge base.
- Results are ranked by vector similarity and can be filtered by metadata.

## Editing and Deleting Knowledge

- Click **Edit** to update the name, description, or sharing settings.
- Click **Delete** to remove the knowledge base (irreversible).

## Advanced Configuration

- **Chunking Settings**: Customize how documents are split into chunks (e.g., by paragraph, sentence, or token count).
- **Metadata**: Add custom metadata to files for advanced filtering and search.
- **API Access**: Manage knowledge bases via REST API endpoints for automation.

## Example: Creating and Using a Knowledge Base

1. Create a new knowledge base called "Project Docs".
2. Upload project-related files (PDFs, DOCX, etc.).
3. Parse files to extract and embed content.
4. Use the search feature or an agent to query project information.

## Troubleshooting

- If files are not processed, check parsing status and logs.
- Ensure you have permission to edit or delete the knowledge base.
- For API errors, verify authentication and request format.

## Further Reading

- [Technical Architecture](technical-architecture.md)
- [Agent Usage Guide](agent-guide.md)
- [Integration Guide](integration-guide.md)
