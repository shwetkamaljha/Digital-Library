const knex = require("../config/db");

// Issue Book
const issueBook = (loan, callback) => {
    knex("loans")
        .insert({
            member_id: loan.member_id,
            book_id: loan.book_id,
            issue_date: loan.issue_date,
            due_date: loan.due_date,
            status: "Issued"
        })
        .then((result) => {
            callback(null, {
                insertId: result[0],
                affectedRows: 1
            });
        })
        .catch((err) => callback(err, null));
};


// Return Book
const returnBook = (loanId, callback) => {
    knex("loans")
        .where("id", loanId)
        .andWhere("status", "!=", "Returned")
        .update({
            status: "Returned",
            return_date: knex.raw("CURDATE()")
        })
        .then((affectedRows) => {
            callback(null, { affectedRows });
        })
        .catch((err) => callback(err, null));
};


// Update Fine
const updateFine = (loanId, fine, callback) => {
    knex("loans")
        .where("id", loanId)
        .update({ fine })
        .then((affectedRows) => {
            callback(null, { affectedRows });
        })
        .catch((err) => callback(err, null));
};


// Get Loan By ID
const getLoanById = (loanId, callback) => {
    knex("loans")
        .where("id", loanId)
        .select("*")
        .then((result) => {
            callback(null, result);
        })
        .catch((err) => callback(err, null));
};


// Loan History
const getLoanHistory = (callback) => {
    knex("loans")
        .select(
            "loans.id",
            knex.raw("members.name AS member_name"),
            knex.raw("books.title AS book_title"),
            "loans.issue_date",
            "loans.due_date",
            "loans.return_date",
            "loans.fine",
            "loans.status"
        )
        .join("members", "loans.member_id", "members.id")
        .join("books", "loans.book_id", "books.id")
        .orderBy("loans.id", "desc")
        .then((result) => {
            callback(null, result);
        })
        .catch((err) => callback(err, null));
};

const getMemberLoanHistory = (memberId, callback) => {
    knex("loans")
        .select(
            "loans.id",
            knex.raw("books.title AS book_title"),
            "loans.issue_date",
            "loans.return_date",
            "loans.status",
            "loans.fine"
        )
        .join("books", "loans.book_id", "books.id")
        .where("loans.member_id", memberId)
        .orderBy("loans.id", "desc")
        .then((result) => {
            callback(null, result);
        })
        .catch((err) => callback(err, null));
};

module.exports = {
    issueBook,
    returnBook,
    getLoanById,
    getLoanHistory,
    updateFine,
    getMemberLoanHistory
};
