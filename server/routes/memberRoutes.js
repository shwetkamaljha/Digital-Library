const express = require("express");
const router = express.Router();

const {
    register,
    login,
    getMembers,
    editMember,
    removeMember
} = require("../controllers/memberController");

const verifyToken = require("../middleware/authMiddleware");
const requireRole = require("../middleware/roleMiddleware");

router.post("/register", register);
router.post("/login", login);

router.get("/", verifyToken, requireRole("admin", "librarian"), getMembers);
router.put("/:id", verifyToken, requireRole("admin", "librarian"), editMember);
router.delete("/:id", verifyToken, requireRole("admin", "librarian"), removeMember);

module.exports = router;
