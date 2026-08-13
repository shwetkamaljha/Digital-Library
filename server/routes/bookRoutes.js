const express = require("express");
const router = express.Router();

const {
    getBooks,
    createBook,
    editBook,
    removeBook
} = require("../controllers/bookController");

const verifyToken = require("../middleware/authMiddleware");
const requireRole = require("../middleware/roleMiddleware");

router.get("/", verifyToken, getBooks);
router.post("/", verifyToken, requireRole("admin", "librarian"), createBook);
router.put("/:id", verifyToken, requireRole("admin", "librarian"), editBook);
router.delete("/:id", verifyToken, requireRole("admin", "librarian"), removeBook);

module.exports = router;
