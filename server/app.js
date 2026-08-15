require("dotenv").config();

const express = require("express");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");

const db = require("./config/db");
const swaggerSpec = require("./swagger");

const bookRoutes = require("./routes/bookRoutes");
const memberRoutes = require("./routes/memberRoutes");
const loanRoutes = require("./routes/loanRoutes");
const reservationRoutes = require("./routes/reservationRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customSiteTitle: "Digital Library API Docs"
}));

app.use("/books", bookRoutes);
app.use("/members", memberRoutes);
app.use("/loans", loanRoutes);
app.use("/reservations", reservationRoutes);

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
    res.send("Digital Library Backend Running...");
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