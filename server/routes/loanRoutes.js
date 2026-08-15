const express = require("express");

const router = express.Router();


const {
    issue,
    returnLoan,
    history,
    myHistory
} = require("../controllers/loanController");


const verifyToken =
    require("../middleware/authMiddleware");

const requireRole =
    require("../middleware/roleMiddleware");

// =====================================================
// MEMBER → BOOK NOW
// =====================================================

/**
 * @openapi
 * /loans/issue:
 *   post:
 *     summary: Issue a book to a member
 *     tags: [Loans]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoanIssue'
 *     responses:
 *       201:
 *         description: Book issued successfully
 *       400:
 *         description: Missing member or book ID or book unavailable
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden to non-members
 */
router.post(
    "/issue",
    verifyToken,
    requireRole("member"),
    issue
);

// =====================================================
// MEMBER → MY BORROWING HISTORY
// =====================================================

/**
 * @openapi
 * /loans/my-history:
 *   get:
 *     summary: Get the current member's loan history
 *     tags: [Loans]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Member loan history returned successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden to non-members
 */
router.get(
    "/my-history",
    verifyToken,
    requireRole("member"),
    myHistory
);

// =====================================================
// ADMIN / LIBRARIAN → MANUAL ISSUE
// =====================================================

/**
 * @openapi
 * /loans/admin/issue:
 *   post:
 *     summary: Manually issue a book by admin or librarian
 *     tags: [Loans]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoanIssue'
 *     responses:
 *       201:
 *         description: Loan created successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden to non-admin users
 */
router.post(
    "/admin/issue",
    verifyToken,
    requireRole("admin", "librarian"),
    issue
);

// =====================================================
// ADMIN / LIBRARIAN → ALL LOANS
// =====================================================

/**
 * @openapi
 * /loans/history:
 *   get:
 *     summary: Get all loan records
 *     tags: [Loans]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Loan history returned successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get(
    "/history",
    verifyToken,
    requireRole("admin", "librarian"),
    history
);

// =====================================================
// ADMIN / LIBRARIAN → RETURN BOOK
// =====================================================

/**
 * @openapi
 * /loans/return/{id}:
 *   put:
 *     summary: Return a borrowed book and calculate any late fine
 *     tags: [Loans]
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
 *         description: Book returned successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Loan not found
 */
router.put(
    "/return/:id",
    verifyToken,
    requireRole("admin", "librarian"),
    returnLoan
);


module.exports = router;