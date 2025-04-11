# Nbase Integration Guide

This guide explains how to set up and use Nbase as a vector database with nFlow.

## What is Nbase?

Nbase is a vector database designed for efficient similarity search. It provides:

- High-performance vector indexing and retrieval
- Multiple search algorithms (KNN, HNSW, Hybrid)
- Metadata filtering
- Bulk operations

## Configuration

To use Nbase with nFlow, add the following to your environment variables:

```env
# Vector database configuration
VECTOR_DB_TYPE=nbase

# Nbase Configuration
NBASE_URL=http://localhost:1307
```

## Setup Instructions

1. Install and start the Nbase server:

```bash
# Clone the Nbase repository
git clone https://github.com/n-flow/nbase.git

# Navigate to the directory
cd nbase

# Install dependencies
npm install

# Start the server
npm start
```

2. Update your nFlow environment variables to use Nbase (see above)

3. Restart your nFlow application

## Testing the Integration

You can test if Nbase is properly connected by:

1. Uploading a document to your knowledge base
2. Monitoring the logs to see if vectors are stored in Nbase
3. Performing a search against the document

## Troubleshooting

If you encounter issues with the Nbase integration:

- Check if the Nbase server is running (`curl http://localhost:1307/stats`)
- Verify your environment variables are correctly set
- Check the nFlow logs for any errors related to Nbase
- Ensure your Nbase server has enough memory for vector operations

## Advanced Configuration

For production deployments, you may want to configure:

- Persistence settings for Nbase
- Authentication for the Nbase API
- Load balancing for high-volume applications
