const {
    issueBook,
    returnBook,
    getLoanById,
    getLoanHistory,
    updateFine,
    getMemberLoanHistory
} = require("../models/loanModel");

const {
    decreaseAvailableCopies,
    increaseAvailableCopies
} = require("../models/bookModel");


// =====================================================
// ISSUE BOOK
// Used by member "Book Now" and admin manual issue
// =====================================================

const issue = (req, res) => {

    const loan = req.body;

    // Member can issue for himself
    // Admin can issue for selected member
    if (!loan.member_id || !loan.book_id) {

        return res.status(400).json({
            message: "Member ID and Book ID are required"
        });

    }


    const issueDate = loan.issue_date
        ? new Date(loan.issue_date)
        : new Date();


    const dueDate = loan.due_date
        ? new Date(loan.due_date)
        : new Date(
            issueDate.getTime() +
            7 * 24 * 60 * 60 * 1000
        );


    loan.issue_date = issueDate;
    loan.due_date = dueDate;


    // Reduce available copies
    decreaseAvailableCopies(
        loan.book_id,
        (err, result) => {

            if (err) {

                console.log(err);

                return res.status(500).json({
                    message: "Error Updating Book Copies"
                });

            }


            // No copy available
            if (result.affectedRows === 0) {

                return res.status(400).json({
                    message: "Book Not Available"
                });

            }


            // Create loan
            issueBook(
                loan,
                (err, result) => {

                    if (err) {

                        console.log(err);

                        // Rollback book copy
                        increaseAvailableCopies(
                            loan.book_id,
                            () => {}
                        );

                        return res.status(500).json({
                            message: "Book Issue Failed"
                        });

                    }


                    return res.status(201).json({

                        message:
                            "Book Issued Successfully",

                        id:
                            result.insertId,

                        issue_date:
                            issueDate,

                        due_date:
                            dueDate

                    });

                }
            );

        }
    );

};



// =====================================================
// RETURN BOOK
// Fine = ₹10 per late day
// =====================================================

const returnLoan = (req, res) => {

    const loanId = req.params.id;


    getLoanById(
        loanId,
        (err, result) => {

            if (err) {

                console.log(err);

                return res.status(500).json({
                    message: "Database Error"
                });

            }


            if (result.length === 0) {

                return res.status(404).json({
                    message: "Loan Not Found"
                });

            }


            const loan = result[0];


            // Already returned
            if (loan.status === "Returned") {

                return res.status(400).json({
                    message:
                        "This book has already been returned"
                });

            }


            // -----------------------------------------
            // Calculate late fine
            // -----------------------------------------

            const dueDate = loan.due_date
                ? new Date(loan.due_date)
                : new Date(
                    new Date(loan.issue_date).getTime() +
                    7 * 24 * 60 * 60 * 1000
                );


            const today = new Date();


            const difference =
                today.getTime() -
                dueDate.getTime();


            const lateDays = Math.max(
                0,
                Math.floor(
                    difference /
                    (1000 * 60 * 60 * 24)
                )
            );


            // ₹10 per late day
            const fine = lateDays * 10;


            // -----------------------------------------
            // Increase available copies
            // -----------------------------------------

            increaseAvailableCopies(
                loan.book_id,
                (err) => {

                    if (err) {

                        console.log(err);

                        return res.status(500).json({
                            message:
                                "Error Updating Book Copies"
                        });

                    }


                    // ---------------------------------
                    // Save fine
                    // ---------------------------------

                    updateFine(
                        loanId,
                        fine,
                        (err) => {

                            if (err) {

                                console.log(err);

                                return res.status(500).json({
                                    message:
                                        "Fine Update Failed"
                                });

                            }


                            // -----------------------------
                            // Mark loan as returned
                            // -----------------------------

                            returnBook(
                                loanId,
                                (err) => {

                                    if (err) {

                                        console.log(err);

                                        return res.status(500).json({
                                            message:
                                                "Return Failed"
                                        });

                                    }


                                    return res.status(200).json({

                                        message:
                                            "Book Returned Successfully",

                                        fine:
                                            fine,

                                        late_days:
                                            lateDays

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



// =====================================================
// ADMIN → ALL LOAN HISTORY
// =====================================================

const history = (req, res) => {

    getLoanHistory(
        (err, result) => {

            if (err) {

                console.log(err);

                return res.status(500).json({
                    message: "Database Error"
                });

            }


            res.status(200).json(
                result
            );

        }
    );

};



// =====================================================
// MEMBER → OWN LOAN HISTORY
// =====================================================

const myHistory = (req, res) => {

    getMemberLoanHistory(
        req.user.id,
        (err, result) => {

            if (err) {

                console.log(err);

                return res.status(500).json({
                    message:
                        "Unable to Load Your History"
                });

            }


            res.status(200).json(
                result
            );

        }
    );

};



module.exports = {

    issue,

    returnLoan,

    history,

    myHistory

};