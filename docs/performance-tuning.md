---
layout: default
title: Performance Tuning
nav_order: 12
---

# Performance Tuning Guide

This guide provides tips and best practices for optimizing NFlow performance.

## General Recommendations

- Use the latest Node.js LTS version
- Enable production mode (`NODE_ENV=production`)
- Monitor resource usage (CPU, RAM, disk, network)

## Database Optimization

- Use PostgreSQL for production workloads
- Add indexes to frequently queried fields
- Enable connection pooling
- Regularly vacuum and analyze the database

## Vector Database Optimization

- Use NBase for large datasets
- Tune NBase index parameters (HNSW, batch size, etc.)
- Monitor NBase health and stats endpoints

## Embedding Generation

- Batch embedding requests to avoid API rate limits
- Cache embeddings for repeated content
- Monitor token usage and costs

## API & Backend

- Enable HTTP compression
- Use a process manager (PM2, systemd)
- Implement caching for frequent queries

## Frontend

- Use code splitting and lazy loading
- Optimize images and static assets
- Minimize bundle size

## Scaling

- Use load balancers for horizontal scaling
- Deploy stateless application instances
- Use distributed caching (Redis) if needed

## Monitoring

- Set up health checks for all services
- Collect logs and metrics (Prometheus, Grafana, etc.)
- Set up alerts for error rates and resource exhaustion

## Troubleshooting

- Use debug logs (`DEBUG=nflow:*`)
- Profile slow queries and endpoints
- Check system resource limits

See also: [Deployment Guide](deployment.md), [Vector Database Guide](vector-database.md)
