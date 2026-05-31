import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'N2Flow API Documentation',
      version: '1.0.0',
      description: 'API documentation for N2Flow AI flow editor and execution platform',
      contact: {
        name: 'N2Flow Support',
      },
    },
    servers: [
      {
        url: 'http://localhost:8787',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./routes/*.ts', './index.ts'], // Path to the API docs
};

export const swaggerSpec = swaggerJsdoc(options);
