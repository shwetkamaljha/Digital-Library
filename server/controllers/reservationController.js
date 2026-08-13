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

    const { book_id } = req.body;
    const member_id = req.user.id;

    if (!book_id) {
        return res.status(400).json({
            message: "Book ID is required"
        });
    }

    getBookAvailability(book_id, (err, books) => {

        if (err) {
            console.log(err);

            return res.status(500).json({
                message: "Database Error"
            });
        }

        if (books.length === 0) {
            return res.status(404).json({
                message: "Book Not Found"
            });
        }

        // Reservation only if unavailable
        if (Number(books[0].available_copies) > 0) {

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
                    return res.status(500).json({
                        message: "Database Error"
                    });
                }

                if (existing.length > 0) {

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

                            console.log(err);

                            return res.status(500).json({
                                message: "Reservation Failed"
                            });
                        }

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

    getReservations((err, result) => {

        if (err) {

            console.log(err);

            return res.status(500).json({
                message:
                    "Unable to Load Reservations"
            });
        }

        res.status(200).json(result);

    });

};


// =====================================
// MEMBER → MY RESERVATIONS
// =====================================

const myReservations = (req, res) => {

    getMyReservations(
        req.user.id,
        (err, result) => {

            if (err) {

                return res.status(500).json({
                    message:
                        "Unable to Load Your Reservations"
                });

            }

            res.status(200).json(result);

        }
    );

};


// =====================================
// ADMIN → ACCEPT RESERVATION
// =====================================

const accept = (req, res) => {

    const reservationId = req.params.id;

    getReservationById(
        reservationId,
        (err, rows) => {

            if (err) {

                return res.status(500).json({
                    message: "Database Error"
                });

            }

            if (rows.length === 0) {

                return res.status(404).json({
                    message: "Reservation Not Found"
                });

            }

            const reservation = rows[0];

            if (reservation.status !== "Pending") {

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

                        return res.status(500).json({
                            message:
                                "Error Updating Book Copies"
                        });

                    }

                    if (
                        updateResult.affectedRows === 0
                    ) {

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

                                console.log(err);

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

                                        return res.status(500).json({
                                            message:
                                                "Reservation status update failed"
                                        });

                                    }

                                    if (
                                        acceptedResult.affectedRows === 0
                                    ) {

                                        return res.status(500).json({
                                            message:
                                                "Reservation status update failed"
                                        });

                                    }

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