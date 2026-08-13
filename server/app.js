require("dotenv").config();

const express = require("express");
const cors = require("cors");

const db = require("./config/db");

const bookRoutes = require("./routes/bookRoutes");
const memberRoutes = require("./routes/memberRoutes");
const loanRoutes = require("./routes/loanRoutes");
const reservationRoutes = require("./routes/reservationRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/books", bookRoutes);
app.use("/members", memberRoutes);
app.use("/loans", loanRoutes);
app.use("/reservations", reservationRoutes);

app.get("/", (req, res) => {
    res.send("Digital Library Backend Running...");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(
        `Server Running on http://localhost:${PORT}`
    );
});