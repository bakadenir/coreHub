import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'coreHub API',
            version: '1.0.0',
            description: 'API documentation for coreHub - Personal productivity hub',
            contact: {
                name: 'coreHub Support',
                email: 'bakadenir@gmail.com',
            },
        },
        servers: [
            {
                url: 'https://corehub-api-production.up.railway.app',
                description: 'Production server',
            },
            {
                url: 'http://localhost:3001',
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
            schemas: {
                Error: {
                    type: 'object',
                    properties: {
                        error: { type: 'string' },
                        message: { type: 'string' },
                    },
                },
                Note: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', format: 'uuid' },
                        title: { type: 'string' },
                        content: { type: 'string' },
                        tag: { type: 'string' },
                        contentType: { type: 'string', enum: ['rich', 'markdown'] },
                        isPinned: { type: 'boolean' },
                        isPublic: { type: 'boolean' },
                        publicSlug: { type: 'string', nullable: true },
                        createdAt: { type: 'string', format: 'date-time' },
                        updatedAt: { type: 'string', format: 'date-time' },
                    },
                },
                Habit: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', format: 'uuid' },
                        name: { type: 'string' },
                        description: { type: 'string' },
                        frequency: { type: 'string' },
                        icon: { type: 'string' },
                        color: { type: 'string' },
                        targetCount: { type: 'integer' },
                        createdAt: { type: 'string', format: 'date-time' },
                    },
                },
                Todo: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', format: 'uuid' },
                        title: { type: 'string' },
                        description: { type: 'string' },
                        isCompleted: { type: 'boolean' },
                        dueDate: { type: 'string', format: 'date-time', nullable: true },
                        priority: { type: 'string', enum: ['low', 'medium', 'high'] },
                        listId: { type: 'string', format: 'uuid', nullable: true },
                        createdAt: { type: 'string', format: 'date-time' },
                    },
                },
                Schedule: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', format: 'uuid' },
                        title: { type: 'string' },
                        description: { type: 'string' },
                        startTime: { type: 'string', format: 'date-time' },
                        endTime: { type: 'string', format: 'date-time' },
                        isAllDay: { type: 'boolean' },
                        color: { type: 'string' },
                        createdAt: { type: 'string', format: 'date-time' },
                    },
                },
                Link: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', format: 'uuid' },
                        url: { type: 'string', format: 'uri' },
                        title: { type: 'string' },
                        description: { type: 'string' },
                        favicon: { type: 'string' },
                        folder: { type: 'string' },
                        createdAt: { type: 'string', format: 'date-time' },
                    },
                },
            },
        },
        security: [{ bearerAuth: [] }],
    },
    apis: ['./src/routes/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
