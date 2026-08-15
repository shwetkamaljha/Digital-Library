const {
    createReservation,
    getReservations,
    getMyReservations,
    getPendingReservation,
    getBookAvailability,
    getReservationById,
    acceptReservation
} = require("../models/reservationModel");

const { decreaseAvailableCopies } = require("../models/bookModel");
const { issueBook } = require("../models/loanModel");

// =====================================
// MEMBER → CREATE RESERVATION
// =====================================

const reserve = (req, res) => {
    console.log("[RESERVATION_CREATE] Request received", JSON.stringify({
        user: req.user || null,
        body: req.body
    }, null, 2));

    const { book_id } = req.body;
    const member_id = req.user.id;

    if (!book_id) {
        console.warn("[RESERVATION_CREATE_VALIDATION_ERROR] Missing book_id", JSON.stringify({
            user: req.user || null,
            body: req.body
        }, null, 2));
        return res.status(400).json({
            message: "Book ID is required"
        });
    }

    getBookAvailability(book_id, (err, books) => {

        if (err) {
            console.error("[RESERVATION_BOOK_CHECK_ERROR]", JSON.stringify({
                error: err,
                stack: err && err.stack,
                book_id,
                member_id
            }, null, 2));

            return res.status(500).json({
                message: "Database Error"
            });
        }

        if (books.length === 0) {
            console.warn("[RESERVATION_BOOK_NOT_FOUND] book_id does not exist:", book_id);
            return res.status(404).json({
                message: "Book Not Found"
            });
        }

        // Reservation only if unavailable
        if (Number(books[0].available_copies) > 0) {
            console.warn("[RESERVATION_INVALID_STATE] Book is available, should use Book Now", JSON.stringify({
                book_id,
                available_copies: books[0].available_copies
            }, null, 2));

            return res.status(400).json({
                message:
                    "This book is currently available. Please use Book Now."
            });
        }

        getPendingReservation(
            member_id,
            book_id,
            (err, existing) => {

                if (err) {
                    console.error("[RESERVATION_PENDING_CHECK_ERROR]", JSON.stringify({
                        error: err,
                        stack: err && err.stack,
                        member_id,
                        book_id
                    }, null, 2));
                    return res.status(500).json({
                        message: "Database Error"
                    });
                }

                if (existing.length > 0) {
                    console.warn("[RESERVATION_DUPLICATE_PENDING] User already has a pending reservation", JSON.stringify({
                        member_id,
                        book_id,
                        existing
                    }, null, 2));

                    return res.status(409).json({
                        message:
                            "You already have a pending reservation for this book."
                    });
                }

                createReservation(
                    {
                        member_id,
                        book_id
                    },
                    (err, result) => {

                        if (err) {

                            console.error("[RESERVATION_CREATE_DATABASE_ERROR]", JSON.stringify({
                                error: err,
                                stack: err && err.stack,
                                member_id,
                                book_id
                            }, null, 2));

                            return res.status(500).json({
                                message: "Reservation Failed"
                            });
                        }

                        console.log("[RESERVATION_CREATE_SUCCESS] Reservation created", JSON.stringify({
                            id: result && result.insertId,
                            member_id,
                            book_id
                        }, null, 2));
                        res.status(201).json({

                            message:
                                "Book Reserved Successfully",

                            id: result.insertId

                        });

                    }
                );

            }
        );

    });

};


// =====================================
// ADMIN → ALL RESERVATIONS
// =====================================

const allReservations = (req, res) => {
    console.log("[RESERVATIONS_ALL] Fetching all reservations for staff");

    getReservations((err, result) => {

        if (err) {

            console.error("[RESERVATIONS_ALL_ERROR]", JSON.stringify({
                error: err,
                stack: err && err.stack,
                user: req.user || null
            }, null, 2));

            return res.status(500).json({
                message:
                    "Unable to Load Reservations"
            });
        }

        console.log("[RESERVATIONS_ALL_SUCCESS] Returned count:", Array.isArray(result) ? result.length : "unknown");
        res.status(200).json(result);

    });

};


// =====================================
// MEMBER → MY RESERVATIONS
// =====================================

const myReservations = (req, res) => {
    console.log("[RESERVATIONS_MY] Fetching reservations for user:", req.user && req.user.id);

    getMyReservations(
        req.user.id,
        (err, result) => {

            if (err) {
                console.error("[RESERVATIONS_MY_ERROR]", JSON.stringify({
                    error: err,
                    stack: err && err.stack,
                    userId: req.user && req.user.id
                }, null, 2));

                return res.status(500).json({
                    message:
                        "Unable to Load Your Reservations"
                });

            }

            console.log("[RESERVATIONS_MY_SUCCESS] Returned count:", Array.isArray(result) ? result.length : "unknown");
            res.status(200).json(result);

        }
    );

};


// =====================================
// ADMIN → ACCEPT RESERVATION
// =====================================

const accept = (req, res) => {
    console.log("[RESERVATION_ACCEPT] Attempting to accept reservation", JSON.stringify({
        reservationId: req.params.id,
        user: req.user || null
    }, null, 2));

    const reservationId = req.params.id;

    getReservationById(
        reservationId,
        (err, rows) => {

            if (err) {
                console.error("[RESERVATION_FETCH_ERROR]", JSON.stringify({
                    error: err,
                    stack: err && err.stack,
                    reservationId
                }, null, 2));

                return res.status(500).json({
                    message: "Database Error"
                });

            }

            if (rows.length === 0) {
                console.warn("[RESERVATION_ACCEPT_NOT_FOUND] Reservation not found", reservationId);
                return res.status(404).json({
                    message: "Reservation Not Found"
                });

            }

            const reservation = rows[0];

            if (reservation.status !== "Pending") {
                console.warn("[RESERVATION_ACCEPT_INVALID_STATUS] Reservation is not pending", JSON.stringify({
                    reservationId,
                    reservationStatus: reservation.status
                }, null, 2));

                return res.status(400).json({
                    message:
                        "Reservation is already processed"
                });

            }

            if (
                Number(
                    reservation.available_copies
                ) <= 0
            ) {
                console.warn("[RESERVATION_ACCEPT_UNAVAILABLE] Staff tried to accept a reservation while book unavailable", JSON.stringify({
                    reservationId,
                    available_copies: reservation.available_copies,
                    book_id: reservation.book_id
                }, null, 2));

                return res.status(400).json({
                    message:
                        "Book is still unavailable. Accept it when a copy is returned."
                });

            }

            // Reduce copy
            decreaseAvailableCopies(
                reservation.book_id,
                (err, updateResult) => {

                    if (err) {
                        console.error("[RESERVATION_COPY_DECREMENT_ERROR]", JSON.stringify({
                            error: err,
                            stack: err && err.stack,
                            reservationId,
                            book_id: reservation.book_id
                        }, null, 2));

                        return res.status(500).json({
                            message:
                                "Error Updating Book Copies"
                        });

                    }

                    if (
                        updateResult.affectedRows === 0
                    ) {
                        console.warn("[RESERVATION_COPY_DECREMENT_NO_ROWS] No copies updated for book_id:", reservation.book_id);

                        return res.status(400).json({
                            message:
                                "Book is no longer available"
                        });

                    }

                    // Issue for 7 days
                    const issueDate = new Date();

                    const dueDate =
                        new Date(issueDate);

                    dueDate.setDate(
                        dueDate.getDate() + 7
                    );

                    issueBook(
                        {
                            member_id:
                                reservation.member_id,

                            book_id:
                                reservation.book_id,

                            issue_date:
                                issueDate,

                            due_date:
                                dueDate
                        },

                        (err, loanResult) => {

                            if (err) {

                                console.error("[RESERVATION_LOAN_ISSUE_ERROR]", JSON.stringify({
                                    error: err,
                                    stack: err && err.stack,
                                    reservationId,
                                    loanPayload: {
                                        member_id: reservation.member_id,
                                        book_id: reservation.book_id,
                                        issue_date: issueDate,
                                        due_date: dueDate
                                    }
                                }, null, 2));

                                // Rollback copy
                                const db =
                                    require("../config/db");

                                db.query(
                                    `
                                    UPDATE books
                                    SET available_copies =
                                        available_copies + 1
                                    WHERE id = ?
                                    `,
                                    [
                                        reservation.book_id
                                    ]
                                );

                                return res.status(500).json({
                                    message:
                                        "Book Issue Failed"
                                });

                            }

                            // Mark reservation accepted
                            acceptReservation(
                                reservationId,
                                (err, acceptedResult) => {

                                    if (err) {
                                        console.error("[RESERVATION_ACCEPT_UPDATE_ERROR]", JSON.stringify({
                                            error: err,
                                            stack: err && err.stack,
                                            reservationId
                                        }, null, 2));

                                        return res.status(500).json({
                                            message:
                                                "Reservation status update failed"
                                        });

                                    }

                                    if (
                                        acceptedResult.affectedRows === 0
                                    ) {
                                        console.warn("[RESERVATION_ACCEPT_UPDATE_NO_ROWS] No rows updated for reservation:", reservationId);

                                        return res.status(500).json({
                                            message:
                                                "Reservation status update failed"
                                        });

                                    }

                                    console.log("[RESERVATION_ACCEPT_SUCCESS] Reservation accepted and loan issued", JSON.stringify({
                                        reservationId,
                                        loan_id: loanResult && loanResult.insertId,
                                        due_date: dueDate
                                    }, null, 2));

                                    res.status(200).json({

                                        message:
                                            "Reservation Accepted and Book Issued",

                                        loan_id:
                                            loanResult.insertId,

                                        due_date:
                                            dueDate

                                    });

                                }
                            );

                        }
                    );

                }
            );

        }
    );

};


module.exports = {
    reserve,
    allReservations,
    myReservations,
    accept
};