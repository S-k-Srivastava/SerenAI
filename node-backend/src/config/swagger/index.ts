import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { Express } from "express";
import { env } from "../env/index.js";

const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Node Backend API",
            version: "1.0.0",
            description: "API for SaaS Chatbot Platform",
        },
        servers: [
            {
                url: `http://localhost:${env.PORT}/api/${env.API_VERSION}`,
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT",
                },
            },
        },
        security: [
            {
                bearerAuth: [],
            },
        ],
    },
    apis: ["./src/routes/*.ts", "./src/controllers/*.ts"],
};

const specs = swaggerJsdoc(options);

export const setupSwagger = (app: Express) => {
    app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));
};
