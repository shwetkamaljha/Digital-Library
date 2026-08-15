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

/**
 * @openapi
 * /members/register:
 *   post:
 *     summary: Register a new library member
 *     tags: [Members]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MemberRegister'
 *     responses:
 *       201:
 *         description: Member created successfully
 *       400:
 *         description: Missing required fields
 *       409:
 *         description: Email already exists
 */
router.post("/register", register);

/**
 * @openapi
 * /members/login:
 *   post:
 *     summary: Sign in and receive a JWT token
 *     tags: [Members]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MemberLogin'
 *     responses:
 *       200:
 *         description: Login successful with JWT token
 *       400:
 *         description: Missing email or password
 *       401:
 *         description: Invalid credentials
 *       403:
 *         description: Wrong role selected for user type
 */
router.post("/login", login);

/**
 * @openapi
 * /members:
 *   get:
 *     summary: Get all members
 *     tags: [Members]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of members
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden to non-admin users
 */
router.get("/", verifyToken, requireRole("admin", "librarian"), getMembers);

/**
 * @openapi
 * /members/{id}:
 *   put:
 *     summary: Update a member record
 *     tags: [Members]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             additionalProperties: true
 *     responses:
 *       200:
 *         description: Member updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.put("/:id", verifyToken, requireRole("admin", "librarian"), editMember);

/**
 * @openapi
 * /members/{id}:
 *   delete:
 *     summary: Delete a member record
 *     tags: [Members]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Member deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.delete("/:id", verifyToken, requireRole("admin", "librarian"), removeMember);

module.exports = router;
