const db = require("../config/db");

// Issue Book
const issueBook = (loan, callback) => {

    const sql = `
        INSERT INTO loans
        (member_id, book_id, issue_date, due_date, status)
        VALUES (?, ?, ?, ?, 'Issued')
    `;

    db.query(
        sql,
        [
            loan.member_id,
            loan.book_id,
            loan.issue_date,
            loan.due_date
        ],
        (err, result) => {

            if (err) {
                return callback(err, null);
            }

            callback(null, result);

        }
    );

};


// Return Book
const returnBook = (loanId, callback) => {

    const sql = `
        UPDATE loans
        SET
            status = 'Returned',
            return_date = CURDATE()
        WHERE id = ?
        AND status != 'Returned'
    `;

    db.query(sql, [loanId], (err, result) => {

        if (err) {
            return callback(err, null);
        }

        callback(null, result);

    });

};


// Update Fine
const updateFine = (loanId, fine, callback) => {

    const sql = `
        UPDATE loans
        SET fine = ?
        WHERE id = ?
    `;

    db.query(sql, [fine, loanId], (err, result) => {

        if (err) {
            return callback(err, null);
        }

        callback(null, result);

    });

};


// Get Loan By ID
const getLoanById = (loanId, callback) => {

    const sql = `
        SELECT *
        FROM loans
        WHERE id = ?
    `;

    db.query(sql, [loanId], (err, result) => {

        if (err) {
            return callback(err, null);
        }

        callback(null, result);

    });

};


// Loan History
const getLoanHistory = (callback) => {

    const sql = `
        SELECT
            loans.id,
            members.name AS member_name,
            books.title AS book_title,
            loans.issue_date,
            loans.due_date,
            loans.return_date,
            loans.fine,
            loans.status
        FROM loans
        JOIN members
            ON loans.member_id = members.id
        JOIN books
            ON loans.book_id = books.id
        ORDER BY loans.id DESC
    `;

    db.query(sql, (err, result) => {

        if (err) {
            return callback(err, null);
        }

        callback(null, result);

    });

};

const getMemberLoanHistory = (memberId, callback) => {

    const sql = `
        SELECT
            loans.id,
            books.title AS book_title,
            loans.issue_date,
            loans.return_date,
            loans.status,
            loans.fine
        FROM loans
        JOIN books
            ON loans.book_id = books.id
        WHERE loans.member_id = ?
        ORDER BY loans.id DESC
    `;

    db.query(sql, [memberId], callback);
};

module.exports = {
    issueBook,
    returnBook,
    getLoanById,
    getLoanHistory,
    updateFine,
    getMemberLoanHistory
};
