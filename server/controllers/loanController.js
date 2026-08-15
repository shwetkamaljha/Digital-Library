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
    console.log("[LOAN_ISSUE] Request received", JSON.stringify({
        user: req.user || null,
        body: req.body,
        params: req.params
    }, null, 2));

    const loan = req.body;

    if (!loan.member_id || !loan.book_id) {
        console.warn("[LOAN_ISSUE_VALIDATION_ERROR] Missing member_id or book_id", JSON.stringify({
            payload: loan,
            user: req.user || null
        }, null, 2));

        return res.status(400).json({
            message: "Member ID and Book ID are required"
        });
    }

    const issueDate = loan.issue_date ? new Date(loan.issue_date) : new Date();
    const dueDate = loan.due_date ? new Date(loan.due_date) : new Date(issueDate.getTime() + 7 * 24 * 60 * 60 * 1000);

    loan.issue_date = issueDate;
    loan.due_date = dueDate;

    decreaseAvailableCopies(loan.book_id, (err, result) => {
        if (err) {
            console.error("[LOAN_ISSUE_DECREASE_COPIES_ERROR]", JSON.stringify({
                error: err,
                stack: err && err.stack,
                loan
            }, null, 2));
            return res.status(500).json({ message: "Error Updating Book Copies" });
        }

        if (result.affectedRows === 0) {
            console.warn("[LOAN_ISSUE_NO_AVAILABLE_COPY] Book unavailable for issue", JSON.stringify({
                book_id: loan.book_id,
                member_id: loan.member_id
            }, null, 2));
            return res.status(400).json({ message: "Book Not Available" });
        }

        issueBook(loan, (err, result) => {
            if (err) {
                console.error("[LOAN_ISSUE_INSERT_ERROR]", JSON.stringify({
                    error: err,
                    stack: err && err.stack,
                    loan
                }, null, 2));

                increaseAvailableCopies(loan.book_id, () => {});

                return res.status(500).json({ message: "Book Issue Failed" });
            }

            console.log("[LOAN_ISSUE_SUCCESS] Created loan", JSON.stringify({
                loan_id: result && result.insertId,
                member_id: loan.member_id,
                book_id: loan.book_id,
                due_date: dueDate
            }, null, 2));

            return res.status(201).json({
                message: "Book Issued Successfully",
                id: result.insertId,
                issue_date: issueDate,
                due_date: dueDate
            });
        });
    });
};

// =====================================================
// RETURN BOOK
// Fine = ₹10 per late day
// =====================================================

const returnLoan = (req, res) => {
    console.log("[LOAN_RETURN] Request received", JSON.stringify({
        loanId: req.params.id,
        user: req.user || null
    }, null, 2));

    const loanId = req.params.id;

    getLoanById(loanId, (err, result) => {
        if (err) {
            console.error("[LOAN_RETURN_FETCH_ERROR]", JSON.stringify({
                error: err,
                stack: err && err.stack,
                loanId
            }, null, 2));
            return res.status(500).json({ message: "Database Error" });
        }

        if (result.length === 0) {
            console.warn("[LOAN_RETURN_NOT_FOUND] loanId not found:", loanId);
            return res.status(404).json({ message: "Loan Not Found" });
        }

        const loan = result[0];

        if (loan.status === "Returned") {
            console.warn("[LOAN_RETURN_ALREADY_RETURNED] Attempted to return loan again", JSON.stringify({
                loanId,
                status: loan.status
            }, null, 2));
            return res.status(400).json({ message: "This book has already been returned" });
        }

        const dueDate = loan.due_date ? new Date(loan.due_date) : new Date(new Date(loan.issue_date).getTime() + 7 * 24 * 60 * 60 * 1000);
        const today = new Date();
        const difference = today.getTime() - dueDate.getTime();
        const lateDays = Math.max(0, Math.floor(difference / (1000 * 60 * 60 * 24)));
        const fine = lateDays * 10;

        console.log("[LOAN_RETURN_FINE_CALC]", JSON.stringify({
            loanId,
            dueDate: dueDate.toISOString(),
            today: today.toISOString(),
            lateDays,
            fine
        }, null, 2));

        increaseAvailableCopies(loan.book_id, (err) => {
            if (err) {
                console.error("[LOAN_RETURN_INCREASE_COPIES_ERROR]", JSON.stringify({
                    error: err,
                    stack: err && err.stack,
                    loanId,
                    book_id: loan.book_id
                }, null, 2));
                return res.status(500).json({ message: "Error Updating Book Copies" });
            }

            updateFine(loanId, fine, (err) => {
                if (err) {
                    console.error("[LOAN_RETURN_UPDATE_FINE_ERROR]", JSON.stringify({
                        error: err,
                        stack: err && err.stack,
                        loanId,
                        fine
                    }, null, 2));
                    return res.status(500).json({ message: "Fine Update Failed" });
                }

                returnBook(loanId, (err) => {
                    if (err) {
                        console.error("[LOAN_RETURN_MARK_RETURNED_ERROR]", JSON.stringify({
                            error: err,
                            stack: err && err.stack,
                            loanId
                        }, null, 2));
                        return res.status(500).json({ message: "Return Failed" });
                    }

                    console.log("[LOAN_RETURN_SUCCESS] Returned loan", JSON.stringify({
                        loanId,
                        fine,
                        late_days: lateDays
                    }, null, 2));

                    return res.status(200).json({
                        message: "Book Returned Successfully",
                        fine,
                        late_days: lateDays
                    });
                });
            });
        });
    });
};

// =====================================================
// ADMIN → ALL LOAN HISTORY
// =====================================================

const history = (req, res) => {
    console.log("[LOAN_HISTORY] Fetching all loan history for staff");

    getLoanHistory((err, result) => {
        if (err) {
            console.error("[LOAN_HISTORY_ERROR]", JSON.stringify({
                error: err,
                stack: err && err.stack,
                user: req.user || null
            }, null, 2));
            return res.status(500).json({ message: "Database Error" });
        }

        console.log("[LOAN_HISTORY_SUCCESS] Records returned:", Array.isArray(result) ? result.length : "unknown");
        res.status(200).json(result);
    });
};

// =====================================================
// MEMBER → OWN LOAN HISTORY
// =====================================================

const myHistory = (req, res) => {
    console.log("[LOAN_MY_HISTORY] Fetching member history for user id:", req.user && req.user.id);

    getMemberLoanHistory(req.user.id, (err, result) => {
        if (err) {
            console.error("[LOAN_MY_HISTORY_ERROR]", JSON.stringify({
                error: err,
                stack: err && err.stack,
                userId: req.user && req.user.id
            }, null, 2));
            return res.status(500).json({ message: "Unable to Load Your History" });
        }

        console.log("[LOAN_MY_HISTORY_SUCCESS] Records returned:", Array.isArray(result) ? result.length : "unknown");
        res.status(200).json(result);
    });
};

module.exports = {
    issue,
    returnLoan,
    history,
    myHistory
};



module.exports = {

    issue,

    returnLoan,

    history,

    myHistory

};