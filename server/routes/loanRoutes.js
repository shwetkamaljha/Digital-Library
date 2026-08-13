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

router.post(
    "/issue",
    verifyToken,
    requireRole("member"),
    issue
);



// =====================================================
// MEMBER → MY BORROWING HISTORY
// =====================================================

router.get(
    "/my-history",
    verifyToken,
    requireRole("member"),
    myHistory
);



// =====================================================
// ADMIN / LIBRARIAN → MANUAL ISSUE
// =====================================================

router.post(
    "/admin/issue",
    verifyToken,
    requireRole("admin", "librarian"),
    issue
);



// =====================================================
// ADMIN / LIBRARIAN → ALL LOANS
// =====================================================

router.get(
    "/history",
    verifyToken,
    requireRole("admin", "librarian"),
    history
);



// =====================================================
// ADMIN / LIBRARIAN → RETURN BOOK
// =====================================================

router.put(
    "/return/:id",
    verifyToken,
    requireRole("admin", "librarian"),
    returnLoan
);


module.exports = router;