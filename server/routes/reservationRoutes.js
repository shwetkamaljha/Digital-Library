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

/**
 * @openapi
 * /reservations:
 *   post:
 *     summary: Create a reservation for an unavailable book
 *     tags: [Reservations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ReservationCreate'
 *     responses:
 *       201:
 *         description: Reservation created successfully
 *       400:
 *         description: Book available or missing book id
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden to non-members
 */
router.post(
    "/",
    verifyToken,
    requireRole("member"),
    reserve
);

/**
 * @openapi
 * /reservations/mine:
 *   get:
 *     summary: Get a member's own reservation list
 *     tags: [Reservations]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Reservation list returned successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden to non-members
 */
router.get(
    "/mine",
    verifyToken,
    requireRole("member"),
    myReservations
);

// =====================================
// ADMIN / LIBRARIAN
// =====================================

/**
 * @openapi
 * /reservations:
 *   get:
 *     summary: Get all reservations for staff
 *     tags: [Reservations]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Reservation list returned successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get(
    "/",
    verifyToken,
    requireRole("admin", "librarian"),
    allReservations
);

/**
 * @openapi
 * /reservations/{id}/accept:
 *   put:
 *     summary: Accept a pending reservation and issue the book to the member
 *     tags: [Reservations]
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
 *         description: Reservation accepted and book issued
 *       400:
 *         description: Reservation already processed or book unavailable
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Reservation not found
 */
router.put(
    "/:id/accept",
    verifyToken,
    requireRole("admin", "librarian"),
    accept
);


module.exports = router;