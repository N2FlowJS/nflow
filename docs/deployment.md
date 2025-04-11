# NFlow Deployment Guide

This guide provides detailed instructions for deploying NFlow in various environments, from development to production. It covers different deployment options, configuration best practices, and optimization techniques.

## Table of Contents

1. [Deployment Options](#deployment-options)
2. [Environment Setup](#environment-setup)
3. [Database Configuration](#database-configuration)
4. [Vector Database Setup](#vector-database-setup)
5. [Performance Optimization](#performance-optimization)
6. [Security Considerations](#security-considerations)
7. [Monitoring and Maintenance](#monitoring-and-maintenance)
8. [Scaling Strategies](#scaling-strategies)
9. [Containerization](#containerization)
10. [CI/CD Integration](#cicd-integration)

## Deployment Options

NFlow can be deployed in several configurations to match your requirements:

### Self-Hosted Deployment

Self-hosting gives you maximum control over your NFlow installation.

**Requirements:**
- Node.js 18.x or higher
- PostgreSQL (recommended for production) or SQLite
- 4GB RAM minimum (8GB+ recommended)
- Vector database (NBase or local)

**Deployment Steps:**
1. Clone the repository or download the release
2. Install dependencies: `npm install --production`
3. Set up environment variables
4. Build for production: `npm run build`
5. Start the server: `npm run start`

### Cloud Platform Deployment

NFlow works well on cloud platforms like AWS, Azure, or Google Cloud.

#### AWS Deployment

1. **EC2 Instance**:
   - t3.medium or larger (2+ vCPUs, 4+ GB RAM)
   - Amazon Linux 2 or Ubuntu Server
   - Install Node.js and dependencies
   - Follow standard deployment steps

2. **Elastic Beanstalk**:
   - Create a new web server environment
   - Choose Node.js platform
   - Upload application bundle
   - Configure environment variables

#### Azure Deployment

1. **Azure App Service**:
   - Create new App Service (P1v2 or higher)
   - Configure for Node.js
   - Set up deployment from GitHub or upload package
   - Configure environment variables

### Serverless Deployment

NFlow can be deployed in a serverless configuration using Next.js's serverless capabilities.

#### Vercel Deployment

1. Import your project from GitHub
2. Configure build settings:
   ```
   Build Command: npm run build
   Output Directory: .next
   Node.js Version: 18.x
   ```
3. Add environment variables in the Vercel dashboard
4. Deploy with `vercel` or through GitHub integration

**Note**: For serverless deployments, you'll need:
- A PostgreSQL database (consider AWS RDS, Azure Database, or managed solutions like Supabase)
- A separately hosted NBase server for vector search

## Environment Setup

### Required Environment Variables

Create a `.env` file or configure these through your deployment platform:

```
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/nflow

# Authentication
JWT_SECRET=your-secret-key-at-least-32-chars-long
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=another-secure-random-secret

# OpenAI API (for embeddings)
OPENAI_API_KEY=your-openai-api-key
EMBEDDING_MODEL=text-embedding-3-small

# Vector Database
VECTOR_DB_TYPE=nbase
NBASE_URL=http://your-nbase-server:1307

# Application Settings
NODE_ENV=production
PORT=3000
```

### Production Best Practices

1. **Secure Secrets**: Never commit `.env` files to version control
2. **Use Secret Management**: Consider AWS Secrets Manager, Azure Key Vault, or similar services
3. **Rotate Keys**: Regularly update JWT secrets and API keys
4. **Set Node Environment**: Always use `NODE_ENV=production`

## Database Configuration

### SQLite (Development)

SQLite is suitable for development or small deployments:

```
DATABASE_URL=file:./nflow.db
```

Ensure the application has write permissions to the directory.

### PostgreSQL (Production)

For production, PostgreSQL is recommended:

```
DATABASE_URL=postgresql://username:password@hostname:5432/database
```

**PostgreSQL Configuration:**
1. Create a dedicated database user with limited permissions
2. Enable connection pooling for better performance
3. Configure proper backup schedules
4. Consider using managed PostgreSQL services like AWS RDS

### Database Migration

Before starting the application, run database migrations:

```bash
npm run prisma:migrate
```

For serverless environments, run migrations during the build process:

```
"build": "prisma migrate deploy && next build"
```

## Vector Database Setup

NFlow supports two vector database options:

### Local Vector Database

Simple setup but limited performance:

```
VECTOR_DB_TYPE=local
```

No additional configuration required, but not recommended for production with large datasets.

### NBase Vector Database (Recommended)

For production deployments, use NBase:

```
VECTOR_DB_TYPE=nbase
NBASE_URL=http://your-nbase-server:1307
```

**NBase Server Setup:**

1. **Dedicated Server**:
   ```bash
   # Install and run NBase on a separate server
   git clone https://github.com/n-flow/nflow.git
   cd nflow/nbase
   npm install
   npm run build
   npm start
   ```

2. **Docker Deployment**:
   ```bash
   # Run NBase with Docker
   docker run -p 1307:1307 -v /path/to/data:/data nflow/nbase
   ```

3. **Configuration**:
   ```
   # NBase server environment variables
   PORT=1307
   CLUSTER_SIZE=1000
   VECTOR_SIZE=1536
   STORAGE_PATH=/data/vectors.db
   ```

## Performance Optimization

### Node.js Optimizations

1. **Enable Compression**:
   ```javascript
   // In a custom server.js file
   const compression = require('compression');
   app.use(compression());
   ```

2. **Adjust Memory Limits** (for large datasets):
   ```bash
   NODE_OPTIONS="--max-old-space-size=4096" npm run start
   ```

3. **Use PM2 for Process Management**:
   ```bash
   npm install -g pm2
   pm2 start npm --name "nflow" -- start
   ```

### Database Optimizations

1. **Index Important Fields**:
   ```sql
   CREATE INDEX idx_file_knowledge ON File(knowledgeId);
   CREATE INDEX idx_chunk_file ON TextChunk(fileId);
   ```

2. **Connection Pooling**:
   ```
   DATABASE_POOL_SIZE=10
   ```

3. **Optimize Query Patterns**:
   - Limit result sets
   - Use batch operations for large datasets
   - Consider database-specific optimizations

### Caching Strategies

1. **Enable API Response Caching**:
   ```
   ENABLE_API_CACHE=true
   API_CACHE_TTL=3600
   ```

2. **Use Redis** (optional):
   ```
   REDIS_URL=redis://localhost:6379
   ```

## Security Considerations

### Authentication

1. **Configure Next Auth**:
   - Set strong secrets
   - Configure proper callback URLs
   - Implement rate limiting

2. **API Key Management**:
   - Use granular permissions
   - Implement key rotation policies
   - Monitor API key usage

### Data Protection

1. **Input Validation**:
   - All user inputs should be validated
   - Protect against XSS and injection attacks

2. **Content Security Policy**:
   ```
   NEXT_PUBLIC_CSP_HEADER="default-src 'self'; script-src 'self'; style-src 'self'"
   ```

3. **File Upload Security**:
   - Validate file types
   - Scan for malware
   - Set reasonable file size limits

### Network Security

1. **HTTPS Configuration**:
   - Always use HTTPS in production
   - Configure proper SSL certificates
   - Set secure cookie policies

2. **Reverse Proxy Setup** (Nginx example):
   ```nginx
   server {
       listen 443 ssl;
       server_name your-domain.com;
       
       ssl_certificate /path/to/cert.pem;
       ssl_certificate_key /path/to/key.pem;
       
       location / {
           proxy_pass http://localhost:3000;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
       }
   }
   ```

## Monitoring and Maintenance

### Health Checks

Implement regular health checks:

```bash
# Check API status
curl https://your-domain.com/health

# Check NBase status
curl http://your-nbase-server:1307/health
```

### Logging

Configure proper logging:

```
LOG_LEVEL=info
LOG_FORMAT=json
LOG_DESTINATION=file
LOG_FILE_PATH=/var/log/nflow.log
```

### Backup Strategy

1. **Database Backup**:
   ```bash
   # PostgreSQL backup
   pg_dump -U username -d nflow > nflow_backup.sql
   ```

2. **Vector Database Backup**:
   ```bash
   # NBase backup
   curl -X POST http://your-nbase-server:1307/api/db/save \
     -H "Content-Type: application/json" \
     -d '{"path":"/data/backups/vectors_backup.nbase"}'
   ```

3. **Automated Backup Schedule**:
   ```bash
   # Example cron job
   0 2 * * * /path/to/backup_script.sh
   ```

## Scaling Strategies

### Horizontal Scaling

For high-traffic applications:

1. **Load Balancer Setup**:
   - Configure multiple NFlow instances
   - Use a load balancer (AWS ELB, Nginx, etc.)
   - Implement sticky sessions if needed

2. **Stateless Design**:
   - Store session data in database or Redis
   - Avoid local file system dependence
   - Use distributed caching

### Database Scaling

1. **Read Replicas**:
   - Configure PostgreSQL read replicas
   - Direct read queries to replicas

2. **Partitioning**:
   - Consider partitioning large tables
   - Implement sharding for very large datasets

### Vector Database Scaling

1. **NBase Clustering**:
   - Deploy multiple NBase nodes
   - Implement sharding by knowledge base or domain
   - Configure proper load balancing

## Containerization

### Docker Deployment

Use Docker for consistent deployments:

1. **Dockerfile**:
   ```dockerfile
   FROM node:18-alpine
   WORKDIR /app
   
   # Install dependencies
   COPY package*.json ./
   RUN npm ci --production
   
   # Build the application
   COPY . .
   RUN npm run build
   
   # Start the application
   CMD ["npm", "start"]
   ```

2. **Docker Compose** (with NBase):
   ```yaml
   version: '3'
   services:
     nflow:
       build: .
       ports:
         - "3000:3000"
       environment:
         - DATABASE_URL=postgresql://postgres:password@db:5432/nflow
         - VECTOR_DB_TYPE=nbase
         - NBASE_URL=http://nbase:1307
       depends_on:
         - db
         - nbase
     
     db:
       image: postgres:14
       volumes:
         - postgres_data:/var/lib/postgresql/data
       environment:
         - POSTGRES_PASSWORD=password
         - POSTGRES_DB=nflow
     
     nbase:
       build: ./nbase
       ports:
         - "1307:1307"
       volumes:
         - nbase_data:/data
   
   volumes:
     postgres_data:
     nbase_data:
   ```

### Kubernetes Deployment

For large-scale deployments:

1. **Create Kubernetes Manifests**:
   - Deployment configurations
   - Service definitions
   - Persistent volume claims

2. **Resource Allocation**:
   ```yaml
   resources:
     requests:
       memory: "512Mi"
       cpu: "500m"
     limits:
       memory: "2Gi"
       cpu: "2"
   ```

3. **Health Probes**:
   ```yaml
   livenessProbe:
     httpGet:
       path: /api/health
       port: 3000
     initialDelaySeconds: 30
     periodSeconds: 10
   ```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Deploy NFlow

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Use Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18.x'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Run tests
        run: npm test
        
      - name: Build application
        run: npm run build
        
      - name: Deploy to production
        run: |
          # Your deployment script here
          # Examples:
          # - SSH deployment to VM
          # - AWS Elastic Beanstalk deployment
          # - Docker image push and Kubernetes update
```

### Deployment Pipeline Best Practices

1. **Environment Progression**:
   - Deploy to development first
   - Test in staging environment
   - Promote to production

2. **Automated Testing**:
   - Run unit and integration tests
   - Perform database migration tests
   - Test vector search functionality

3. **Rollback Plan**:
   - Maintain previous version for quick rollback
   - Automate database backup before migrations
   - Monitor deployment for early warning signs

## Conclusion

Deploying NFlow requires careful consideration of your infrastructure requirements, especially for the vector database component. For small to medium deployments, the self-hosted approach with PostgreSQL and NBase provides a good balance of performance and manageability. For larger deployments, consider containerization and orchestration tools to manage scaling.

Always prioritize security, implement proper monitoring, and establish consistent backup procedures to protect your data and ensure system reliability.
