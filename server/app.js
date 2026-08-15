require("dotenv").config();

console.log("[APP_BOOTSTRAP] Starting Digital Library Backend");

const express = require("express");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");

const db = require("./config/db");
const swaggerSpec = require("./swagger");
const requestLogger = require("./middleware/requestLogger");

const bookRoutes = require("./routes/bookRoutes");
const memberRoutes = require("./routes/memberRoutes");
const loanRoutes = require("./routes/loanRoutes");
const reservationRoutes = require("./routes/reservationRoutes");

const app = express();

console.log("[APP_BOOTSTRAP] Express app created");

// Global error handlers
process.on("unhandledRejection", (reason, promise) => {
    console.error("[GLOBAL_UNHANDLED_REJECTION]", JSON.stringify({
        reason: String(reason),
        message: reason && reason.message,
        stack: reason && reason.stack
    }, null, 2));
});

process.on("uncaughtException", (error) => {
    console.error("[GLOBAL_UNCAUGHT_EXCEPTION]", JSON.stringify({
        name: error.name,
        message: error.message,
        stack: error.stack
    }, null, 2));
});

app.use(cors());
console.log("[APP_BOOTSTRAP] CORS middleware added");

app.use(express.json());
console.log("[APP_BOOTSTRAP] JSON parser middleware added");

app.use(requestLogger);
console.log("[APP_BOOTSTRAP] Request logger middleware added");

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customSiteTitle: "Digital Library API Docs"
}));
console.log("[APP_BOOTSTRAP] Swagger UI mounted at /api-docs");

app.use("/books", bookRoutes);
console.log("[APP_BOOTSTRAP] Book routes mounted");

app.use("/members", memberRoutes);
console.log("[APP_BOOTSTRAP] Member routes mounted");

app.use("/loans", loanRoutes);
console.log("[APP_BOOTSTRAP] Loan routes mounted");

app.use("/reservations", reservationRoutes);
console.log("[APP_BOOTSTRAP] Reservation routes mounted");

/**
 * @openapi
 * /:
 *   get:
 *     summary: API health check
 *     tags: [System]
 *     responses:
 *       200:
 *         description: Server is running
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: Digital Library Backend Running...
 */
app.get("/", (req, res) => {
    console.log("[HEALTH_CHECK] Server root endpoint hit");
    res.send("Digital Library Backend Running...");
});

// 404 handler
app.use((req, res) => {
    console.warn("[NOT_FOUND]", JSON.stringify({
        method: req.method,
        path: req.path,
        url: req.originalUrl
    }, null, 2));
    res.status(404).json({ message: "Not Found" });
});

// Global error handler (must be last)
app.use((err, req, res, next) => {
    console.error("[GLOBAL_ERROR_HANDLER]", JSON.stringify({
        timestamp: new Date().toISOString(),
        method: req.method,
        url: req.originalUrl,
        params: req.params,
        query: req.query,
        body: req.body,
        errorName: err && err.name,
        errorMessage: err && err.message,
        errorCode: err && err.code,
        stack: err && err.stack
    }, null, 2));

    return res.status(500).json({
        message: "Internal Server Error",
        error: process.env.NODE_ENV === "production" ? "Something went wrong" : (err && err.message)
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(
        `Server Running on http://localhost:${PORT}`
    );
    console.log(
        `Swagger docs available at http://localhost:${PORT}/api-docs`
    );
});