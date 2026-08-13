const express = require("express");

const router = express.Router();

const {
    reserve,
    allReservations,
    myReservations,
    accept
} = require("../controllers/reservationController");

const verifyToken =
    require("../middleware/authMiddleware");

const requireRole =
    require("../middleware/roleMiddleware");


// =====================================
// MEMBER
// =====================================

// Create reservation
router.post(
    "/",
    verifyToken,
    requireRole("member"),
    reserve
);

// View own reservations
router.get(
    "/mine",
    verifyToken,
    requireRole("member"),
    myReservations
);


// =====================================
// ADMIN / LIBRARIAN
// =====================================

// View all reservations
router.get(
    "/",
    verifyToken,
    requireRole("admin", "librarian"),
    allReservations
);

// Accept reservation
router.put(
    "/:id/accept",
    verifyToken,
    requireRole("admin", "librarian"),
    accept
);


module.exports = router;