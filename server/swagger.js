const swaggerJsdoc = require("swagger-jsdoc");
const path = require("path");

const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Digital Library API",
            version: "1.0.0",
            description:
                "REST API for the Digital Library system including member auth, books, loans, and reservations."
        },
        servers: [
            {
                url: "http://localhost:5000",
                description: "Local development server"
            }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT"
                }
            },
            schemas: {
                MemberRegister: {
                    type: "object",
                    required: ["name", "email", "password"],
                    properties: {
                        name: { type: "string", example: "Alice Johnson" },
                        email: { type: "string", format: "email", example: "alice@example.com" },
                        password: { type: "string", example: "secret123" }
                    }
                },
                MemberLogin: {
                    type: "object",
                    required: ["email", "password"],
                    properties: {
                        email: { type: "string", format: "email", example: "alice@example.com" },
                        password: { type: "string", example: "secret123" },
                        loginRole: {
                            type: "string",
                            enum: ["member", "admin"],
                            example: "member"
                        }
                    }
                },
                Book: {
                    type: "object",
                    required: ["title", "author", "available_copies"],
                    properties: {
                        title: { type: "string", example: "Clean Code" },
                        author: { type: "string", example: "Robert C. Martin" },
                        isbn: { type: "string", example: "9780132350884" },
                        category: { type: "string", example: "Programming" },
                        available_copies: { type: "integer", example: 3 }
                    }
                },
                LoanIssue: {
                    type: "object",
                    required: ["member_id", "book_id"],
                    properties: {
                        member_id: { type: "integer", example: 5 },
                        book_id: { type: "integer", example: 2 },
                        issue_date: { type: "string", format: "date-time", example: "2026-08-15T10:00:00.000Z" },
                        due_date: { type: "string", format: "date-time", example: "2026-08-22T10:00:00.000Z" }
                    }
                },
                ReservationCreate: {
                    type: "object",
                    required: ["book_id"],
                    properties: {
                        book_id: { type: "integer", example: 2 }
                    }
                }
            }
        }
    },
    apis: [
        path.join(__dirname, "routes", "*.js"),
        path.join(__dirname, "app.js")
    ]
};

module.exports = swaggerJsdoc(options);
