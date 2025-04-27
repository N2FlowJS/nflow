---
layout: default
title: FAQ
nav_order: 13
---

# Frequently Asked Questions (FAQ)

## General

**Q: What is NFlow?**  
A: NFlow is an intelligent document processing and knowledge management system using vector embeddings and NLP.

**Q: What platforms does NFlow support?**  
A: NFlow runs on Node.js and supports deployment on Linux, macOS, and Windows.

## Installation

**Q: What are the prerequisites for installing NFlow?**  
A: Node.js 18+, SQLite or PostgreSQL, and (optionally) NBase for vector search.

## Usage

**Q: How do I upload documents?**  
A: Use the web UI or the `/api/documents` endpoint.

**Q: How do I search for similar content?**  
A: Use the search bar in the UI or the `/api/search` endpoint.

## Vector Database

**Q: When should I use NBase instead of SQLite?**  
A: Use NBase for large datasets or production deployments.

## Embeddings

**Q: Can I use custom embedding models?**  
A: Yes, see [Embedding Models](embedding-models.md) for details.

## Troubleshooting

**Q: Where can I find logs?**  
A: Logs are output to the console by default; configure log files in `.env`.

**Q: How do I reset the database?**  
A: Delete the SQLite file or drop/recreate the PostgreSQL database.

For more, see [Deployment Guide](deployment.md) and [Integration Guide](integration-guide.md).
